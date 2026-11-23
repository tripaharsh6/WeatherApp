import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';
import { HeroWeatherCard } from '../../components/weather/HeroWeatherCard';
import { HourlyForecastStrip } from '../../components/weather/HourlyForecastStrip';
import { TodaysTipCard } from '../../components/weather/TodaysTipCard';
import { FavoriteCityCard } from '../../components/weather/FavoriteCityCard';

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();

  const [weatherData, setWeatherData] = useState(null);
  const [favoriteCities, setFavoriteCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch default city weather
      const weatherRes = await apiClient.get('/weather/');
      setWeatherData(weatherRes.data);

      // 2. Fetch favorite cities with weather summary
      const favRes = await apiClient.get('/weather/favorites/');
      setFavoriteCities(favRes.data || []);
    } catch (e) {
      console.log('Error loading home data:', e?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [loadData, navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const defaultCity = weatherData?.city || user?.profile?.default_city || 'Delhi';
  const units = user?.profile?.units || 'metric';
  const tempUnit = units === 'imperial' ? '°F' : '°C';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()}</Text>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Your weather</Text>
          </View>
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Primary Hero Weather Card (Delhi · default city) */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('CityDetail', { city: defaultCity, isDefault: true })}
            >
              <HeroWeatherCard
                city={defaultCity}
                temperature={weatherData?.temperature ?? '31'}
                temperatureUnit={tempUnit}
                condition={weatherData?.condition ?? 'Partly cloudy'}
                humidity={weatherData?.humidity ?? '48%'}
                wind={weatherData?.wind ?? (units === 'imperial' ? '7 mph' : '12 km/h')}
              />
            </TouchableOpacity>

            {/* Hourly Forecast Horizontal Strip */}
            <HourlyForecastStrip hourly={weatherData?.hourly} />

            {/* Today's Tip Card */}
            <TodaysTipCard
              tip={weatherData?.tip ?? 'It is hot and dry. Carry water with you.'}
            />

            {/* Favorite Cities Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Favorite cities</Text>
            </View>

            {favoriteCities.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No favorite cities yet. Add cities from Search or Settings!
                </Text>
              </View>
            ) : (
              favoriteCities.map((city) => (
                <FavoriteCityCard
                  key={city.id}
                  name={city.name}
                  condition={city.condition}
                  temperature={city.temperature}
                  temperatureUnit="°"
                  onPress={() => navigation.navigate('CityDetail', { city: city.name, lat: city.lat, lon: city.lon })}
                />
              ))
            )}
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
    paddingTop: 16,
    paddingBottom: 30,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  themeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loaderContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
