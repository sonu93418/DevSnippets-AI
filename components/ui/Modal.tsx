// ============================================================
// Modal — Bottom sheet / centered modal
// ============================================================
import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  type?: 'bottom' | 'center';
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  type = 'bottom',
}: ModalProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={type === 'bottom' ? 'slide' : 'fade'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 8 : 0}
        style={type === 'bottom' ? styles.bottomContainer : styles.centerContainer}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.sheet,
            type === 'bottom' ? styles.bottomSheet : styles.centerSheet,
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: type === 'bottom' ? BorderRadius.xl : BorderRadius.lg,
              borderTopRightRadius: type === 'bottom' ? BorderRadius.xl : BorderRadius.lg,
              borderRadius: type === 'center' ? BorderRadius.lg : undefined,
              ...theme.shadow.lg,
            },
          ]}
        >
          {/* Handle bar for bottom sheet */}
          {type === 'bottom' && (
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
            </View>
          )}

          {/* Header */}
          {title && (
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
              <Text
                style={[
                  styles.title,
                  { color: theme.colors.textPrimary, fontWeight: FontWeight.semibold },
                ]}
              >
                {title}
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {children}
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  sheet: {
    overflow: 'hidden',
  },
  bottomSheet: {
    maxHeight: '90%',
  },
  centerSheet: {},
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: FontSize.lg,
  },
});
