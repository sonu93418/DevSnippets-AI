// ============================================================
// Card — Elevated surface with Scandinavian shadow & borders
// ============================================================
import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, LayoutChangeEvent } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  padding?: number;
  noBorder?: boolean;
  // show subtle dot-grid overlay (auto-enabled in dark/black theme when elevated)
  dotGrid?: boolean;
}

export function Card({
  children,
  style,
  elevated = false,
  padding = 16,
  noBorder = false,
  dotGrid,
}: CardProps) {
  const { theme } = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });

  // By default show dots on elevated cards; explicit `dotGrid` prop can override
  const showDots = typeof dotGrid === 'boolean' ? dotGrid : elevated;

  function onLayout(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  }

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surface,
          borderColor: noBorder ? 'transparent' : theme.colors.border,
          borderRadius: BorderRadius.lg,
          padding,
          ...(elevated ? theme.shadow.md : theme.shadow.sm),
        },
        style,
      ]}
    >
      {showDots && size.width > 0 && (
        <View pointerEvents="none" style={[styles.dotWrapper, { width: size.width, height: size.height }]}> 
          <DotGrid
            width={size.width}
            height={size.height}
            color={theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
            spacing={14}
            dotSize={2}
          />
        </View>
      )}

      {children}
    </View>
  );
}

function DotGrid({ width, height, spacing = 18, dotSize = 2, color = 'rgba(255,255,255,0.04)' }: { width: number; height: number; spacing?: number; dotSize?: number; color?: string }) {
  const cols = Math.max(1, Math.floor(width / spacing));
  const rows = Math.max(1, Math.floor(height / spacing));
  const dots: { left: number; top: number; key: string }[] = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      dots.push({ left: c * spacing, top: r * spacing, key: `${r}_${c}` });
    }
  }

  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width, height }}>
      {dots.map((d) => (
        <View
          key={d.key}
          style={{
            position: 'absolute',
            left: d.left - dotSize / 2,
            top: d.top - dotSize / 2,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  dotWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
