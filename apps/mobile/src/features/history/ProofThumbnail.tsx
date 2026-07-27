import { useMemo } from 'react';
import { Image, StyleSheet } from 'react-native';

import type { LocalProofPhoto } from '@/core/storage/proofFileRepository';
import { useThemeTokens, type ThemeTokens } from '@/design/tokens';

export function ProofThumbnail({ photo }: { photo: LocalProofPhoto }) {
  const tokens = useThemeTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  return (
    <Image
      accessibilityLabel="완료할 때 첨부한 사진"
      source={{ uri: photo.uri }}
      style={styles.image}
    />
  );
}

function createStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    image: {
      width: '100%',
      aspectRatio: 16 / 9,
      marginTop: tokens.spacing.sm,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.colors.surfaceMuted,
    },
  });
}
