// ============================================================
// Home Banner — Clean top header for the snippets dashboard
// ============================================================
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { Card } from './Card';

interface HomeBannerProps {
  snippetCount: number;
}

function LogoMark() {
  return (
    <View style={styles.logoShell}>
      <View style={styles.logoGlowA} />
      <View style={styles.logoGlowB} />
      <View style={styles.logoCore}>
        <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
      </View>
    </View>
  );
}

export function HomeBanner({ snippetCount }: HomeBannerProps) {
  const { theme } = useTheme();

  return (
    <Card
      elevated
      padding={0}
      style={[
        styles.card,
        {
          backgroundColor: theme.isDark ? 'rgba(45,106,159,0.14)' : 'rgba(45,106,159,0.05)',
          borderColor: theme.isDark ? 'rgba(91,164,208,0.18)' : 'rgba(45,106,159,0.10)',
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <LogoMark />
            <View style={styles.headerTextBlock}>
              <Text style={[styles.kicker, { color: theme.colors.primaryDark }]}>SNIPPETS</Text>
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Snippets</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Your saved code, neatly in one place.</Text>
            </View>
          </View>

          <View style={[styles.countPill, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primaryDark }]}>
            <Feather name="code" size={12} color="#fff" />
            <Text style={styles.countText}>{snippetCount} saved</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.base,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    flex: 1,
    minWidth: 0,
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extrabold,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  logoShell: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  logoGlowA: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(45,106,159,0.20)',
    transform: [{ rotate: '-8deg' }],
  },
  logoGlowB: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(91,164,208,0.24)',
    transform: [{ rotate: '10deg' }],
  },
  logoCore: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#10131A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  logoImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexShrink: 0,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },
});
