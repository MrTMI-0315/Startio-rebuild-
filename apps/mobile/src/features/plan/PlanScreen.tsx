import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ActionStep } from '@/core/coaching/result';
import { useThemeTokens, type ThemeTokens } from '@/design/tokens';
import { useStartioFlow } from '@/features/session/StartioFlowProvider';

function formatSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}초`;
  }

  return `${Math.floor(seconds / 60)}분`;
}

function StepRow({
  step,
  isPrimary,
  tokens,
}: {
  step: ActionStep;
  isPrimary: boolean;
  tokens: ThemeTokens;
}) {
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  return (
    <View
      accessible
      accessibilityLabel={`${step.stepOrder}단계. ${step.action}. ${formatSeconds(step.timerSeconds)}. ${step.completionCondition}`}
      accessibilityRole="summary"
      style={[styles.stepRow, isPrimary && styles.stepRowPrimary]}
    >
      <View style={[styles.stepNumber, isPrimary && styles.stepNumberPrimary]}>
        <Text style={[styles.stepNumberText, isPrimary && styles.stepNumberTextPrimary]}>
          {step.stepOrder}
        </Text>
      </View>
      <View style={styles.stepCopy}>
        <Text style={[styles.stepAction, !isPrimary && styles.stepActionMuted]}>
          {step.action}
        </Text>
        <Text style={[styles.stepCondition, !isPrimary && styles.stepMetaMuted]}>
          {step.completionCondition}
        </Text>
      </View>
      <Text style={[styles.stepTime, !isPrimary && styles.stepMetaMuted]}>
        {formatSeconds(step.timerSeconds)}
      </Text>
    </View>
  );
}

export function PlanScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { reset, result } = useStartioFlow();
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(10)).current;
  const plan = result?.kind === 'plan_allowed' ? result.plan : null;

  useEffect(() => {
    if (!plan) {
      router.replace('/');
    }
  }, [plan, router]);

  useEffect(() => {
    if (!plan) {
      return;
    }

    if (tokens.reduceMotion) {
      contentOpacity.setValue(1);
      contentTranslateY.setValue(0);
      return;
    }

    const animation = Animated.parallel([
      Animated.timing(contentOpacity, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]);
    animation.start();

    return () => {
      animation.stop();
    };
  }, [contentOpacity, contentTranslateY, plan, tokens.reduceMotion]);

  if (!plan) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} testID="startio-plan-screen">
      <View style={styles.page}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityHint="현재 행동 계획을 닫고 입력 화면으로 돌아갑니다."
            accessibilityRole="button"
            onPress={() => {
              reset();
              router.replace('/');
            }}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          >
            <Text style={styles.backButtonText}>다시 입력</Text>
          </Pressable>
          <Text style={styles.brandText}>startio</Text>
        </View>

        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          }}
        >
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>지금 할 3가지</Text>
            <Text accessibilityRole="header" style={styles.taskTitle}>
              {plan.taskTitle}
            </Text>
          </View>

          <View accessibilityRole="list" style={styles.steps}>
            {plan.steps.map((step) => (
              <StepRow
                isPrimary={step.stepOrder === 1}
                key={step.stepId}
                step={step}
                tokens={tokens}
              />
            ))}
          </View>
        </Animated.ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            accessibilityHint="첫 번째 행동의 타이머 화면으로 이동합니다."
            accessibilityRole="button"
            onPress={() => router.push('/timer')}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && (
                tokens.reduceMotion
                  ? styles.primaryButtonPressedReduced
                  : styles.primaryButtonPressed
              ),
            ]}
          >
            <Text style={styles.primaryButtonText}>1단계 시작</Text>
          </Pressable>
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
    },
    topBar: {
      minHeight: 56,
      paddingHorizontal: tokens.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      minHeight: tokens.metrics.touchTarget,
      justifyContent: 'center',
      paddingRight: tokens.spacing.md,
    },
    backButtonPressed: {
      opacity: 0.55,
    },
    backButtonText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.label,
    },
    brandText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.brand,
      fontSize: tokens.type.label,
    },
    scrollContent: {
      paddingHorizontal: tokens.spacing.lg,
      paddingTop: tokens.spacing.lg,
      paddingBottom: tokens.spacing.xl,
      gap: tokens.spacing.xl,
    },
    intro: {
      gap: tokens.spacing.sm,
    },
    eyebrow: {
      color: tokens.colors.focus,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.label,
    },
    taskTitle: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.display,
      lineHeight: 43,
      letterSpacing: -1,
    },
    steps: {
      gap: tokens.spacing.sm,
    },
    stepRow: {
      minHeight: 100,
      flexDirection: 'row',
      gap: tokens.spacing.md,
      paddingVertical: tokens.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: tokens.colors.border,
      opacity: 0.72,
    },
    stepRowPrimary: {
      minHeight: 112,
      paddingHorizontal: tokens.spacing.md,
      borderBottomWidth: 0,
      borderLeftWidth: 3,
      borderLeftColor: tokens.colors.focus,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.colors.surfaceMuted,
      opacity: 1,
    },
    stepNumber: {
      width: 32,
      height: 32,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: tokens.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumberPrimary: {
      borderWidth: 0,
      backgroundColor: tokens.colors.selection,
    },
    stepNumberText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.label,
      fontVariant: ['tabular-nums'],
    },
    stepNumberTextPrimary: {
      color: tokens.colors.primaryText,
    },
    stepCopy: {
      flex: 1,
      gap: tokens.spacing.xs,
    },
    stepAction: {
      flex: 1,
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.body,
      lineHeight: 25,
    },
    stepActionMuted: {
      fontFamily: tokens.font.uiSemiBold,
    },
    stepTime: {
      color: tokens.colors.focus,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.caption,
      lineHeight: 22,
      fontVariant: ['tabular-nums'],
    },
    stepCondition: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.label,
      lineHeight: 22,
    },
    stepMetaMuted: {
      color: tokens.colors.textSecondary,
    },
    bottomBar: {
      paddingHorizontal: tokens.spacing.lg,
      paddingTop: tokens.spacing.sm,
      paddingBottom: tokens.spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: tokens.colors.border,
      backgroundColor: tokens.colors.background,
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
      transform: [{ scale: 0.99 }],
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
  });
}
