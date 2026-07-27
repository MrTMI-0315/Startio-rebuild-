import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getTaskInputErrorMessage,
  MAX_TASK_GRAPHEMES,
  validateTaskInput,
} from '@/core/coaching/input';
import type { SafeRedirect } from '@/core/coaching/result';
import { classifySafety } from '@/core/coaching/safety';
import { useThemeTokens, type ThemeTokens } from '@/design/tokens';
import { useStartioFlow } from '@/features/session/StartioFlowProvider';
import { ResumeCard } from '@/features/start/ResumeCard';
import { AiConsentSheet } from '@/features/start/AiConsentSheet';

function SafeRedirectPanel({
  result,
  onReset,
  tokens,
}: {
  result: SafeRedirect;
  onReset(): void;
  tokens: ThemeTokens;
}) {
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.safeContent}
        showsVerticalScrollIndicator={false}
      >
        <Text accessibilityRole="header" style={styles.safeEyebrow}>
          Startio
        </Text>
        <View
          accessibilityLiveRegion="polite"
          accessibilityRole="summary"
          style={styles.safePanel}
        >
          <Text style={styles.safeTitle}>여기서는 행동 계획을 만들지 않을게요.</Text>
          <Text style={styles.safeMessage}>{result.message}</Text>
          <View style={styles.supportList}>
            {result.supportActions.map((action) => (
              <View key={action} style={styles.supportRow}>
                <Text style={styles.supportBullet}>•</Text>
                <Text style={styles.supportText}>{action}</Text>
              </View>
            ))}
          </View>
        </View>
        <Pressable
          accessibilityHint="안전 안내를 닫고 시작 입력란으로 돌아갑니다."
          accessibilityRole="button"
          onPress={onReset}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && (
              tokens.reduceMotion
                ? styles.primaryButtonPressedReduced
                : styles.primaryButtonPressed
            ),
          ]}
        >
          <Text style={styles.primaryButtonText}>다른 일 적기</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export function StartScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const {
    result,
    timerState,
    isHydrated,
    hasResumableSession,
    shouldRequestAiConsent,
    decideAiConsent,
    reset,
    resumeCurrentSession,
    submitTask,
  } = useStartioFlow();
  const [input, setInput] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [pendingInput, setPendingInput] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const submissionLockRef = useRef(false);
  const validation = validateTaskInput(input);
  const shouldShowCounter =
    validation.graphemeCount >= MAX_TASK_GRAPHEMES - 40;
  const inlineError =
    hasSubmitted || validation.graphemeCount > MAX_TASK_GRAPHEMES
      ? getTaskInputErrorMessage(validation.error)
      : null;

  if (!isHydrated) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  if (
    hasResumableSession &&
    result?.kind === 'plan_allowed' &&
    timerState
  ) {
    return (
      <ResumeCard
        result={result}
        timerState={timerState}
        onResume={() => {
          resumeCurrentSession();
          router.push(timerState.status === 'completed' ? '/done' : '/timer');
        }}
        onStartNew={() => {
          reset();
          setInput('');
          setHasSubmitted(false);
        }}
      />
    );
  }

  if (result?.kind === 'safe_redirect') {
    return (
      <SafeRedirectPanel
        result={result}
        tokens={tokens}
        onReset={() => {
          reset();
          setInput('');
          setHasSubmitted(false);
        }}
      />
    );
  }

  const runSubmission = async (task: string) => {
    if (submissionLockRef.current) {
      return;
    }

    submissionLockRef.current = true;
    setIsLoading(true);
    setSubmissionError(null);
    try {
      const nextResult = await submitTask(task);
      if (nextResult.kind === 'plan_allowed') {
        router.push('/plan');
      }
    } catch {
      setSubmissionError('첫 행동을 만들지 못했어요. 다시 시도해 주세요.');
    } finally {
      submissionLockRef.current = false;
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
    if (!validation.isValid || isLoading) {
      return;
    }

    if (
      shouldRequestAiConsent &&
      classifySafety(validation.value) === null
    ) {
      setPendingInput(validation.value);
      return;
    }

    void runSubmission(validation.value);
  };

  return (
    <SafeAreaView style={styles.safeArea} testID="startio-start-screen">
      <TouchableWithoutFeedback
        accessible={false}
        onPress={Keyboard.dismiss}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoiding}
        >
          <ScrollView
            contentContainerStyle={styles.page}
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brandRow}>
              <View
                accessibilityLabel="Startio"
                accessibilityRole="header"
                accessible
                style={styles.brandIdentity}
              >
                <Image
                  accessible={false}
                  source={require('../../../assets/images/startio-brand-mark.png')}
                  style={styles.brandMark}
                />
                {!tokens.isLargeText ? (
                  <Text accessible={false} style={styles.brandText}>
                    startio
                  </Text>
                ) : null}
              </View>
              <View style={styles.navigationActions}>
                <Pressable
                  accessibilityHint="최근 실행 기록과 기본 지표를 확인합니다."
                  accessibilityRole="button"
                  hitSlop={4}
                  onPress={() => router.push('/history')}
                  style={({ pressed }) => [
                    styles.historyButton,
                    pressed && styles.historyButtonPressed,
                  ]}
                >
                  <Text style={styles.historyButtonText}>기록</Text>
                </Pressable>
                <Pressable
                  accessibilityHint="내 데이터와 화면 설정을 확인합니다."
                  accessibilityRole="button"
                  hitSlop={4}
                  onPress={() => router.push('/settings')}
                  style={({ pressed }) => [
                    styles.historyButton,
                    pressed && styles.historyButtonPressed,
                  ]}
                >
                  <Text style={styles.historyButtonText}>설정</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.emptyPrompt}>
              <Text
                accessibilityRole="header"
                nativeID="task-input-label"
                style={styles.emptyPromptText}
              >
                막히는 일이 있나요?
              </Text>
            </View>

            <View style={styles.composerDock}>
              <View
                style={[
                  styles.inputShell,
                  isInputFocused ? styles.inputShellFocused : null,
                  inlineError ? styles.inputShellError : null,
                  isLoading ? styles.inputShellLoading : null,
                ]}
              >
                <TextInput
                  accessibilityLabel="막힌 일 입력"
                  accessibilityHint="시작하기 어려운 일을 한 문장으로 적습니다."
                  aria-labelledby="task-input-label"
                  autoCapitalize="sentences"
                  autoCorrect
                  editable={!isLoading}
                  maxLength={MAX_TASK_GRAPHEMES}
                  multiline
                  onChangeText={(value) => {
                    setInput(value);
                    if (hasSubmitted) {
                      setHasSubmitted(false);
                    }
                  }}
                  onBlur={() => setIsInputFocused(false)}
                  onFocus={() => setIsInputFocused(true)}
                  onSubmitEditing={handleSubmit}
                  placeholder="한 문장만 적어보세요"
                  placeholderTextColor={tokens.colors.textSecondary}
                  returnKeyType="done"
                  selectionColor={tokens.colors.focus}
                  submitBehavior="blurAndSubmit"
                  style={styles.input}
                  value={input}
                />
                <View style={styles.inputMeta}>
                  <Text
                    accessibilityLiveRegion="polite"
                    style={[styles.helperText, inlineError && styles.errorText]}
                  >
                    {inlineError ?? ''}
                  </Text>
                  {shouldShowCounter ? (
                    <Text style={styles.counterText}>
                      {validation.graphemeCount}/{MAX_TASK_GRAPHEMES}
                    </Text>
                  ) : null}
                </View>
              </View>

              {submissionError ? (
                <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                  {submissionError}
                </Text>
              ) : null}

              <Pressable
                accessibilityHint="입력한 일을 세 개의 작은 행동으로 만듭니다."
                accessibilityRole="button"
                accessibilityState={{ disabled: !validation.isValid || isLoading, busy: isLoading }}
                disabled={!validation.isValid || isLoading}
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.primaryButton,
                  (!validation.isValid || isLoading) && styles.primaryButtonDisabled,
                  pressed && validation.isValid && !isLoading && (
                    tokens.reduceMotion
                      ? styles.primaryButtonPressedReduced
                      : styles.primaryButtonPressed
                  ),
                ]}
              >
                <View style={styles.primaryButtonContent}>
                  {isLoading ? (
                    <ActivityIndicator
                      color={tokens.colors.primaryText}
                      size="small"
                    />
                  ) : null}
                  <Text
                    accessibilityLiveRegion="polite"
                    style={[
                      styles.primaryButtonText,
                      (!validation.isValid || isLoading) && styles.primaryButtonTextDisabled,
                    ]}
                  >
                    {isLoading ? '첫 행동을 만드는 중…' : '첫 행동 만들기'}
                  </Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <AiConsentSheet
        isSubmitting={isLoading}
        onAccept={() => {
          if (!pendingInput) {
            return;
          }
          const task = pendingInput;
          setIsLoading(true);
          void decideAiConsent('accepted')
            .then(() => {
              setPendingInput(null);
              return runSubmission(task);
            })
            .catch(() => {
              setIsLoading(false);
              setSubmissionError(
                '선택을 저장하지 못했어요. 기기 저장 공간을 확인해 주세요.',
              );
            });
        }}
        onDecline={() => {
          if (!pendingInput) {
            return;
          }
          const task = pendingInput;
          setIsLoading(true);
          void decideAiConsent('declined')
            .then(() => {
              setPendingInput(null);
              return runSubmission(task);
            })
            .catch(() => {
              setIsLoading(false);
              setSubmissionError(
                '선택을 저장하지 못했어요. 기기 저장 공간을 확인해 주세요.',
              );
            });
        }}
        visible={pendingInput !== null}
      />
    </SafeAreaView>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: tokens.colors.background,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    page: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingBottom: tokens.spacing.md,
    },
    brandRow: {
      minHeight: tokens.isLargeText ? 76 : 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    brandIdentity: {
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
      fontSize: tokens.isLargeText ? 22 : 28,
      lineHeight: 36,
      letterSpacing: -0.8,
    },
    historyButton: {
      minHeight: tokens.metrics.touchTarget,
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.xs,
    },
    navigationActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.xs,
    },
    historyButtonPressed: {
      opacity: 0.55,
    },
    historyButtonText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.label,
    },
    emptyPrompt: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.sm,
      paddingBottom: tokens.isLargeText ? tokens.spacing.sm : tokens.spacing.lg,
    },
    emptyPromptText: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiMedium,
      fontSize: tokens.isLargeText ? 24 : 28,
      lineHeight: 36,
      letterSpacing: -0.7,
      textAlign: 'center',
    },
    composerDock: {
      gap: tokens.spacing.sm,
      paddingTop: tokens.spacing.sm,
    },
    inputShell: {
      minHeight: tokens.isLargeText ? 136 : 112,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: tokens.colors.border,
      backgroundColor: tokens.colors.surface,
      overflow: 'hidden',
    },
    inputShellFocused: {
      borderColor: tokens.colors.focus,
      borderWidth: 2,
    },
    inputShellError: {
      borderColor: tokens.colors.destructive,
      borderWidth: 2,
    },
    inputShellLoading: {
      borderColor: tokens.colors.focus,
    },
    input: {
      minHeight: tokens.isLargeText ? 88 : 72,
      paddingHorizontal: tokens.spacing.md,
      paddingTop: tokens.spacing.md,
      paddingBottom: tokens.spacing.sm,
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.body,
      lineHeight: 24,
      textAlignVertical: 'top',
    },
    inputMeta: {
      minHeight: 36,
      paddingHorizontal: tokens.spacing.md,
      paddingBottom: tokens.spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: tokens.spacing.md,
    },
    helperText: {
      flex: 1,
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.caption,
      lineHeight: 18,
    },
    errorText: {
      color: tokens.colors.destructive,
      fontFamily: tokens.font.uiSemiBold,
    },
    counterText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.caption,
      fontVariant: ['tabular-nums'],
    },
    primaryButton: {
      minHeight: tokens.metrics.primaryActionMinHeight,
      marginTop: tokens.spacing.xs,
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
    primaryButtonContent: {
      minHeight: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.spacing.xs,
    },
    safeContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.lg,
      gap: tokens.spacing.lg,
    },
    safeEyebrow: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.label,
    },
    safePanel: {
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.colors.border,
      backgroundColor: tokens.colors.cautionSurface,
      padding: tokens.spacing.lg,
      gap: tokens.spacing.md,
    },
    safeTitle: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.title,
      lineHeight: 32,
      letterSpacing: -0.5,
    },
    safeMessage: {
      color: tokens.colors.cautionText,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.body,
      lineHeight: 25,
    },
    supportList: {
      gap: tokens.spacing.sm,
    },
    supportRow: {
      flexDirection: 'row',
      gap: tokens.spacing.sm,
    },
    supportBullet: {
      color: tokens.colors.cautionText,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.body,
      lineHeight: 25,
    },
    supportText: {
      flex: 1,
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.label,
      lineHeight: 23,
    },
  });
}
