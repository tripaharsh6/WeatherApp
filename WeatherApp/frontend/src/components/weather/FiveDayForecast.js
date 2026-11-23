import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const FiveDayForecast = ({ daily = [] }) => {
  const { colors } = useTheme();

  if (!daily || daily.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>5-day forecast</Text>
      <View style={[styles.listContainer, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        {daily.map((item, index) => (
          <View
            key={index}
            style={[
              styles.row,
              index < daily.length - 1 && [styles.rowBorder, { borderBottomColor: colors.borderLight }],
            ]}
          >
            <Text style={[styles.dayText, { color: colors.textPrimary }]}>{item.day}</Text>
            <Text style={[styles.conditionText, { color: colors.textSecondary }]}>{item.condition}</Text>
            <Text style={[styles.tempRange, { color: colors.textPrimary }]}>
              {item.max_temp}° / {item.min_temp}°
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  listContainer: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    width: 50,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  tempRange: {
    fontSize: 15,
    fontWeight: '700',
    width: 80,
    textAlign: 'right',
  },
});
