import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const MetricsGrid = ({ metrics }) => {
  const { colors } = useTheme();

  if (!metrics) return null;

  const items = [
    { label: 'Humidity', value: metrics.humidity || '78%' },
    { label: 'Wind', value: metrics.wind || '16 km/h' },
    { label: 'Sunrise', value: metrics.sunrise || '6:42 AM' },
    { label: 'Sunset', value: metrics.sunset || '5:58 PM' },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item, index) => (
        <View
          key={index}
          style={[styles.tile, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
        >
          <Text style={[styles.label, { color: colors.textSecondary }]}>{item.label}</Text>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  tile: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
  },
});
