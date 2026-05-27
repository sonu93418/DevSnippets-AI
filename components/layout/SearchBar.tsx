// ============================================================
// SearchBar — Animated search input with filter chip
// ============================================================
import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search snippets...',
  onFocus,
}: SearchBarProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.01,
      useNativeDriver: true,
      friction: 8,
    }).start();
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: focused ? theme.colors.primary : theme.colors.border,
          borderRadius: BorderRadius.full,
          transform: [{ scale: scaleAnim }],
          ...theme.shadow.sm,
        },
      ]}
    >
      <Feather
        name="search"
        size={18}
        color={focused ? theme.colors.primary : theme.colors.textTertiary}
        style={styles.icon}
      />
      <TextInput
        style={[styles.input, { color: theme.colors.textPrimary, fontSize: FontSize.base }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {value.length > 0 && Platform.OS !== 'ios' && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearBtn}>
          <Feather name="x-circle" size={16} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    height: 48,
    paddingHorizontal: Spacing.base,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
    marginLeft: Spacing.xs,
  },
});
