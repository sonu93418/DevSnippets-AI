import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useWindowDimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { router } from 'expo-router';

export default function TopNav({ title = 'Code Library' }: { title?: string }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const { theme, themeMode, setThemeMode } = useTheme();
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const sideInset = Math.max(72, Math.round(width * 0.22));
  const thoughtFontSize = width < 360 ? 16 : 22;
  const scaleAnim = useRef(new Animated.Value(1)).current;
    const [leftWidth, setLeftWidth] = useState(88);
    const [rightWidth, setRightWidth] = useState(88);
    const centerLeft = Math.max(sideInset, leftWidth + 12);
    const centerRight = Math.max(sideInset, rightWidth + 12);

  const THOUGHTS = [
    'BUGS',
    'SHIP IT',
    'LOL',
    'BRB',
    'WAT',
    'POG',
    'YUP',
    'AGAIN',
  ];
  const lightPalette = ['#0f172a', '#1f2937', '#1e40af', '#0f766e', '#92400e']; // darker, high-contrast on light backgrounds
  const darkPalette = ['#FF6B6B', '#FFD93D', '#6BF178', '#6BCBFF', '#B86BFF', '#FF8FB1']; // bright, readable on dark
  const palette = theme.isDark ? darkPalette : lightPalette;
  const color = palette[thoughtIndex % palette.length];
  const textShadowColor = theme.isDark ? color : 'rgba(0,0,0,0.12)';
  const textShadowRadius = theme.isDark ? 14 : 6;
  const textShadowOffset = theme.isDark ? { width: 0, height: 4 } : { width: 0, height: 1 };

  const AnimatedText = Animated.createAnimatedComponent(Text);

  useEffect(() => {
    const interval = setInterval(() => {
      setThoughtIndex((i) => (i + 1) % THOUGHTS.length);
    }, 2500);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.03, duration: 700, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.delay(1000),
      ]),
    );

    pulse.start();

    return () => {
      clearInterval(interval);
      pulse.stop();
    };
  }, [scaleAnim]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: theme.isDark ? 'rgba(18,18,20,0.6)' : 'rgba(255,255,255,0.86)',
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.left} onLayout={(e) => setLeftWidth(e.nativeEvent.layout.width)}>
        <View style={[styles.logoBadge, { backgroundColor: '#FFC94A', borderColor: '#2E2E2E' }]}>
          <View style={[styles.logoInner, { backgroundColor: '#7A5AF8' }]}>
            <Feather name="code" size={14} color="#F4F4F6" />
          </View>
        </View>
        {!compact && <Text style={[styles.appTitle, { color: theme.isDark ? '#F4F4F6' : '#2E2E2E' }]}>{title}</Text>}
      </View>

      {/* Center thought area (absolute, won't push other items) */}
      {!compact && (
        <Pressable
          onPress={() => setThoughtIndex((thoughtIndex + 1) % THOUGHTS.length)}
          hitSlop={8}
          style={[
            styles.centerAbsolute,
                {
                  top: insets.top + 12,
                  left: sideInset,
                  right: sideInset,
                },
          ]}
        >
          <Animated.Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[
              styles.thought,
              {
                color,
                fontSize: thoughtFontSize,
                fontWeight: '900',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                fontFamily: Platform.select({ ios: 'SnellRoundhand', android: 'cursive', default: 'cursive' }),
                textShadowColor,
                textShadowOffset,
                textShadowRadius,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {THOUGHTS[thoughtIndex]}
          </Animated.Text>
        </Pressable>
      )}

      <View style={styles.right} onLayout={(e) => setRightWidth(e.nativeEvent.layout.width)}>
        <Pressable
          onPress={() => router.push('/files')}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.86 : 1, backgroundColor: '#3EC9A6' }]}
        >
          <Feather name="search" size={18} color="#F4F4F6" />
        </Pressable>
        <Pressable
          onPress={() => setThemeMode(theme.isDark ? 'light' : 'dark')}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.86 : 1, backgroundColor: '#7A5AF8' }]}
        >
          <Feather
            name={themeMode === 'dark' || (themeMode === 'system' && theme.isDark) ? 'moon' : 'sun'}
            size={18}
            color="#F4F4F6"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    zIndex: 50,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  appTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.4 },
  action: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  thought: {
    fontSize: 13,
    letterSpacing: 0.2,
    opacity: 0.95,
    maxWidth: '100%'
  },
  centerAbsolute: {
    position: 'absolute',
    left: 88,
    right: 88,
    top: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});
