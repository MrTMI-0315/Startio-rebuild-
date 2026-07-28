import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { HistoryRecord } from '@/core/events/historyProjection';
import { useThemeTokens, type ThemeTokens } from '@/design/tokens';
import { ProofThumbnail } from '@/features/history/ProofThumbnail';
import { useStartioFlow } from '@/features/session/StartioFlowProvider';

function formatCompletedAt(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}초`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder === 0 ? `${minutes}분` : `${minutes}분 ${remainder}초`;
}

function HistoryRow({
  record,
  tokens,
}: {
  record: HistoryRecord;
  tokens: ThemeTokens;
}) {
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  return (
    <View accessibilityRole="summary" style={styles.historyRow}>
      <View style={styles.rowHeader}>
        <Text style={styles.taskTitle}>
          {record.taskTitle}
        </Text>
        <Text style={styles.expText}>+{record.expGranted} EXP</Text>
      </View>
      <Text style={styles.completedText}>
        3단계 완료 · {formatCompletedAt(record.completedAt)}
      </Text>
      {record.startLatencySeconds !== null ? (
        <Text style={styles.latencyText}>
          계획을 만든 뒤 {record.startLatencySeconds}초 만에 시작
        </Text>
      ) : null}
      {record.activeDurationSeconds !== null ? (
        <Text style={styles.latencyText}>
          실행 {formatDuration(record.activeDurationSeconds)}
        </Text>
      ) : null}
      {record.proofPhoto ? <ProofThumbnail photo={record.proofPhoto} /> : null}
    </View>
  );
}

export function HistoryScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { historyArchive, isHydrated } = useStartioFlow();
  const totalExp = historyArchive.records.reduce(
    (total, record) => total + record.expGranted,
    0,
  );

  if (!isHydrated) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} testID="startio-history-screen">
      <View style={styles.page}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityHint="시작 화면으로 돌아갑니다."
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Text style={styles.backButtonText}>닫기</Text>
          </Pressable>
          <Text accessibilityRole="header" style={styles.screenTitle}>
            실행 기록
          </Text>
          <View style={styles.topBarSpacer} />
        </View>

        {historyArchive.records.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEyebrow}>아직 실행 기록이 없어요</Text>
            <Text style={styles.emptyTitle}>일을 완료하면 여기에 쌓여요.</Text>
            <Text style={styles.emptyDescription}>
              실행 시간과 EXP를 함께 볼 수 있어요.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.summaryGrid}>
              <View style={[styles.summaryItem, styles.summaryItemSeparated]}>
                <Text style={styles.summaryLabel}>완료한 일</Text>
                <Text style={styles.summaryValue}>
                  {historyArchive.records.length}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>모은 EXP</Text>
                <Text style={styles.summaryValue}>{totalExp}</Text>
              </View>
            </View>

            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle}>최근 실행</Text>
              <View style={styles.historyList}>
                {historyArchive.records.map((record) => (
                  <HistoryRow key={record.completionKey} record={record} tokens={tokens} />
                ))}
              </View>
            </View>

          </ScrollView>
        )}
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
      minWidth: 48,
      minHeight: tokens.metrics.touchTarget,
      justifyContent: 'center',
    },
    backButtonText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.label,
    },
    pressed: {
      opacity: 0.55,
    },
    screenTitle: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.body,
    },
    topBarSpacer: {
      width: 48,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.lg,
      paddingBottom: tokens.spacing.xxl,
      gap: tokens.spacing.md,
    },
    emptyEyebrow: {
      color: tokens.colors.focus,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.label,
    },
    emptyTitle: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.title,
      lineHeight: 33,
      letterSpacing: -0.5,
    },
    emptyDescription: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.body,
      lineHeight: 26,
    },
    scrollContent: {
      paddingHorizontal: tokens.spacing.lg,
      paddingTop: tokens.spacing.lg,
      paddingBottom: tokens.spacing.xxl,
      gap: tokens.spacing.xl,
    },
    recentSection: {
      gap: tokens.spacing.md,
    },
    summaryGrid: {
      flexDirection: 'row',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: tokens.colors.border,
    },
    summaryItem: {
      flex: 1,
      minHeight: 72,
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      justifyContent: 'space-between',
    },
    summaryItemSeparated: {
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderLeftColor: tokens.colors.border,
    },
    summaryLabel: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.caption,
    },
    summaryValue: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.title,
      fontVariant: ['tabular-nums'],
    },
    sectionTitle: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.label,
    },
    historyList: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: tokens.colors.border,
    },
    historyRow: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: tokens.colors.border,
      paddingHorizontal: tokens.spacing.xs,
      paddingVertical: tokens.spacing.lg,
      gap: tokens.spacing.xs,
    },
    rowHeader: {
      flexDirection: tokens.isLargeText ? 'column' : 'row',
      alignItems: 'flex-start',
      gap: tokens.spacing.md,
    },
    taskTitle: {
      flex: 1,
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.body,
      lineHeight: 25,
    },
    expText: {
      color: tokens.colors.focus,
      fontFamily: tokens.font.uiBold,
      fontSize: tokens.type.label,
      fontVariant: ['tabular-nums'],
    },
    completedText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.caption,
      lineHeight: 19,
    },
    latencyText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.caption,
      lineHeight: 19,
    },
  });
}
