import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeTokens, type ThemeTokens } from '@/design/tokens';
import { useStepFeedback } from '@/features/timer/useStepFeedback';
import { useTimer } from '@/features/timer/useTimer';

const DIAL_TICKS = Array.from({ length: 48 }, (_, index) => index);

function formatClock(milliseconds: number, prefix = ''): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${prefix}${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function triggerHaptic(feedback: Promise<void>) {
  void feedback.catch(() => undefined);
}

function TimerDial({
  progress,
  displayTime,
  accessibilityLabel,
  urgency,
  tokens,
}: {
  progress: number;
  displayTime: string;
  accessibilityLabel: string;
  urgency: 'normal' | 'urgent' | 'overtime';
  tokens: ThemeTokens;
}) {
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const size = tokens.isLargeText ? 268 : 244;
  const center = size / 2;
  const radius = size / 2 - 11;
  const activeTickCount = Math.round(progress * DIAL_TICKS.length);
  const activeColor =
    urgency === 'overtime'
      ? tokens.colors.destructive
      : urgency === 'urgent'
        ? tokens.colors.cautionText
        : tokens.colors.focus;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(progress * 100),
      }}
      style={[
        styles.dial,
        { width: size, height: size, borderRadius: center },
        urgency === 'urgent' && styles.dialUrgent,
        urgency === 'overtime' && styles.dialOvertime,
      ]}
    >
      {DIAL_TICKS.map((tick) => {
        const angle = (tick / DIAL_TICKS.length) * Math.PI * 2;
        const rotation = `${(tick / DIAL_TICKS.length) * 360}deg`;
        return (
          <View
            key={tick}
            style={[
              styles.dialTick,
              {
                backgroundColor:
                  tick < activeTickCount ? activeColor : tokens.colors.border,
                left: center + radius * Math.sin(angle) - 1.5,
                top: center - radius * Math.cos(angle) - 6,
                transform: [{ rotate: rotation }],
              },
            ]}
          />
        );
      })}
      <Text style={[
        styles.timerText,
        urgency === 'urgent' && styles.timerTextUrgent,
        urgency === 'overtime' && styles.timerTextOvertime,
      ]}>
        {displayTime}
      </Text>
    </View>
  );
}

export function TimerScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const timer = useTimer();
  const step = timer.plan && timer.timerState
    ? timer.plan.steps[timer.timerState.currentStepOrder - 1]
    : null;
  const stepFeedback = useStepFeedback(
    timer.timerState?.currentStepOrder ?? 1,
    timer.timerState?.status ?? 'idle',
  );
  const urgencyFeedbackRef = useRef<string | null>(null);

  useEffect(() => {
    if (!timer.plan || !timer.timerState) {
      router.replace('/');
    }
  }, [router, timer.plan, timer.timerState]);

  const timerStatus = timer.timerState?.status;
  const isTiming = timerStatus === 'running' || timerStatus === 'paused';
  const isOvertime = isTiming && timer.overtimeMs > 0;
  const urgentThresholdMs = Math.min(10_000, (step?.timerSeconds ?? 0) * 250);
  const isUrgent =
    timerStatus === 'running' &&
    !isOvertime &&
    timer.remainingMs > 0 &&
    timer.remainingMs <= urgentThresholdMs;
  const urgency = isOvertime ? 'overtime' : isUrgent ? 'urgent' : 'normal';
  const displayTime = isOvertime
    ? formatClock(timer.overtimeMs, '+')
    : formatClock(timer.remainingMs);
  const timerAccessibilityLabel = isOvertime
    ? `예상 시간보다 ${Math.ceil(timer.overtimeMs / 1000)}초 더 진행 중`
    : `${Math.ceil(timer.remainingMs / 1000)}초 남음`;

  useEffect(() => {
    if (timer.timerState?.status !== 'running') {
      urgencyFeedbackRef.current = null;
      return;
    }

    const feedbackKey =
      urgency === 'overtime'
        ? `${timer.timerState.currentStepOrder}:overtime`
        : urgency === 'urgent'
          ? `${timer.timerState.currentStepOrder}:urgent`
          : null;
    if (!feedbackKey || urgencyFeedbackRef.current === feedbackKey) {
      return;
    }

    urgencyFeedbackRef.current = feedbackKey;
    triggerHaptic(
      urgency === 'overtime'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    );
  }, [
    timer.timerState?.currentStepOrder,
    timer.timerState?.status,
    urgency,
  ]);

  if (!timer.plan || !timer.timerState || !step) {
    return null;
  }

  const handlePrimaryAction = () => {
    if (timer.timerState?.status === 'idle') {
      triggerHaptic(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
      timer.startCurrentTimer();
    } else if (timer.timerState?.status === 'running') {
      triggerHaptic(
        timer.timerState.currentStepOrder === 3
          ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
      );
      timer.completeCurrentTimer();
    } else if (timer.timerState?.status === 'paused') {
      triggerHaptic(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
      timer.resumeCurrentTimer();
    } else if (timer.timerState?.status === 'completed') {
      router.push('/done');
    } else {
      timer.reset();
      router.replace('/');
    }
  };

  const primaryLabel =
    timer.timerState.status === 'idle'
      ? `${timer.timerState.currentStepOrder}단계 시작`
      : timer.timerState.status === 'running'
        ? '이 단계 완료'
        : timer.timerState.status === 'paused'
          ? '계속하기'
          : timer.timerState.status === 'completed'
            ? '완료 확인'
            : '다른 일 시작하기';

  const isTerminal =
    timer.timerState.status === 'completed' || timer.timerState.status === 'abandoned';

  const confirmAbandon = () => {
    triggerHaptic(Haptics.selectionAsync());
    Alert.alert(
      '진행을 끝낼까요?',
      '완료한 단계는 기록되지 않아요.',
      [
        { text: '계속하기', style: 'cancel' },
        {
          text: '끝내기',
          style: 'destructive',
          onPress: () => {
            timer.abandonCurrentTimer();
            router.replace('/');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} testID="startio-timer-screen">
      <View style={styles.page}>
        <View style={styles.topBar}>
          <Text
            accessibilityLabel={
              timer.timerState.status === 'completed'
                ? '3단계 모두 완료'
                : `전체 3단계 중 ${timer.timerState.currentStepOrder}단계`
            }
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 3,
              now: timer.timerState.completedStepCount,
            }}
            style={styles.progressText}
          >
            {timer.timerState.status === 'completed'
              ? '3단계 완료'
              : `${timer.timerState.currentStepOrder} / 3`}
          </Text>
          {!isTerminal ? (
            <Pressable
              accessibilityHint="현재 진행을 끝내고 시작 화면으로 돌아갑니다."
              accessibilityRole="button"
              onPress={confirmAbandon}
              style={({ pressed }) => [styles.abandonButton, pressed && styles.pressedText]}
            >
              <Text style={styles.abandonText}>나가기</Text>
            </Pressable>
          ) : null}
        </View>

        {stepFeedback.message ? (
          <Animated.View
            accessibilityElementsHidden
            pointerEvents="none"
            style={[styles.stepFeedback, stepFeedback.animatedStyle]}
          >
            <Text style={styles.stepFeedbackText}>{stepFeedback.message}</Text>
          </Animated.View>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>
            {timer.timerState.status === 'completed'
              ? '모든 행동을 마쳤어요'
              : timer.timerState.status === 'abandoned'
                ? '여기서 멈췄어요'
                : `${timer.timerState.currentStepOrder}단계`}
          </Text>
          <Text accessibilityRole="header" style={styles.action}>
            {isTerminal ? timer.plan.taskTitle : step.action}
          </Text>
          {!isTerminal ? (
            <>
              <TimerDial
                accessibilityLabel={timerAccessibilityLabel}
                displayTime={displayTime}
                progress={timer.progress}
                tokens={tokens}
                urgency={urgency}
              />
              {isOvertime ? (
                <Text accessibilityLiveRegion="polite" style={styles.overtimeText}>
                  {`${Math.ceil(timer.overtimeMs / 1000)}초 더 진행 중`}
                </Text>
              ) : timer.timerState.status === 'paused' ? (
                <Text style={styles.pausedText}>일시정지</Text>
              ) : null}
              <Text style={styles.condition}>{step.completionCondition}</Text>
            </>
          ) : (
            <Text style={styles.condition}>
              {timer.timerState.status === 'completed'
                ? '세 단계를 모두 마쳤어요.'
                : `${timer.timerState.completedStepCount}단계까지 진행했어요.`}
            </Text>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            accessibilityRole="button"
            onPress={handlePrimaryAction}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && (
                tokens.reduceMotion
                  ? styles.primaryButtonPressedReduced
                  : styles.primaryButtonPressed
              ),
            ]}
          >
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          </Pressable>
          {timer.timerState.status === 'running' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                triggerHaptic(Haptics.selectionAsync());
                timer.pauseCurrentTimer();
              }}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>일시정지</Text>
            </Pressable>
          ) : timer.timerState.status === 'paused' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                triggerHaptic(
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
                );
                timer.completeCurrentTimer();
              }}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>이 단계 완료</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: tokens.colors.background,
    },
    page: {
      flex: 1,
      paddingHorizontal: 20,
      position: 'relative',
    },
    topBar: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    progressText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.label,
      fontVariant: ['tabular-nums'],
    },
    abandonButton: {
      minHeight: tokens.metrics.touchTarget,
      justifyContent: 'center',
      paddingLeft: tokens.spacing.md,
    },
    abandonText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.label,
    },
    pressedText: {
      opacity: 0.55,
    },
    stepFeedback: {
      position: 'absolute',
      top: 68,
      alignSelf: 'center',
      minHeight: 32,
      paddingHorizontal: tokens.spacing.md,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: tokens.colors.selection,
    },
    stepFeedbackText: {
      color: tokens.colors.focus,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.caption,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: tokens.spacing.md,
      paddingHorizontal: tokens.spacing.xs,
      paddingBottom: tokens.spacing.xl,
    },
    eyebrow: {
      color: tokens.colors.focus,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.label,
    },
    action: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      maxWidth: 330,
      fontSize: 23,
      lineHeight: 31,
      textAlign: 'center',
      letterSpacing: -0.4,
    },
    dial: {
      marginTop: tokens.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: tokens.colors.surface,
    },
    dialUrgent: {
      backgroundColor: tokens.colors.cautionSurface,
    },
    dialOvertime: {
      borderWidth: 1,
      borderColor: tokens.colors.destructive,
    },
    dialTick: {
      position: 'absolute',
      width: 3,
      height: 12,
      borderRadius: 2,
    },
    timerText: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.isLargeText ? 58 : 62,
      lineHeight: tokens.isLargeText ? 70 : 74,
      fontVariant: ['tabular-nums'],
      letterSpacing: -2,
    },
    timerTextUrgent: {
      color: tokens.colors.cautionText,
    },
    timerTextOvertime: {
      color: tokens.colors.destructive,
    },
    overtimeText: {
      color: tokens.colors.destructive,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.label,
    },
    pausedText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.label,
    },
    condition: {
      maxWidth: 300,
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.body,
      lineHeight: 26,
      textAlign: 'center',
    },
    bottomBar: {
      paddingTop: tokens.spacing.sm,
      paddingBottom: tokens.spacing.md,
      gap: tokens.spacing.xs,
    },
    primaryButton: {
      minHeight: tokens.metrics.primaryActionMinHeight,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.sm,
      backgroundColor: tokens.colors.primary,
    },
    primaryButtonPressed: {
      backgroundColor: tokens.colors.primaryPressed,
      transform: [{ scale: 0.98 }],
    },
    primaryButtonPressedReduced: {
      borderWidth: 2,
      borderColor: tokens.colors.focus,
      backgroundColor: tokens.colors.primaryPressed,
    },
    primaryButtonText: {
      color: tokens.colors.primaryText,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.body,
    },
    secondaryButton: {
      minHeight: tokens.metrics.touchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: tokens.radius.md,
    },
    secondaryButtonPressed: {
      backgroundColor: tokens.colors.surfaceMuted,
    },
    secondaryButtonText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.label,
    },
  });
}
