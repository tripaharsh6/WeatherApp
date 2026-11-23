import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export const SunBadge = ({ size = 64 }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary }]}>
      <Ionicons name="sunny" size={size * 0.55} color="#ffffff" />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1a62d6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
});
