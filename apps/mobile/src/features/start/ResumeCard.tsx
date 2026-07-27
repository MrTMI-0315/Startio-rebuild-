import { useMemo } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PlanAllowed } from '@/core/coaching/result';
import {
  getRemainingMs,
  type TimerState,
} from '@/core/session/timerMachine';
import { useThemeTokens, type ThemeTokens } from '@/design/tokens';

interface ResumeCardProps {
  result: PlanAllowed;
  timerState: TimerState;
  onResume(): void;
  onStartNew(): void;
}

function formatRemaining(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}초 남음`;
  }

  return `${minutes}분 ${seconds.toString().padStart(2, '0')}초 남음`;
}

export function ResumeCard({
  result,
  timerState,
  onResume,
  onStartNew,
}: ResumeCardProps) {
  const tokens = useThemeTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const step = result.plan.steps[timerState.currentStepOrder - 1];
  const isRestart = timerState.status === 'abandoned';
  const isCompleted = timerState.status === 'completed';
  const remainingLabel = formatRemaining(
    getRemainingMs(timerState, result.plan, Date.now()),
  );
  const statusLabel = isRestart
    ? '중단됨'
    : timerState.status === 'paused'
      ? '일시정지'
      : timerState.status === 'running'
        ? '진행 중'
        : '시작 전';
  const progressDescription = isCompleted
    ? '완료를 저장할 수 있어요.'
    : isRestart
      ? `${timerState.completedStepCount}단계 완료`
      : `${remainingLabel} · ${timerState.completedStepCount}단계 완료`;

  return (
    <SafeAreaView style={styles.safeArea} testID="startio-resume-screen">
      <ScrollView
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <Image
            accessible={false}
            source={require('../../../assets/images/startio-brand-mark.png')}
            style={styles.brandMark}
          />
          <Text accessibilityRole="header" style={styles.brandText}>
            startio
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.eyebrow}>
            {isCompleted
              ? '완료 저장이 남아 있어요'
              : isRestart
                ? '멈춘 단계부터 다시 시작할 수 있어요'
                : timerState.status === 'paused'
                  ? '잠시 멈춘 일이 있어요'
                  : '하던 일이 있어요'}
          </Text>
          <Text accessibilityRole="header" style={styles.taskTitle}>
            {result.plan.taskTitle}
          </Text>
          <View style={styles.progressCard}>
            <View style={styles.progressMeta}>
              <Text style={styles.progressLabel}>
                {timerState.currentStepOrder} / 3단계
              </Text>
              {!isCompleted ? (
                <Text style={styles.statusLabel}>{statusLabel}</Text>
              ) : null}
            </View>
            <Text style={styles.stepAction}>
              {step.action}
            </Text>
            <Text style={styles.progressDescription}>
              {progressDescription}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityHint="저장된 현재 단계의 타이머 화면으로 이동합니다."
            accessibilityRole="button"
            onPress={onResume}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && (
                tokens.reduceMotion
                  ? styles.primaryButtonPressedReduced
                  : styles.primaryButtonPressed
              ),
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isCompleted
                ? '완료 저장'
                : isRestart
                  ? '다시 시작'
                  : '이어하기'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityHint="저장된 진행 상황을 지우고 새로운 일을 입력합니다."
            accessibilityRole="button"
            onPress={() => {
              Alert.alert(
                '새 일을 시작할까요?',
                '현재 진행 내용은 사라져요.',
                [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '새 일 시작',
                    style: 'destructive',
                    onPress: onStartNew,
                  },
                ],
              );
            }}
            style={({ pressed }) => [styles.textButton, pressed && styles.textButtonPressed]}
          >
            <Text style={styles.textButtonLabel}>새 일 입력</Text>
          </Pressable>
        </View>
      </ScrollView>
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
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingBottom: tokens.spacing.md,
    },
    brandRow: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.sm,
    },
    brandMark: {
      width: 44,
      height: 44,
      borderRadius: 12,
    },
    brandText: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.brand,
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: -0.8,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      gap: tokens.spacing.sm,
      paddingBottom: tokens.spacing.lg,
    },
    eyebrow: {
      color: tokens.colors.focus,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.label,
    },
    taskTitle: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: 32,
      lineHeight: 39,
      letterSpacing: -0.8,
    },
    progressCard: {
      marginTop: tokens.spacing.md,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: tokens.colors.border,
      backgroundColor: tokens.colors.surface,
      padding: tokens.spacing.md,
      gap: tokens.spacing.sm,
    },
    progressMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: tokens.spacing.sm,
    },
    progressLabel: {
      color: tokens.colors.focus,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.caption,
      fontVariant: ['tabular-nums'],
    },
    statusLabel: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.caption,
      fontVariant: ['tabular-nums'],
    },
    stepAction: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.body,
      lineHeight: 26,
    },
    progressDescription: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.label,
      lineHeight: 22,
    },
    actions: {
      gap: tokens.spacing.xs,
    },
    primaryButton: {
      minHeight: tokens.metrics.primaryActionMinHeight,
      borderRadius: tokens.radius.md,
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
    textButton: {
      minHeight: tokens.metrics.touchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textButtonPressed: {
      opacity: 0.55,
    },
    textButtonLabel: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.label,
    },
  });
}
