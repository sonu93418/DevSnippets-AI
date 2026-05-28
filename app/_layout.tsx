// Root Layout — simplified, responsive header
import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import TopNav from '../components/layout/TopNav';
import { initializeDatabase } from '../lib/db/database';
import { initFileSystem } from '../lib/files/fileManager';
import { router } from 'expo-router';

function BackgroundTemplate() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 360;

  return (
    <View pointerEvents="none" style={styles.backgroundLayer}>
      <View
        style={[
          styles.bgOrbTop,
          compact ? styles.bgOrbTopCompact : {},
          { backgroundColor: theme.isDark ? 'rgba(122,90,248,0.12)' : 'rgba(122,90,248,0.06)' },
        ]}
      />
      <View
        style={[
          styles.bgOrbBottom,
          compact ? styles.bgOrbBottomCompact : {},
          { backgroundColor: theme.isDark ? 'rgba(62,201,166,0.08)' : 'rgba(62,201,166,0.04)' },
        ]}
      />
    </View>
  );
}

function HeaderTitle({ title }: { title: string }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const showTagline = width >= 360;

  return (
    <View style={styles.titleWrap}>
      <View style={[styles.iconBadge, { backgroundColor: '#FFC94A', borderColor: '#2E2E2E' }]}> 
        <View style={[styles.logoInner, { backgroundColor: '#7A5AF8' }]}>
          <Feather name="code" size={14} color="#F4F4F6" />
        </View>
      </View>
      <View style={styles.wordmarkTextBlock}>
        <Text style={[styles.kicker, { color: theme.isDark ? '#FFC94A' : '#7A5AF8' }]}>CODE LIBRARY</Text>
        {showTagline && <Text style={[styles.taglineSmall, { color: theme.isDark ? '#3EC9A6' : '#4B4B4B' }]}>Works on my machine 😎</Text>}
        <Text style={[styles.title, { color: theme.isDark ? '#F4F4F6' : '#2E2E2E' }]}>{title}</Text>
      </View>
    </View>
  );
}

function HeaderAction() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const size = compact ? 44 : 36;
  const iconSize = compact ? 20 : 17;

  return (
    <View style={styles.headerActionRow}>
      <Pressable
        onPress={() => router.push('/settings')}
        style={({ pressed }) => [
          styles.iconAction,
          {
            width: size,
            height: size,
            borderRadius: Math.round(size / 2),
            backgroundColor: '#3EC9A6',
            borderColor: theme.isDark ? 'rgba(244,244,246,0.14)' : 'rgba(46,46,46,0.10)',
            opacity: pressed ? 0.86 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
        hitSlop={10}
      >
        <Feather name="search" size={iconSize} color="#F4F4F6" />
      </Pressable>

      <Pressable
        onPress={() => router.push('/settings')}
        style={({ pressed }) => [
          styles.iconAction,
          {
            width: size,
            height: size,
            borderRadius: Math.round(size / 2),
            backgroundColor: '#7A5AF8',
            borderColor: theme.isDark ? 'rgba(244,244,246,0.14)' : 'rgba(46,46,46,0.10)',
            opacity: pressed ? 0.86 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
        hitSlop={10}
      >
        <Feather name="settings" size={iconSize} color="#F4F4F6" />
      </Pressable>
    </View>
  );
}

function HeaderBackground() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 360;

  return (
    <View
      style={[
        styles.headerBackground,
        {
          top: compact ? 6 : 6,
          left: compact ? 8 : 10,
          right: compact ? 8 : 10,
          bottom: compact ? 4 : 6,
          backgroundColor: theme.isDark ? 'rgba(46,46,46,0.94)' : 'rgba(244,244,246,0.96)',
          borderColor: theme.isDark ? 'rgba(122,90,248,0.26)' : 'rgba(122,90,248,0.18)',
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: compact ? 8 : 16,
          shadowOffset: { width: 0, height: compact ? 4 : 8 },
          elevation: compact ? 6 : 9,
        },
      ]}
    >
      <View pointerEvents="none" style={[styles.headerTopGlow, { backgroundColor: theme.isDark ? 'rgba(122,90,248,0.18)' : 'rgba(122,90,248,0.10)' }]} />
      <View pointerEvents="none" style={[styles.headerBottomGlow, { backgroundColor: theme.isDark ? 'rgba(62,201,166,0.12)' : 'rgba(62,201,166,0.08)' }]} />
    </View>
  );
}

function TabsLayout() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const headerHeight = compact ? 72 : 88;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      try { initializeDatabase(); } catch (e) { console.error('DB init error', e); }
      initFileSystem().catch(console.error);
    }
  }, []);

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <View style={[styles.shell, { backgroundColor: theme.colors.background }]}>
        <BackgroundTemplate />
        <TopNav />
        <Tabs
          screenOptions={{
            headerShown: false,
            headerTitleAlign: 'center',
            tabBarShowLabel: true,
            tabBarActiveTintColor: theme.colors.tabActive,
            tabBarInactiveTintColor: theme.colors.tabInactive,
            tabBarHideOnKeyboard: true,
            tabBarLabelPosition: 'below-icon',
            tabBarStyle: {
              position: 'absolute',
              left: 16,
              right: 16,
              bottom: Platform.OS === 'ios' ? 14 : 12,
              backgroundColor: theme.isDark ? 'rgba(21,24,31,0.94)' : 'rgba(255,255,255,0.94)',
              borderColor: theme.colors.border,
              borderWidth: 1.2,
              borderRadius: 28,
              height: Platform.OS === 'ios' ? 80 : 72,
              paddingTop: 9,
              paddingBottom: Platform.OS === 'ios' ? 18 : 10,
              paddingHorizontal: 10,
              elevation: 22,
              shadowColor: '#000',
              shadowOpacity: 0.16,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 12 },
            },
            headerStyle: {
              backgroundColor: 'transparent',
              borderBottomWidth: 0,
              height: headerHeight,
            },
            headerTitleStyle: {
              color: theme.colors.textPrimary,
              fontSize: compact ? 16 : 18,
              fontWeight: '700',
              letterSpacing: -0.4,
            },
            headerTintColor: theme.colors.primary,
            headerShadowVisible: false,
            headerTitleContainerStyle: {
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: compact ? 6 : 8,
              paddingTop: 0,
            },
            headerRightContainerStyle: {
              paddingRight: compact ? 6 : 10,
              paddingTop: 0,
            },
            headerBackground: () => <HeaderBackground />,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Snippets',
              tabBarLabel: 'Snippets',
              headerTitle: () => <HeaderTitle title="Snippets" />,
              headerRight: () => <HeaderAction />,
              tabBarIcon: ({ color, size }) => <Feather name="code" size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="favorites"
            options={{
              title: 'Favorites',
              tabBarLabel: 'Favorites',
              headerTitle: () => <HeaderTitle title="Favorites" />,
              tabBarIcon: ({ color, size }) => <Feather name="star" size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="files"
            options={{
              title: 'Files',
              tabBarLabel: 'Files',
              headerTitle: () => <HeaderTitle title="Files" />,
              tabBarIcon: ({ color, size }) => <Feather name="folder" size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarLabel: 'Settings',
              headerTitle: () => <HeaderTitle title="Settings" />,
              tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} />,
            }}
          />

          <Tabs.Screen name="snippet/create" options={{ href: null, title: 'New Snippet' }} />
          <Tabs.Screen name="snippet/[id]" options={{ href: null, title: 'Snippet' }} />
          <Tabs.Screen name="snippet/ai-explain/[id]" options={{ href: null, title: 'AI Explanation' }} />
        </Tabs>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  logoInner: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  wordmarkTextBlock: { justifyContent: 'center' },
  kicker: { fontSize: 8, fontWeight: '800', letterSpacing: 1.7 },
  taglineSmall: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3, marginTop: 1 },
  title: { fontSize: 16, fontWeight: '800', letterSpacing: -0.6 },
  headerActionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconAction: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  headerBackground: { ...StyleSheet.absoluteFillObject, borderRadius: 26, overflow: 'hidden' },
  headerTopGlow: { position: 'absolute', top: -18, left: 24, right: 24, height: 42, borderRadius: 9999, opacity: 0.55 },
  headerBottomGlow: { position: 'absolute', bottom: -16, left: 32, right: 32, height: 28, borderRadius: 9999, opacity: 0.45 },
  shell: { flex: 1 },
  backgroundLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  bgOrbTop: { position: 'absolute', top: -56, right: -40, width: 220, height: 220, borderRadius: 44, transform: [{ rotate: '18deg' }] },
  bgOrbTopCompact: { width: 140, height: 140, top: -36, right: -18, transform: [{ rotate: '12deg' }], opacity: 0.9 },
  bgOrbBottom: { position: 'absolute', bottom: 132, left: -42, width: 240, height: 240, borderRadius: 52, transform: [{ rotate: '-14deg' }] },
  bgOrbBottomCompact: { width: 160, height: 160, bottom: 84, left: -22, transform: [{ rotate: '-10deg' }] },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <TabsLayout />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
