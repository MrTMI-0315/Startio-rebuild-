import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { ProofPhotoSource } from '@/core/storage/proofFileRepository';
import { useThemeTokens, type ThemeTokens } from '@/design/tokens';

interface PhotoProofPickerProps {
  disabled?: boolean;
  value: ProofPhotoSource | null;
  onChange(value: ProofPhotoSource | null): void;
}

export function PhotoProofPicker({
  disabled = false,
  value,
  onChange,
}: PhotoProofPickerProps) {
  const tokens = useThemeTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const [pickingSource, setPickingSource] =
    useState<'camera' | 'library' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const isPicking = pickingSource !== null;

  const pickPhoto = async (source: 'camera' | 'library') => {
    if (disabled || isPicking) {
      return;
    }

    setPickingSource(source);
    setMessage(null);

    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setMessage('사진 없이도 완료할 수 있어요.');
        return;
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
      };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync({
              ...options,
              allowsMultipleSelection: false,
              selectionLimit: 1,
            });
      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      onChange({
        uri: asset.uri,
        mimeType: asset.mimeType ?? null,
        width: asset.width,
        height: asset.height,
      });
      setMessage('사진은 이 기기에만 남아요.');
    } catch {
      setMessage('사진을 열지 못했어요. 사진 없이 계속할 수 있어요.');
    } finally {
      setPickingSource(null);
    }
  };

  return (
    <View style={styles.container}>
      {value ? (
        <View style={styles.previewRow}>
          <Image
            accessibilityLabel="선택한 완료 사진"
            source={{ uri: value.uri }}
            style={styles.preview}
          />
          <View style={styles.previewCopy}>
            <Text style={styles.previewTitle}>이 사진을 남길까요?</Text>
            <Text style={styles.previewDescription}>
              완료하면 이 기기에만 저장돼요.
            </Text>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                disabled={disabled}
                onPress={() => void pickPhoto('camera')}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>다시 찍기</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={disabled}
                onPress={() => {
                  onChange(null);
                  setMessage(null);
                }}
                style={({ pressed }) => [
                  styles.removeButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.removeButtonText}>사진 삭제</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <>
          <Pressable
            accessibilityHint="카메라를 열어 완료한 모습을 이 기기에만 남깁니다."
            accessibilityRole="button"
            accessibilityState={{ busy: isPicking, disabled }}
            disabled={disabled || isPicking}
            onPress={() => void pickPhoto('camera')}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.pressed,
              (disabled || isPicking) && styles.disabled,
            ]}
          >
            <Text style={styles.addIcon}>＋</Text>
            <View style={styles.addCopy}>
              <Text style={styles.addTitle}>
                {pickingSource === 'camera' ? '카메라 여는 중…' : '사진으로 남기기'}
              </Text>
              <Text style={styles.addDescription}>
                완료한 모습을 찍어 이 기기에만 남겨요
              </Text>
            </View>
          </Pressable>
          <Pressable
            accessibilityHint="사진 보관함에서 완료 사진을 선택합니다."
            accessibilityRole="button"
            disabled={disabled || isPicking}
            onPress={() => void pickPhoto('library')}
            style={({ pressed }) => [
              styles.libraryButton,
              pressed && styles.pressed,
              (disabled || isPicking) && styles.disabled,
            ]}
          >
            <Text style={styles.libraryButtonText}>
              {pickingSource === 'library' ? '앨범 여는 중…' : '앨범에서 선택'}
            </Text>
          </Pressable>
        </>
      )}

      {message ? (
        <Text accessibilityLiveRegion="polite" style={styles.message}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: {
      gap: tokens.spacing.xs,
    },
    addButton: {
      minHeight: 60,
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.colors.surfaceMuted,
    },
    addIcon: {
      color: tokens.colors.focus,
      fontFamily: tokens.font.uiRegular,
      fontSize: 24,
    },
    addCopy: {
      flex: 1,
      gap: 2,
    },
    addTitle: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.label,
    },
    addDescription: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.caption,
    },
    libraryButton: {
      minHeight: tokens.metrics.touchTarget,
      alignSelf: 'flex-start',
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.xs,
    },
    libraryButtonText: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.caption,
    },
    previewRow: {
      minHeight: 104,
      flexDirection: tokens.isLargeText ? 'column' : 'row',
      alignItems: 'center',
      gap: tokens.spacing.md,
      padding: tokens.spacing.sm,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.colors.surfaceMuted,
    },
    preview: {
      width: 80,
      height: 80,
      borderRadius: tokens.radius.sm,
      backgroundColor: tokens.colors.surfaceMuted,
    },
    previewCopy: {
      flex: 1,
      gap: 4,
    },
    previewTitle: {
      color: tokens.colors.textPrimary,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.label,
    },
    previewDescription: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.caption,
      lineHeight: 18,
    },
    actions: {
      flexDirection: 'row',
      gap: tokens.spacing.md,
      marginTop: 2,
    },
    secondaryButton: {
      minHeight: tokens.metrics.touchTarget,
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.xs,
    },
    secondaryButtonText: {
      color: tokens.colors.focus,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.caption,
    },
    removeButton: {
      minHeight: tokens.metrics.touchTarget,
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.xs,
    },
    removeButtonText: {
      color: tokens.colors.destructive,
      fontFamily: tokens.font.uiSemiBold,
      fontSize: tokens.type.caption,
    },
    message: {
      color: tokens.colors.textSecondary,
      fontFamily: tokens.font.uiRegular,
      fontSize: tokens.type.caption,
      lineHeight: 18,
    },
    pressed: {
      opacity: 0.58,
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
