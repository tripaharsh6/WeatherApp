import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const HourlyForecastStrip = ({ hourly = [] }) => {
  const { colors } = useTheme();

  if (!hourly || hourly.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {hourly.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={[styles.hour, { color: colors.textSecondary }]}>{item.hour}</Text>
            <Text style={[styles.temp, { color: colors.textPrimary }]}>{item.temperature}°</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexGrow: 1,
  },
  item: {
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  hour: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  temp: {
    fontSize: 16,
    fontWeight: '700',
  },
});
