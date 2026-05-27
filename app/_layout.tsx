// ============================================================
// Root Layout — Expo Router + Tab Navigation
// ============================================================
import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../hooks/useTheme';
import { initializeDatabase } from '../lib/db/database';
import { initFileSystem } from '../lib/files/fileManager';

function TabsLayout() {
  const { theme } = useTheme();

  useEffect(() => {
    // SQLite v15: initializeDatabase is synchronous (skip on web)
    if (Platform.OS !== 'web') {
      try { initializeDatabase(); } catch (e) { console.error('DB init error', e); }
    }
    if (Platform.OS !== 'web') {
      initFileSystem().catch(console.error);
    }
  }, []);

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
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
            backgroundColor: theme.isDark
              ? 'rgba(21,24,31,0.94)'
              : 'rgba(255,255,255,0.94)',
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
          tabBarItemStyle: {
            borderRadius: 20,
            marginHorizontal: 3,
            marginVertical: 4,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.5,
            marginTop: 1,
          },
          tabBarIconStyle: {
            marginTop: 1,
          },
          headerStyle: {
            backgroundColor: theme.colors.surface,
            shadowOpacity: 0,
            elevation: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
          headerTitleStyle: {
            color: theme.colors.textPrimary,
            fontSize: 18,
            fontWeight: '700',
            letterSpacing: -0.4,
          },
          headerTintColor: theme.colors.primary,
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Snippets',
            tabBarLabel: 'Snippets',
            tabBarIcon: ({ color, size }) => (
              <Feather name="code" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarLabel: 'Favorites',
            tabBarIcon: ({ color, size }) => (
              <Feather name="star" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="files"
          options={{
            title: 'Files',
            tabBarLabel: 'Files',
            tabBarIcon: ({ color, size }) => (
              <Feather name="folder" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Feather name="settings" size={size} color={color} />
            ),
          }}
        />
        {/* Hidden screens (stack within tabs) */}
        <Tabs.Screen
          name="snippet/create"
          options={{ href: null, title: 'New Snippet' }}
        />
        <Tabs.Screen
          name="snippet/[id]"
          options={{ href: null, title: 'Snippet' }}
        />
        <Tabs.Screen
          name="snippet/ai-explain/[id]"
          options={{ href: null, title: 'AI Explanation' }}
        />
      </Tabs>
    </>
  );
}

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
