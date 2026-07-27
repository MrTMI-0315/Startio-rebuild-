import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  type AppearancePreference,
  useAppearancePreference,
} from '@/design/appearance';
import { useThemeTokens, type ThemeTokens } from '@/design/tokens';
import {
  DeleteLocalDataDialog,
  type DeleteDialogState,
} from '@/features/settings/DeleteLocalDataDialog';
import { useStartioFlow } from '@/features/session/StartioFlowProvider';

const LOCAL_DATA_ITEMS = [
  '진행 중인 일과 세 단계 계획',
  '실행 기록과 완료 결과',
  '받은 EXP',
  '사용자가 남긴 완료 사진',
  'AI 사용 선택',
  '화면 모드 선택',
] as const;

const APPEARANCE_OPTIONS: readonly {
  label: string;
  value: AppearancePreference;
}[] = [
  { label: '시스템', value: 'system' },
  { label: '라이트', value: 'light' },
  { label: '다크', value: 'dark' },
];

export function SettingsScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const {
    aiConsent,
    clearAllLocalData,
    isHydrated,
    withdrawAiConsent,
  } = useStartioFlow();
  const {
    appearancePreference,
    isAppearanceHydrated,
    setAppearancePreference,
  } = useAppearancePreference();
  const [deleteState, setDeleteState] =
    useState<DeleteDialogState>('hidden');
  const [consentMessage, setConsentMessage] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  if (!isHydrated || !isAppearanceHydrated) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  const consentLabel =
    aiConsent.decision === 'accepted'
      ? 'AI로 계획 만들기'
      : '기기에서 계획 만들기';

  const runDeletion = async () => {
    setDeleteState('deleting');
    try {
      await clearAllLocalData();
      await setAppearancePreference('system');
      setDeleteState('succeeded');
      AccessibilityInfo.announceForAccessibility(
        '이 기기의 Startio 데이터 삭제를 완료했어요.',
      );
    } catch {
      setDeleteState('failed');
      AccessibilityInfo.announceForAccessibility(
        'Startio 데이터를 모두 삭제하지 못했어요.',
      );
    }
  };

  const handleWithdrawConsent = async () => {
    if (isWithdrawing) {
      return;
    }
    setIsWithdrawing(true);
    setConsentMessage(null);
    try {
      await withdrawAiConsent();
      const message = '앞으로 계획은 이 기기에서만 만들어요.';
      setConsentMessage(message);
      AccessibilityInfo.announceForAccessibility(message);
    } catch {
      setConsentMessage('설정을 바꾸지 못했어요. 다시 시도해 주세요.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} testID="startio-settings-screen">
      <View style={styles.topBar}>
        <Pressable
          accessibilityHint="이전 화면으로 돌아갑니다."
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backButtonText}>닫기</Text>
        </Pressable>
        <Text accessibilityRole="header" style={styles.screenTitle}>
          설정
        </Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.introTitle}>내 데이터</Text>
          <Text style={styles.introBody}>
            실행 기록과 사진은 이 기기에만 저장돼요. 계정이나 동기화는
            사용하지 않아요.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>화면 모드</Text>
          <View
            accessibilityLabel="화면 모드"
            accessibilityRole="radiogroup"
            style={styles.appearanceControl}
          >
            {APPEARANCE_OPTIONS.map((option) => {
              const isSelected = appearancePreference === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  onPress={() =>
                    void setAppearancePreference(option.value)
                  }
                  style={({ pressed }) => [
                    styles.appearanceOption,
                    isSelected && styles.appearanceOptionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.appearanceOptionText,
                      isSelected && styles.appearanceOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>계획 만드는 방식</Text>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{consentLabel}</Text>
                <Text style={styles.cardBody}>
                  {aiConsent.decision === 'accepted'
                    ? '입력한 한 문장만 AI로 보내요. 실행 기록과 사진은 보내지 않아요.'
                    : '입력한 일은 기기 밖으로 보내지 않아요.'}
                </Text>
              </View>
              <View
                accessible
                accessibilityLabel={consentLabel}
                style={[
                  styles.statusDot,
                  aiConsent.decision === 'accepted' && styles.statusDotActive,
                ]}
              />
            </View>
            {aiConsent.decision === 'accepted' ? (
              <Pressable
                accessibilityHint="이후 입력한 일을 외부 AI에 보내지 않습니다."
                accessibilityRole="button"
                accessibilityState={{ busy: isWithdrawing }}
                disabled={isWithdrawing}
                onPress={() => void handleWithdrawConsent()}
                style={({ pressed }) => [
                  styles.inlineButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.inlineButtonText}>
                  {isWithdrawing ? '변경하는 중…' : '기기에서만 만들기'}
                </Text>
              </Pressable>
            ) : null}
          </View>
          {consentMessage ? (
            <Text accessibilityLiveRegion="polite" style={styles.feedbackText}>
              {consentMessage}
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>이 기기에 저장되는 내용</Text>
          <View style={styles.listCard}>
            {LOCAL_DATA_ITEMS.map((item, index) => (
              <View
                key={item}
                style={[
                  styles.listRow,
                  index < LOCAL_DATA_ITEMS.length - 1 && styles.listRowBorder,
                ]}
              >
                <View style={styles.listBullet} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.privacyFootnote}>
            계정과 결제 정보는 저장하지 않아요.
          </Text>
        </View>

        <View style={styles.dangerSection}>
          <Text style={styles.sectionLabel}>데이터 관리</Text>
          <Pressable
            accessibilityHint="삭제할 항목을 확인하는 대화상자를 엽니다."
            accessibilityRole="button"
            onPress={() => setDeleteState('confirming')}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}
          >
            <Text style={styles.deleteButtonText}>이 기기의 Startio 데이터 삭제</Text>
          </Pressable>
          <Text style={styles.deleteFootnote}>
            삭제하면 실행 기록과 사진을 되돌릴 수 없어요.
          </Text>
        </View>
      </ScrollView>

      <DeleteLocalDataDialog
        onCancel={() => setDeleteState('hidden')}
        onConfirm={() => void runDeletion()}
        onFinish={() => {
          setDeleteState('hidden');
          router.replace('/');
        }}
        onRetry={() => void runDeletion()}
        state={deleteState}
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
    topBar: {
      minHeight: 56,
      paddingHorizontal: tokens.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      minWidth: 48,
      minHeight: tokens.metrics.touchTarget,
      justifyContent: 'center',
    },
    backButtonText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.label,
    },
    screenTitle: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.body,
    },
    topBarSpacer: {
      width: 48,
    },
    content: {
      paddingHorizontal: tokens.spacing.lg,
      paddingTop: tokens.spacing.lg,
      paddingBottom: tokens.spacing.xxl,
      gap: tokens.spacing.xl,
    },
    intro: {
      gap: tokens.spacing.sm,
    },
    introTitle: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.title,
      lineHeight: 33,
      letterSpacing: -0.5,
    },
    introBody: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.label,
      lineHeight: 23,
    },
    section: {
      gap: tokens.spacing.sm,
    },
    sectionLabel: {
      paddingHorizontal: tokens.spacing.xs,
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.caption,
      letterSpacing: 0.2,
    },
    appearanceControl: {
      minHeight: 52,
      padding: tokens.spacing.xxs,
      flexDirection: 'row',
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.colors.surfaceMuted,
    },
    appearanceOption: {
      flex: 1,
      minHeight: tokens.metrics.touchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: tokens.radius.sm,
    },
    appearanceOptionSelected: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: tokens.colors.border,
      backgroundColor: tokens.colors.surface,
    },
    appearanceOptionText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiMedium,
      fontSize: tokens.type.label,
    },
    appearanceOptionTextSelected: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiSemiBold,
    },
    card: {
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.colors.surfaceMuted,
      padding: tokens.spacing.md,
      gap: tokens.spacing.md,
    },
    cardHeader: {
      flexDirection: tokens.isLargeText ? 'column' : 'row',
      alignItems: 'flex-start',
      gap: tokens.spacing.md,
    },
    cardCopy: {
      flex: 1,
      gap: tokens.spacing.xs,
    },
    cardTitle: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.body,
      lineHeight: 24,
    },
    cardBody: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.caption,
      lineHeight: 20,
    },
    statusDot: {
      width: 10,
      height: 10,
      marginTop: 7,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: tokens.colors.textSecondary,
    },
    statusDotActive: {
      borderColor: tokens.colors.focus,
      backgroundColor: tokens.colors.primary,
    },
    inlineButton: {
      alignSelf: 'flex-start',
      minHeight: tokens.metrics.touchTarget,
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.sm,
      paddingVertical: tokens.spacing.xs,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.colors.surface,
    },
    inlineButtonText: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.label,
    },
    feedbackText: {
      paddingHorizontal: tokens.spacing.xs,
      color: tokens.colors.focus,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.caption,
      lineHeight: 19,
    },
    listCard: {
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.colors.surfaceMuted,
      overflow: 'hidden',
    },
    listRow: {
      minHeight: 50,
      paddingHorizontal: tokens.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.sm,
    },
    listRowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: tokens.colors.border,
    },
    listBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: tokens.colors.primary,
    },
    listText: {
      flex: 1,
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.label,
      lineHeight: 22,
    },
    privacyFootnote: {
      paddingHorizontal: tokens.spacing.xs,
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.caption,
      lineHeight: 19,
    },
    dangerSection: {
      gap: tokens.spacing.sm,
    },
    deleteButton: {
      minHeight: tokens.metrics.primaryActionMinHeight,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      borderRadius: tokens.radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: tokens.colors.destructive,
      backgroundColor: tokens.colors.surface,
    },
    deleteButtonPressed: {
      backgroundColor: tokens.colors.surfaceMuted,
    },
    deleteButtonText: {
      color: tokens.colors.destructive,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.body,
    },
    deleteFootnote: {
      paddingHorizontal: tokens.spacing.xs,
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.caption,
      lineHeight: 19,
    },
    pressed: {
      opacity: 0.58,
    },
  });
}
