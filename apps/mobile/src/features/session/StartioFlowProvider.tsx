import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import {
  createAiProcessingConsent,
  decideAiProcessingConsent,
  type AiConsentDecision,
  type AiProcessingConsent,
} from '@/core/coaching/aiConsent';
import {
  createHttpPlanClient,
  resolvePlan,
  type PlanClient,
} from '@/core/coaching/remotePlan';
import type { PlanAllowed, PlanResult } from '@/core/coaching/result';
import { createEventLedger, type BehaviorEvent } from '@/core/events/event';
import {
  appendHistory,
  appendHistoryEvents,
  createHistoryArchive,
  createHistoryRecord,
  type HistoryArchive,
} from '@/core/events/historyProjection';
import {
  completeWithCheck,
  createCompletionState,
  findCompletionRecord,
  type CompletionState,
} from '@/core/session/completion';
import { createSessionId } from '@/core/session/ids';
import {
  createSessionSnapshot,
  normalizeRestoredTimerState,
} from '@/core/session/session';
import {
  abandonTimer,
  completeCurrentStep,
  createTimerState,
  getActiveElapsedMs,
  pauseTimer,
  restartAbandonedTimer,
  resumeTimer,
  startTimer,
  type TimerState,
} from '@/core/session/timerMachine';
import { createSessionRepository } from '@/core/storage/sessionRepository';
import { createHistoryRepository } from '@/core/storage/historyRepository';
import { createAiConsentRepository } from '@/core/storage/aiConsentRepository';
import { createExpoAiConsentStorage } from '@/core/storage/expoAiConsentStorage';
import { createExpoFileSessionStorage } from '@/core/storage/storage';
import { createExpoProofFileStorage } from '@/core/storage/expoProofFileStorage';
import { createLocalDataClearer } from '@/core/storage/clearAll';
import {
  createProofFileRepository,
  type ProofPhotoSource,
} from '@/core/storage/proofFileRepository';

interface StartioFlowValue {
  result: PlanResult | null;
  events: readonly BehaviorEvent[];
  timerState: TimerState | null;
  completionState: CompletionState;
  historyArchive: HistoryArchive;
  aiConsent: AiProcessingConsent;
  isHydrated: boolean;
  hasResumableSession: boolean;
  isRemotePlanningAvailable: boolean;
  shouldRequestAiConsent: boolean;
  decideAiConsent(
    decision: Exclude<AiConsentDecision, 'unknown'>,
  ): Promise<void>;
  withdrawAiConsent(): Promise<void>;
  clearAllLocalData(): Promise<void>;
  submitTask(rawInput: string): Promise<PlanResult>;
  startCurrentTimer(now?: number): void;
  pauseCurrentTimer(now?: number): void;
  resumeCurrentTimer(now?: number): void;
  completeCurrentTimer(now?: number): void;
  abandonCurrentTimer(now?: number): void;
  resumeCurrentSession(): void;
  submitCheckCompletion(photo?: ProofPhotoSource | null): Promise<
    | 'completed'
    | 'already_completed'
    | 'not_eligible'
    | 'photo_persistence_failed'
    | 'persistence_failed'
  >;
  reset(): void;
}

const StartioFlowContext = createContext<StartioFlowValue | null>(null);

export function StartioFlowProvider({ children }: PropsWithChildren) {
  const [result, setResult] = useState<PlanResult | null>(null);
  const [events, setEvents] = useState<readonly BehaviorEvent[]>([]);
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [completionState, setCompletionState] = useState(createCompletionState);
  const [historyArchive, setHistoryArchive] = useState(createHistoryArchive);
  const [aiConsent, setAiConsent] = useState(createAiProcessingConsent);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasResumableSession, setHasResumableSession] = useState(false);
  const sessionIdRef = useRef(createSessionId());
  const ledgerRef = useRef(createEventLedger());
  const repositoryRef = useRef(
    createSessionRepository(createExpoFileSessionStorage()),
  );
  const historyRepositoryRef = useRef(createHistoryRepository());
  const aiConsentRepositoryRef = useRef(
    createAiConsentRepository(createExpoAiConsentStorage()),
  );
  const proofFileRepositoryRef = useRef(
    createProofFileRepository(createExpoProofFileStorage()),
  );
  const resultRef = useRef<PlanResult | null>(null);
  const eventsRef = useRef<readonly BehaviorEvent[]>([]);
  const timerStateRef = useRef<TimerState | null>(null);
  const completionStateRef = useRef<CompletionState>(createCompletionState());
  const historyArchiveRef = useRef<HistoryArchive>(createHistoryArchive());
  const aiConsentRef = useRef<AiProcessingConsent>(
    createAiProcessingConsent(),
  );
  const planClientRef = useRef<PlanClient | null>(
    (() => {
      const apiBase = process.env.EXPO_PUBLIC_STARTIO_API_BASE_URL?.trim()
        .replace(/\/$/, '');
      return apiBase
        ? createHttpPlanClient({ endpoint: `${apiBase}/api/coach/plan` })
        : null;
    })(),
  );

  const updateResult = useCallback((nextResult: PlanResult | null) => {
    resultRef.current = nextResult;
    setResult(nextResult);
  }, []);

  const updateEvents = useCallback((nextEvents: readonly BehaviorEvent[]) => {
    eventsRef.current = nextEvents;
    setEvents(nextEvents);
  }, []);

  const updateTimerState = useCallback((nextState: TimerState | null) => {
    timerStateRef.current = nextState;
    setTimerState(nextState);
  }, []);

  const updateCompletionState = useCallback((nextState: CompletionState) => {
    completionStateRef.current = nextState;
    setCompletionState(nextState);
  }, []);

  const updateHistoryArchive = useCallback((nextArchive: HistoryArchive) => {
    historyArchiveRef.current = nextArchive;
    setHistoryArchive(nextArchive);
  }, []);

  const getPlan = useCallback(() => {
    return result?.kind === 'plan_allowed' ? result.plan : null;
  }, [result]);

  const persistCurrentSession = useCallback(() => {
    const currentResult = resultRef.current;
    const currentTimerState = timerStateRef.current;
    if (currentResult?.kind !== 'plan_allowed' || !currentTimerState) {
      return Promise.resolve();
    }

    return repositoryRef.current.save(
      createSessionSnapshot({
        sessionId: sessionIdRef.current,
        result: currentResult,
        timerState: currentTimerState,
        completionState: completionStateRef.current,
        events: eventsRef.current,
      }),
    );
  }, []);

  const persistWithoutBlocking = useCallback(() => {
    void persistCurrentSession().catch(() => {
      // A local write failure must not interrupt the user's active timer.
    });
  }, [persistCurrentSession]);

  useEffect(() => {
    let active = true;

    void Promise.all([
      repositoryRef.current.load(),
      historyRepositoryRef.current.load(),
      aiConsentRepositoryRef.current.load(),
    ])
      .then(async ([snapshot, storedHistory, storedConsent]) => {
        if (!active) {
          return;
        }

        if (storedConsent) {
          aiConsentRef.current = storedConsent;
          setAiConsent(storedConsent);
        }
        let nextHistory = storedHistory ?? createHistoryArchive();
        if (!snapshot) {
          updateHistoryArchive(nextHistory);
          return;
        }

        const restoredAt = Date.now();
        const restoredTimerState = normalizeRestoredTimerState(
          snapshot.product.timerState,
          restoredAt,
        );
        sessionIdRef.current = snapshot.sessionId;
        ledgerRef.current.hydrate(snapshot.analytics.events);
        ledgerRef.current.appendLifecycleEvent(
          snapshot.sessionId,
          snapshot.product.result.plan,
          'app_opened',
          restoredTimerState.completedStepCount,
        );
        ledgerRef.current.appendLifecycleEvent(
          snapshot.sessionId,
          snapshot.product.result.plan,
          'session_resumed',
          restoredTimerState.completedStepCount,
        );
        ledgerRef.current.appendLifecycleEvent(
          snapshot.sessionId,
          snapshot.product.result.plan,
          'reentry_prompt_created',
          restoredTimerState.completedStepCount,
        );

        updateResult(snapshot.product.result);
        updateTimerState(restoredTimerState);
        updateCompletionState(snapshot.product.completionState);
        updateEvents(ledgerRef.current.readAll());
        setHasResumableSession(true);

        const completion = snapshot.product.completionState.records.find(
          (record) =>
            record.taskId === snapshot.product.result.plan.taskId &&
            record.planId === snapshot.product.result.plan.planId,
        );
        if (completion) {
          const historyRecord = createHistoryRecord({
            sessionId: snapshot.sessionId,
            plan: snapshot.product.result.plan,
            timerState: restoredTimerState,
            completion,
            events: ledgerRef.current.readAll(),
          });
          if (historyRecord) {
            nextHistory = appendHistory(
              nextHistory,
              historyRecord,
              ledgerRef.current.readAll(),
            );
            void historyRepositoryRef.current.save(nextHistory).catch(() => {
              // The completed session remains the recovery source for a later retry.
            });
          }
        }
        updateHistoryArchive(nextHistory);
      })
      .finally(() => {
        if (active) {
          setIsHydrated(true);
        }
      });

    return () => {
      active = false;
    };
  }, [
    updateCompletionState,
    updateEvents,
    updateHistoryArchive,
    updateResult,
    updateTimerState,
  ]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    persistWithoutBlocking();
  }, [
    completionState,
    events,
    isHydrated,
    persistWithoutBlocking,
    result,
    timerState,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'inactive' || nextState === 'background') {
        persistWithoutBlocking();
      }
    });

    return () => subscription.remove();
  }, [persistWithoutBlocking]);

  const decideAiConsent = useCallback(
    async (decision: Exclude<AiConsentDecision, 'unknown'>) => {
      const nextConsent = decideAiProcessingConsent(decision);
      await aiConsentRepositoryRef.current.save(nextConsent);
      aiConsentRef.current = nextConsent;
      setAiConsent(nextConsent);
    },
    [],
  );

  const withdrawAiConsent = useCallback(async () => {
    const nextConsent = decideAiProcessingConsent('declined');
    await aiConsentRepositoryRef.current.save(nextConsent);
    aiConsentRef.current = nextConsent;
    setAiConsent(nextConsent);
  }, []);

  const clearAllLocalData = useCallback(async () => {
    const clearer = createLocalDataClearer([
      {
        name: 'session',
        clear: () => repositoryRef.current.clear(),
      },
      {
        name: 'history',
        clear: () => historyRepositoryRef.current.clear(),
      },
      {
        name: 'proof_files',
        clear: () => proofFileRepositoryRef.current.clear(),
      },
      {
        name: 'ai_consent',
        clear: () => aiConsentRepositoryRef.current.clear(),
      },
    ]);

    await clearer.clearAll();

    const emptyHistory = createHistoryArchive();
    const emptyConsent = createAiProcessingConsent();
    updateResult(null);
    updateTimerState(null);
    updateCompletionState(createCompletionState());
    ledgerRef.current.clear();
    updateEvents([]);
    updateHistoryArchive(emptyHistory);
    aiConsentRef.current = emptyConsent;
    setAiConsent(emptyConsent);
    sessionIdRef.current = createSessionId();
    setHasResumableSession(false);
  }, [
    updateCompletionState,
    updateEvents,
    updateHistoryArchive,
    updateResult,
    updateTimerState,
  ]);

  const submitTask = useCallback(async (rawInput: string) => {
    const resolution = await resolvePlan({
      rawInput,
      consentDecision: aiConsentRef.current.decision,
      client: planClientRef.current,
    });
    const nextResult = resolution.result;

    if (nextResult.kind === 'plan_allowed') {
      const allowedResult: PlanAllowed = nextResult;
      ledgerRef.current.appendPlanEvents(
        sessionIdRef.current,
        allowedResult.plan,
        allowedResult.source,
        resolution.failure,
      );
      ledgerRef.current.appendLifecycleEvent(
        sessionIdRef.current,
        allowedResult.plan,
        'session_started',
        0,
      );
      updateEvents(ledgerRef.current.readAll());
      updateTimerState(createTimerState());
      updateCompletionState(createCompletionState());
      setHasResumableSession(false);
    }

    updateResult(nextResult);
    return nextResult;
  }, [updateCompletionState, updateEvents, updateResult, updateTimerState]);

  const appendTimerEvent = useCallback(
    (
      eventType: 'timer_started' | 'timer_paused' | 'timer_completed' | 'timer_abandoned',
      previousState: TimerState,
      nextState: TimerState,
      now: number,
    ) => {
      const plan = getPlan();
      if (!plan) {
        return;
      }

      const step = plan.steps[previousState.currentStepOrder - 1];
      const activeTimerSeconds = Math.max(
        0,
        Math.round(getActiveElapsedMs(previousState, now) / 1000),
      );

      ledgerRef.current.appendTimerEvent(sessionIdRef.current, plan, step, eventType, {
        activeTimerSeconds,
        lastCompletedStepIndex: nextState.completedStepCount,
        completionStatus:
          nextState.status === 'completed'
            ? 'completed'
            : nextState.status === 'abandoned'
              ? 'abandoned'
              : 'in_progress',
      });
      updateEvents(ledgerRef.current.readAll());
    },
    [getPlan, updateEvents],
  );

  const transitionTimer = useCallback(
    (
      transition: (state: TimerState, now: number) => TimerState,
      eventType: 'timer_started' | 'timer_paused' | 'timer_abandoned',
      now: number = Date.now(),
    ) => {
      const current = timerStateRef.current;
      if (!current) {
        return;
      }

      const next = transition(current, now);
      if (next === current) {
        return;
      }

      updateTimerState(next);
      appendTimerEvent(eventType, current, next, now);
    },
    [appendTimerEvent, updateTimerState],
  );

  const startCurrentTimer = useCallback(
    (now: number = Date.now()) => transitionTimer(startTimer, 'timer_started', now),
    [transitionTimer],
  );

  const pauseCurrentTimer = useCallback(
    (now: number = Date.now()) => transitionTimer(pauseTimer, 'timer_paused', now),
    [transitionTimer],
  );

  const resumeCurrentTimer = useCallback(
    (now: number = Date.now()) => {
      const current = timerStateRef.current;
      if (!current) {
        return;
      }
      const next = resumeTimer(current, now);
      if (next !== current) {
        updateTimerState(next);
      }
    },
    [updateTimerState],
  );

  const completeCurrentTimer = useCallback(
    (now: number = Date.now()) => {
      const current = timerStateRef.current;
      const plan = getPlan();
      if (!current || !plan) {
        return;
      }

      const next = completeCurrentStep(current, plan, now);
      if (next === current) {
        return;
      }

      updateTimerState(next);
      appendTimerEvent('timer_completed', current, next, now);
    },
    [appendTimerEvent, getPlan, updateTimerState],
  );

  const abandonCurrentTimer = useCallback(
    (now: number = Date.now()) => transitionTimer(abandonTimer, 'timer_abandoned', now),
    [transitionTimer],
  );

  const resumeCurrentSession = useCallback(() => {
    const currentResult = resultRef.current;
    const currentTimerState = timerStateRef.current;
    if (currentResult?.kind !== 'plan_allowed' || !currentTimerState) {
      return;
    }

    if (currentTimerState.status === 'abandoned') {
      updateTimerState(restartAbandonedTimer(currentTimerState));
      ledgerRef.current.appendLifecycleEvent(
        sessionIdRef.current,
        currentResult.plan,
        'task_restarted',
        currentTimerState.completedStepCount,
      );
      updateEvents(ledgerRef.current.readAll());
    }

    setHasResumableSession(false);
  }, [updateEvents, updateTimerState]);

  const submitCheckCompletion = useCallback(async (photoSource?: ProofPhotoSource | null) => {
    const currentResult = resultRef.current;
    const currentTimerState = timerStateRef.current;
    if (currentResult?.kind !== 'plan_allowed' || !currentTimerState) {
      return 'not_eligible' as const;
    }

    const existing = findCompletionRecord(
      completionStateRef.current,
      currentResult.plan,
    );
    if (existing) {
      return 'already_completed' as const;
    }
    if (
      currentTimerState.status !== 'completed' ||
      currentTimerState.completedStepCount !== 3
    ) {
      return 'not_eligible' as const;
    }

    let proofPhoto = null;
    if (photoSource) {
      try {
        proofPhoto = await proofFileRepositoryRef.current.save(photoSource);
      } catch {
        return 'photo_persistence_failed' as const;
      }
    }

    const transaction = completeWithCheck({
      state: completionStateRef.current,
      plan: currentResult.plan,
      timerState: currentTimerState,
      photo: proofPhoto,
    });
    if (transaction.outcome !== 'completed') {
      if (proofPhoto) {
        void proofFileRepositoryRef.current.delete(proofPhoto).catch(() => undefined);
      }
      return transaction.outcome;
    }

    const nextLedger = createEventLedger();
    nextLedger.hydrate(eventsRef.current);
    nextLedger.appendCompletionEvents(sessionIdRef.current, currentResult.plan);
    const nextEvents = nextLedger.readAll();
    const historyRecord = createHistoryRecord({
      sessionId: sessionIdRef.current,
      plan: currentResult.plan,
      timerState: currentTimerState,
      completion: transaction.record,
      events: nextEvents,
    });
    if (!historyRecord) {
      return 'not_eligible' as const;
    }
    const nextHistory = appendHistory(
      historyArchiveRef.current,
      historyRecord,
      nextEvents,
    );

    let sessionSaved = false;
    try {
      await repositoryRef.current.save(
        createSessionSnapshot({
          sessionId: sessionIdRef.current,
          result: currentResult,
          timerState: currentTimerState,
          completionState: transaction.state,
          events: nextEvents,
        }),
      );
      sessionSaved = true;
      await historyRepositoryRef.current.save(nextHistory);
    } catch {
      if (proofPhoto && !sessionSaved) {
        void proofFileRepositoryRef.current.delete(proofPhoto).catch(() => undefined);
      }
      return 'persistence_failed' as const;
    }

    ledgerRef.current.hydrate(nextEvents);
    updateCompletionState(transaction.state);
    updateEvents(nextEvents);
    updateHistoryArchive(nextHistory);
    return 'completed' as const;
  }, [updateCompletionState, updateEvents, updateHistoryArchive]);

  const reset = useCallback(() => {
    const nextHistory = appendHistoryEvents(
      historyArchiveRef.current,
      eventsRef.current,
    );
    updateHistoryArchive(nextHistory);
    updateResult(null);
    updateTimerState(null);
    updateCompletionState(createCompletionState());
    ledgerRef.current.clear();
    updateEvents([]);
    sessionIdRef.current = createSessionId();
    setHasResumableSession(false);
    void historyRepositoryRef.current
      .save(nextHistory)
      .then(() => repositoryRef.current.clear())
      .catch(() => {
        // Keep the session recovery source when history archival cannot be confirmed.
      });
  }, [
    updateCompletionState,
    updateEvents,
    updateHistoryArchive,
    updateResult,
    updateTimerState,
  ]);

  const value = useMemo(
    () => ({
      result,
      events,
      timerState,
      completionState,
      historyArchive,
      aiConsent,
      isHydrated,
      hasResumableSession,
      isRemotePlanningAvailable: planClientRef.current !== null,
      shouldRequestAiConsent:
        planClientRef.current !== null && aiConsent.decision === 'unknown',
      decideAiConsent,
      withdrawAiConsent,
      clearAllLocalData,
      submitTask,
      startCurrentTimer,
      pauseCurrentTimer,
      resumeCurrentTimer,
      completeCurrentTimer,
      abandonCurrentTimer,
      resumeCurrentSession,
      submitCheckCompletion,
      reset,
    }),
    [
      abandonCurrentTimer,
      completeCurrentTimer,
      completionState,
      clearAllLocalData,
      decideAiConsent,
      events,
      hasResumableSession,
      historyArchive,
      aiConsent,
      isHydrated,
      pauseCurrentTimer,
      reset,
      result,
      resumeCurrentSession,
      resumeCurrentTimer,
      startCurrentTimer,
      submitTask,
      submitCheckCompletion,
      timerState,
      withdrawAiConsent,
    ],
  );

  return <StartioFlowContext.Provider value={value}>{children}</StartioFlowContext.Provider>;
}

export function useStartioFlow(): StartioFlowValue {
  const value = useContext(StartioFlowContext);

  if (!value) {
    throw new Error('useStartioFlow must be used inside StartioFlowProvider');
  }

  return value;
}
