import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const TodaysTipCard = ({ tip, style }) => {
  const { colors, isDark } = useTheme();

  if (!tip) return null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.tipBg : '#e8f5e9',
          borderColor: isDark ? colors.tipBorder : '#c8e6c9',
        },
        style,
      ]}
    >
      <Text style={[styles.title, { color: isDark ? colors.tipTitle : '#1b5e20' }]}>Today's tip</Text>
      <Text style={[styles.tip, { color: isDark ? colors.tipText : '#2e7d32' }]}>{tip}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  tip: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
