import { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeTokens, type ThemeTokens } from '@/design/tokens';

interface AiConsentSheetProps {
  visible: boolean;
  isSubmitting: boolean;
  onAccept(): void;
  onDecline(): void;
}

export function AiConsentSheet({
  visible,
  isSubmitting,
  onAccept,
  onDecline,
}: AiConsentSheetProps) {
  const tokens = useThemeTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType={tokens.reduceMotion ? 'none' : 'slide'}
      onRequestClose={() => undefined}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View
        accessibilityViewIsModal
        style={styles.backdrop}
        testID="ai-consent-sheet"
      >
        <ScrollView
          contentContainerStyle={[
            styles.sheetContent,
            { paddingBottom: Math.max(insets.bottom, tokens.spacing.md) },
          ]}
          showsVerticalScrollIndicator={false}
          style={styles.sheet}
        >
          <View style={styles.handle} />
          <Text accessibilityRole="header" style={styles.title}>
            AI로 계획 만들기
          </Text>
          <Text style={styles.body}>
            입력한 한 문장만 Startio 서버와 AI 제공자에 전송돼요. 실행 기록과
            사진은 보내지 않아요.
          </Text>
          <Text style={styles.meta}>
            이 선택은 설정에서 바꿀 수 있어요.
          </Text>
          <Pressable
            accessibilityHint="입력한 할 일을 AI로 보내 세 개의 행동을 만듭니다."
            accessibilityRole="button"
            accessibilityState={{ busy: isSubmitting, disabled: isSubmitting }}
            disabled={isSubmitting}
            onPress={onAccept}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && !isSubmitting && (
                tokens.reduceMotion
                  ? styles.primaryButtonPressedReduced
                  : styles.primaryButtonPressed
              ),
              isSubmitting && styles.disabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? '첫 행동을 만드는 중…' : 'AI로 만들기'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityHint="할 일을 외부로 보내지 않고 기기에서 세 가지 행동을 만듭니다."
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={onDecline}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && !isSubmitting && styles.secondaryButtonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>기기에서 만들기</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(20, 16, 13, 0.38)',
    },
    sheet: {
      maxHeight: '92%',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor: tokens.colors.surface,
      shadowColor: '#1A1410',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.14,
      shadowRadius: 24,
      elevation: 24,
    },
    sheetContent: {
      paddingTop: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.lg,
      gap: tokens.spacing.sm,
    },
    handle: {
      alignSelf: 'center',
      width: 36,
      height: 5,
      marginBottom: tokens.spacing.sm,
      borderRadius: 3,
      backgroundColor: tokens.colors.border,
    },
    title: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.title,
      lineHeight: 32,
      letterSpacing: -0.5,
    },
    body: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.body,
      lineHeight: 25,
    },
    meta: {
      marginBottom: tokens.spacing.sm,
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.caption,
      lineHeight: 18,
    },
    primaryButton: {
      minHeight: tokens.metrics.primaryActionMinHeight,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: tokens.radius.md,
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
      minHeight: tokens.metrics.primaryActionMinHeight,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: tokens.radius.md,
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.sm,
    },
    secondaryButtonPressed: {
      backgroundColor: tokens.colors.surfaceMuted,
    },
    secondaryButtonText: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.body,
    },
    disabled: {
      opacity: 0.55,
    },
  });
}
