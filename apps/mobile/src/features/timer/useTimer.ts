import { useEffect, useMemo, useState } from 'react';

import {
  getActiveElapsedMs,
  getOvertimeMs,
  getRemainingMs,
  getStepProgress,
} from '@/core/session/timerMachine';
import { useStartioFlow } from '@/features/session/StartioFlowProvider';

export function useTimer() {
  const flow = useStartioFlow();
  const [now, setNow] = useState(Date.now());
  const plan = flow.result?.kind === 'plan_allowed' ? flow.result.plan : null;

  useEffect(() => {
    if (flow.timerState?.status !== 'running') {
      return;
    }

    const interval = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(interval);
  }, [flow.timerState?.status]);

  const timing = useMemo(() => {
    if (!plan || !flow.timerState) {
      return {
        elapsedMs: 0,
        overtimeMs: 0,
        progress: 0,
        remainingMs: 0,
      };
    }
    return {
      elapsedMs: getActiveElapsedMs(flow.timerState, now),
      overtimeMs: getOvertimeMs(flow.timerState, plan, now),
      progress: getStepProgress(flow.timerState, plan, now),
      remainingMs: getRemainingMs(flow.timerState, plan, now),
    };
  }, [flow.timerState, now, plan]);

  return {
    ...flow,
    plan,
    ...timing,
  };
}
