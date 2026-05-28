import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Spacing } from '../../constants/theme';

interface Props {
  style?: any;
  size?: number;
}

export function MacWindowControls({ style, size = 10 }: Props) {
  return (
    <View style={[styles.row, style]}>
      <View
        style={[
          styles.dot,
          { backgroundColor: '#FF5F56', width: size, height: size, borderRadius: size / 2 },
        ]}
      />
      <View
        style={[
          styles.dot,
          { backgroundColor: '#FFBD2E', width: size, height: size, borderRadius: size / 2 },
        ]}
      />
      <View
        style={[
          styles.dot,
          { backgroundColor: '#27C93F', width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    borderWidth: 0.8,
    borderColor: 'rgba(0,0,0,0.08)',
  },
});

export default MacWindowControls;
