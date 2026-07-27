import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { findCompletionRecord } from '@/core/session/completion';
import { TASK_COMPLETION_EXP } from '@/core/session/reward';
import type { ProofPhotoSource } from '@/core/storage/proofFileRepository';
import { useThemeTokens, type ThemeTokens } from '@/design/tokens';
import { PhotoProofPicker } from '@/features/completion/PhotoProofPicker';
import { ProofThumbnail } from '@/features/history/ProofThumbnail';
import { useStartioFlow } from '@/features/session/StartioFlowProvider';

function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}초`;
  }
  return seconds === 0 ? `${minutes}분` : `${minutes}분 ${seconds}초`;
}

export function CompletionScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const {
    result,
    timerState,
    completionState,
    isHydrated,
    submitCheckCompletion,
    reset,
  } = useStartioFlow();
  const [proofPhotoSource, setProofPhotoSource] =
    useState<ProofPhotoSource | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.92)).current;
  const rewardOpacity = useRef(new Animated.Value(0)).current;
  const plan = result?.kind === 'plan_allowed' ? result.plan : null;
  const completionRecord = plan
    ? findCompletionRecord(completionState, plan)
    : null;
  const plannedMs = plan
    ? plan.steps.reduce((total, step) => total + step.timerSeconds * 1000, 0)
    : 0;
  const actualMs = timerState?.stepTimings?.length === 3
    ? timerState.stepTimings.reduce((total, timing) => total + timing.activeMs, 0)
    : null;
  const varianceMs = actualMs === null ? null : actualMs - plannedMs;

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!plan || timerState?.status !== 'completed') {
      router.replace(timerState ? '/timer' : '/');
    }
  }, [isHydrated, plan, router, timerState]);

  useEffect(() => {
    if (!completionRecord) {
      return;
    }

    let cancelled = false;
    AccessibilityInfo.announceForAccessibility(
      `완료했어요. EXP ${completionRecord.reward.amount}을 받았어요.`,
    );

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotionEnabled) => {
      if (cancelled) {
        return;
      }

      if (reduceMotionEnabled) {
        successOpacity.setValue(1);
        successScale.setValue(1);
        rewardOpacity.setValue(1);
        return;
      }

      Animated.parallel([
        Animated.timing(successOpacity, {
          duration: 220,
          easing: Easing.out(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(successScale, {
          damping: 18,
          mass: 0.7,
          stiffness: 180,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.delay(180),
        Animated.timing(rewardOpacity, {
          duration: 240,
          easing: Easing.out(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return () => {
      cancelled = true;
      successOpacity.stopAnimation();
      successScale.stopAnimation();
      rewardOpacity.stopAnimation();
    };
  }, [
    completionRecord,
    rewardOpacity,
    successOpacity,
    successScale,
  ]);

  if (!isHydrated || !plan || timerState?.status !== 'completed') {
    return null;
  }

  const handleSubmit = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    const outcome = await submitCheckCompletion(proofPhotoSource);
    setIsSaving(false);

    if (outcome === 'completed' || outcome === 'already_completed') {
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => undefined);
    } else if (outcome === 'photo_persistence_failed') {
      setSaveError(
        '사진을 앱 안에 저장하지 못했어요. 사진을 제거하거나 다시 선택해 주세요.',
      );
    } else if (outcome === 'persistence_failed') {
      setSaveError('완료 내용을 저장하지 못했어요. 다시 시도해 주세요.');
    } else if (outcome === 'not_eligible') {
      router.replace('/timer');
    }
  };

  if (completionRecord) {
    return (
      <SafeAreaView style={styles.safeArea} testID="startio-completion-success">
        <View style={styles.page}>
          <ScrollView
            contentContainerStyle={styles.successContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              accessible={false}
              style={[
                styles.successMark,
                {
                  opacity: successOpacity,
                  transform: [{ scale: successScale }],
                },
              ]}
            >
              <Text style={styles.successMarkText}>✓</Text>
            </Animated.View>
            <Text accessibilityRole="header" style={styles.title}>
              완료했어요
            </Text>
            <Text style={styles.description}>{plan.taskTitle}</Text>
            {actualMs !== null ? (
              <View style={styles.timingSummary}>
                <Text style={styles.timingValue}>
                  {formatDuration(actualMs)} 동안 실행했어요
                </Text>
                <Text style={styles.timingCaption}>
                  {varianceMs === 0
                    ? '예상 시간에 맞췄어요'
                    : varianceMs !== null && varianceMs < 0
                      ? `예상보다 ${formatDuration(Math.abs(varianceMs))} 빨랐어요`
                      : `예상보다 ${formatDuration(varianceMs ?? 0)} 더 걸렸어요`}
                </Text>
              </View>
            ) : null}
            {completionRecord.proof.photo ? (
              <View style={styles.successPhoto}>
                <ProofThumbnail photo={completionRecord.proof.photo} />
              </View>
            ) : null}
            <Animated.View
              style={[styles.rewardSummary, { opacity: rewardOpacity }]}
            >
              <Text style={styles.rewardLabel}>EXP</Text>
              <Text style={styles.rewardValue}>+{completionRecord.reward.amount}</Text>
            </Animated.View>
          </ScrollView>

          <Pressable
            accessibilityHint="현재 완료 기록을 닫고 새로운 일을 입력합니다."
            accessibilityRole="button"
            onPress={() => {
              reset();
              router.replace('/');
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && (
                tokens.reduceMotion
                  ? styles.primaryButtonPressedReduced
                  : styles.primaryButtonPressed
              ),
            ]}
          >
            <Text style={styles.primaryButtonText}>다른 일 시작하기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} testID="startio-completion-check">
      <View style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>마지막 확인</Text>
          <Text accessibilityRole="header" style={styles.title}>
            세 단계를 마쳤어요
          </Text>
          <Text style={styles.description}>
            완료를 저장하면 EXP {TASK_COMPLETION_EXP}을 받아요.
          </Text>
          {actualMs !== null ? (
            <View style={styles.timingSummary}>
              <Text style={styles.timingValue}>
                {formatDuration(actualMs)} 동안 실행했어요
              </Text>
              <Text style={styles.timingCaption}>
                예상 시간 {formatDuration(plannedMs)}
              </Text>
            </View>
          ) : null}

          <PhotoProofPicker
            disabled={isSaving}
            onChange={(photo) => {
              setProofPhotoSource(photo);
              setSaveError(null);
            }}
            value={proofPhotoSource}
          />

          {saveError ? (
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {saveError}
            </Text>
          ) : null}
        </ScrollView>

        <Pressable
          accessibilityHint="완료 기록과 EXP를 함께 저장합니다."
          accessibilityRole="button"
          accessibilityState={{ disabled: isSaving, busy: isSaving }}
          disabled={isSaving}
          onPress={() => void handleSubmit()}
          style={({ pressed }) => [
            styles.primaryButton,
            isSaving && styles.primaryButtonDisabled,
            pressed && !isSaving && (
              tokens.reduceMotion
                ? styles.primaryButtonPressedReduced
                : styles.primaryButtonPressed
            ),
          ]}
        >
          <Text
            style={[
              styles.primaryButtonText,
              isSaving && styles.primaryButtonTextDisabled,
            ]}
          >
            {isSaving ? '저장 중…' : '완료 저장'}
          </Text>
        </Pressable>
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
      paddingTop: tokens.spacing.xl,
      paddingBottom: tokens.spacing.md,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      gap: tokens.spacing.md,
      paddingBottom: tokens.spacing.xl,
    },
    successContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: tokens.spacing.md,
      paddingBottom: tokens.spacing.xl,
    },
    successMark: {
      width: 64,
      height: 64,
      marginBottom: tokens.spacing.sm,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: tokens.colors.successSurface,
    },
    successMarkText: {
      color: tokens.colors.successText,
      fontFamily: tokens.font.uiBold,
      fontSize: 36,
    },
    successPhoto: {
      width: '100%',
      maxWidth: 280,
    },
    eyebrow: {
      color: tokens.colors.focus,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.label,
    },
    title: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: 32,
      lineHeight: 39,
      letterSpacing: -0.8,
      textAlign: 'center',
    },
    description: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.body,
      lineHeight: 26,
      textAlign: 'center',
    },
    timingSummary: {
      minWidth: 190,
      marginTop: tokens.spacing.sm,
      paddingVertical: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: tokens.colors.border,
      alignItems: 'center',
      gap: tokens.spacing.xxs,
    },
    timingValue: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.body,
      fontVariant: ['tabular-nums'],
    },
    timingCaption: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.caption,
      lineHeight: 18,
      textAlign: 'center',
    },
    errorText: {
      color: tokens.colors.destructive,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.caption,
      lineHeight: 18,
      textAlign: 'center',
    },
    rewardSummary: {
      minWidth: 164,
      marginTop: tokens.spacing.lg,
      paddingTop: tokens.spacing.md,
      paddingHorizontal: tokens.spacing.xl,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: tokens.colors.border,
      alignItems: 'center',
      gap: tokens.spacing.xs,
    },
    rewardLabel: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.caption,
    },
    rewardValue: {
      color: tokens.colors.focus,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.title,
      fontVariant: ['tabular-nums'],
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
    primaryButtonDisabled: {
      backgroundColor: tokens.colors.primaryDisabled,
    },
    primaryButtonText: {
      color: tokens.colors.primaryText,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.body,
    },
    primaryButtonTextDisabled: {
      color: tokens.colors.textSecondary,
    },
  });
}
