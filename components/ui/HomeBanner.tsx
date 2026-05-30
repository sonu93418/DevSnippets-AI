// ============================================================
// Home Banner — Clean top header for the snippets dashboard
// ============================================================
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { Card } from './Card';

interface HomeBannerProps {
  snippetCount: number;
}

export function HomeBanner({ snippetCount }: HomeBannerProps) {
  const { theme } = useTheme();

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const titleEntrance = useRef(new Animated.Value(0)).current;
  const titleFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.timing(titleEntrance, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(titleFloat, { toValue: -3, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
          Animated.timing(titleFloat, { toValue: 3, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        ])
      ).start();
    });
  }, [rotateAnim, titleEntrance, titleFloat]);

  const rotateA = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotateB = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });
  const titleOpacity = titleEntrance;
  const titleTranslateY = titleFloat;

  function LogoMarkAnimated() {
    return (
      <View style={styles.logoShell}>
        <Animated.View style={[styles.logoGlowA, { transform: [{ rotate: rotateA }, { scale: 1.02 }] }]} />
        <Animated.View style={[styles.logoGlowB, { transform: [{ rotate: rotateB }, { scale: 0.98 }] }]} />
        <View style={styles.logoCore}>
          <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
        </View>
      </View>
    );
  }

  return (
    <Card
      elevated
      padding={0}
      style={[
        styles.card,
        {
          backgroundColor: theme.isDark ? 'rgba(45,106,159,0.14)' : 'rgba(45,106,159,0.06)',
          borderColor: theme.isDark ? 'rgba(91,164,208,0.18)' : 'rgba(45,106,159,0.12)',
        },
      ]}
    >
      <View style={[styles.blobA, { backgroundColor: theme.isDark ? 'rgba(91,164,208,0.10)' : 'rgba(91,164,208,0.12)' }]} />
      <View style={[styles.blobB, { backgroundColor: theme.isDark ? 'rgba(74,144,196,0.08)' : 'rgba(74,144,196,0.08)' }]} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <LogoMarkAnimated />
            <View style={styles.headerTextBlock}>
              <Animated.Text style={[styles.kicker, { color: theme.colors.primaryDark, opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] }]}>
                SNIPPETS
              </Animated.Text>
              <Animated.Text style={[styles.title, { color: theme.colors.textPrimary, opacity: titleOpacity, transform: [{ translateY: titleTranslateY }] }]}>
                Snippets
              </Animated.Text>
            </View>
          </View>
        </View>

        <View style={[styles.footerRow, { borderTopColor: theme.colors.border }]}>
          <View style={[styles.statPill, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Feather name="code" size={11} color={theme.colors.primary} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>Library</Text>
          </View>
          <Text style={[styles.helper, { color: theme.colors.textTertiary }]}>{snippetCount} saved snippets</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginBottom: Spacing.base,
    position: 'relative',
  },
  blobA: {
    position: 'absolute',
    top: -28,
    right: -18,
    width: 96,
    height: 96,
    borderRadius: 9999,
  },
  blobB: {
    position: 'absolute',
    bottom: -18,
    left: -16,
    width: 72,
    height: 72,
    borderRadius: 9999,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 18,
    gap: Spacing.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    minWidth: 0,
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.extrabold,
    letterSpacing: 1.6,
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.extrabold,
    letterSpacing: -0.9,
  },
  logoShell: {
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  logoGlowA: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 17,
    backgroundColor: 'rgba(45,106,159,0.18)',
    transform: [{ rotate: '-10deg' }],
  },
  logoGlowB: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(91,164,208,0.22)',
    transform: [{ rotate: '12deg' }],
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
  footerRow: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexShrink: 0,
  },
  statText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  helper: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    flexShrink: 1,
  },
});
