import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { TodaysTipCard } from '../../components/weather/TodaysTipCard';
import { FiveDayForecast } from '../../components/weather/FiveDayForecast';
import { MetricsGrid } from '../../components/weather/MetricsGrid';

export const CityDetailScreen = ({ route, navigation }) => {
  const { city = 'Mumbai', lat, lon, isDefault = false } = route.params || {};
  const { colors } = useTheme();
  const { user } = useAuth();

  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCityForecast();
  }, [city, lat, lon]);

  const fetchCityForecast = async () => {
    setLoading(true);
    try {
      let endpoint = `/forecast/?city=${encodeURIComponent(city)}`;
      if (lat && lon) {
        endpoint = `/forecast/?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`;
      }
      const res = await apiClient.get(endpoint);
      setForecastData(res.data);
    } catch (e) {
      console.log('Error fetching forecast:', e?.message);
    } finally {
      setLoading(false);
    }
  };

  const units = user?.profile?.units || 'metric';
  const tempUnit = units === 'imperial' ? '°F' : '°C';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Top City Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>
                  {isDefault ? 'Default city' : 'Favorite city'}
                </Text>
                <Text style={[styles.cityName, { color: colors.textPrimary }]}>
                  {forecastData?.city || city}
                </Text>
              </View>
              <Text style={[styles.headerTemp, { color: colors.textPrimary }]}>
                {forecastData?.temperature ?? '29'}{tempUnit}
              </Text>
            </View>

            {/* Condition & Status */}
            <View style={styles.statusSection}>
              <Text style={[styles.conditionText, { color: colors.textPrimary }]}>
                {forecastData?.condition ?? 'Light rain'}
              </Text>
              <Text style={[styles.subText, { color: colors.textSecondary }]}>
                Feels like {forecastData?.feels_like ?? '31'}° · Updated just now
              </Text>
            </View>

            {/* Today's Tip */}
            <TodaysTipCard
              tip={forecastData?.tip ?? 'Rain expected. Take an umbrella.'}
            />

            {/* 5-Day Forecast Table */}
            <FiveDayForecast daily={forecastData?.daily} />

            {/* 2x2 Metrics Grid (Humidity, Wind, Sunrise, Sunset) */}
            <MetricsGrid metrics={forecastData?.metrics} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    padding: 6,
    marginLeft: -6,
  },
  loaderContainer: {
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  cityName: {
    fontSize: 28,
    fontWeight: '800',
  },
  headerTemp: {
    fontSize: 36,
    fontWeight: '800',
  },
  statusSection: {
    marginTop: 10,
    marginBottom: 6,
  },
  conditionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    fontWeight: '400',
  },
});
