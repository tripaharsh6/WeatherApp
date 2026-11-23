import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export const HeroWeatherCard = ({
  city = 'Delhi',
  temperature = '31',
  temperatureUnit = '°C',
  condition = 'Partly cloudy',
  humidity = '48%',
  wind = '12 km/h',
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.heroCardBg }]}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <Text style={styles.cityText}>{city} · default city</Text>
        <Ionicons name="sunny-outline" size={26} color="#ffffff" />
      </View>

      {/* Main Temperature */}
      <Text style={styles.tempText}>
        {temperature}{temperatureUnit}
      </Text>

      {/* Condition Description */}
      <Text style={styles.conditionText}>{condition}</Text>

      {/* Metric Badges */}
      <View style={styles.pillRow}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Humidity {humidity}</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Wind {wind}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 22,
    marginVertical: 10,
    shadowColor: '#1a62d6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cityText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.95,
  },
  tempText: {
    color: '#ffffff',
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -1,
    marginVertical: 4,
  },
  conditionText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    opacity: 0.95,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 10,
  },
  pillText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});
