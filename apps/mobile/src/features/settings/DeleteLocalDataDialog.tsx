import { useMemo } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useThemeTokens, type ThemeTokens } from '@/design/tokens';

export type DeleteDialogState =
  | 'hidden'
  | 'confirming'
  | 'deleting'
  | 'succeeded'
  | 'failed';

interface DeleteLocalDataDialogProps {
  state: DeleteDialogState;
  onCancel(): void;
  onConfirm(): void;
  onFinish(): void;
  onRetry(): void;
}

export function DeleteLocalDataDialog({
  state,
  onCancel,
  onConfirm,
  onFinish,
  onRetry,
}: DeleteLocalDataDialogProps) {
  const tokens = useThemeTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const visible = state !== 'hidden';

  const title =
    state === 'succeeded'
      ? '이 기기의 데이터를 삭제했어요'
      : state === 'failed'
        ? '일부 데이터를 삭제하지 못했어요'
        : '이 기기의 Startio 데이터를 삭제할까요?';
  const description =
    state === 'succeeded'
      ? '진행 중인 일, 실행 기록, EXP, 완료 사진과 AI 사용 선택을 이 기기에서 삭제했어요.'
      : state === 'failed'
        ? '일부 데이터를 지우지 못했어요. 다시 시도해 주세요.'
        : '진행 중인 일, 실행 기록, EXP, 완료 사진과 AI 사용 선택이 모두 삭제돼요. 삭제한 뒤에는 되돌릴 수 없어요.';

  return (
    <Modal
      animationType={tokens.reduceMotion ? 'none' : 'fade'}
      onRequestClose={state === 'confirming' ? onCancel : undefined}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <ScrollView
          accessibilityRole="alert"
          accessibilityViewIsModal
          contentContainerStyle={styles.dialogContent}
          showsVerticalScrollIndicator={false}
          style={styles.dialog}
        >
          <View style={styles.copy}>
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {state === 'deleting' ? (
            <View accessibilityLiveRegion="assertive" style={styles.progressRow}>
              <ActivityIndicator color={tokens.colors.destructive} />
              <Text style={styles.progressText}>데이터를 삭제하는 중…</Text>
            </View>
          ) : null}

          {state === 'confirming' ? (
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={onCancel}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>취소</Text>
              </Pressable>
              <Pressable
                accessibilityHint="이 기기에 저장된 Startio 데이터를 되돌릴 수 없게 삭제합니다."
                accessibilityRole="button"
                onPress={onConfirm}
                style={({ pressed }) => [
                  styles.destructiveButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.destructiveButtonText}>데이터 삭제</Text>
              </Pressable>
            </View>
          ) : null}

          {state === 'succeeded' ? (
            <Pressable
              accessibilityRole="button"
              onPress={onFinish}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>처음으로 돌아가기</Text>
            </Pressable>
          ) : null}

          {state === 'failed' ? (
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={onCancel}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>닫기</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onRetry}
                style={({ pressed }) => [
                  styles.destructiveButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.destructiveButtonText}>다시 시도</Text>
              </Pressable>
            </View>
          ) : null}
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
      backgroundColor: 'rgba(20, 16, 13, 0.42)',
      padding: tokens.spacing.md,
    },
    dialog: {
      maxHeight: '90%',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: tokens.colors.border,
      backgroundColor: tokens.colors.surface,
    },
    dialogContent: {
      padding: tokens.spacing.lg,
      gap: tokens.spacing.lg,
    },
    copy: {
      gap: tokens.spacing.sm,
    },
    title: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.title,
      lineHeight: 32,
      letterSpacing: -0.5,
    },
    description: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.body,
      lineHeight: 25,
    },
    progressRow: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.sm,
    },
    progressText: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.body,
    },
    actions: {
      flexDirection: tokens.isLargeText ? 'column' : 'row',
      gap: tokens.spacing.sm,
    },
    secondaryButton: {
      minHeight: tokens.metrics.touchTarget,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.colors.surfaceMuted,
    },
    secondaryButtonText: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.label,
    },
    destructiveButton: {
      minHeight: tokens.metrics.touchTarget,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.colors.destructive,
    },
    destructiveButtonText: {
      color: tokens.colors.inverseText,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.label,
    },
    primaryButton: {
      minHeight: tokens.metrics.touchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.colors.primary,
    },
    primaryButtonText: {
      color: tokens.colors.primaryText,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.label,
    },
    pressed: {
      opacity: 0.62,
    },
  });
}
