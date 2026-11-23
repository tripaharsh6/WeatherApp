import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

export const SearchScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { updatePreferences } = useAuth();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchCities(query.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const searchCities = async (searchQuery) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/search/?q=${encodeURIComponent(searchQuery)}`);
      setResults(res.data || []);
    } catch (e) {
      console.log('Search error:', e?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async (cityItem) => {
    setActionLoading(cityItem.id);
    try {
      await apiClient.post('/cities/', {
        name: cityItem.name,
        lat: cityItem.lat,
        lon: cityItem.lon,
      });
      Alert.alert('Added', `${cityItem.name} has been added to your favorites.`);
    } catch (err) {
      const msg = err.response?.data?.name?.[0] || 'Could not add city to favorites.';
      Alert.alert('Notice', msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetDefault = async (cityName) => {
    try {
      await updatePreferences({ default_city: cityName });
      Alert.alert('Success', `${cityName} is now your default home city.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to update default city.');
    }
  };

  const renderResultItem = ({ item }) => (
    <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => navigation.navigate('CityDetail', { city: item.name, lat: item.lat, lon: item.lon })}
      >
        <Text style={[styles.cityName, { color: colors.textPrimary }]}>{item.name}</Text>
        <Text style={[styles.regionText, { color: colors.textSecondary }]}>
          {[item.admin1, item.country].filter(Boolean).join(', ')}
        </Text>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.smallBtn, { backgroundColor: colors.segmentInactiveBg }]}
          onPress={() => handleSetDefault(item.name)}
        >
          <Text style={[styles.smallBtnText, { color: colors.textPrimary }]}>Set Default</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallBtn, { backgroundColor: colors.primary }]}
          onPress={() => handleAddToFavorites(item)}
          disabled={actionLoading === item.id}
        >
          {actionLoading === item.id ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={[styles.smallBtnText, { color: '#ffffff', fontWeight: '700' }]}>+ Favorite</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Search City</Text>

        {/* Search Input Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            placeholder="Search city by name (e.g. Mumbai, Tokyo)..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        <FlatList
          data={results}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderResultItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading && query.trim() ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No matching cities found.
              </Text>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 16,
  },
  searchBar: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  loadingContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  resultCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cityName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  regionText: {
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBtn: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
  },
});
