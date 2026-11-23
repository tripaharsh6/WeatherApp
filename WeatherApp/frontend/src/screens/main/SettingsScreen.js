import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../api/client';
import { CustomButton } from '../../components/common/CustomButton';
import { FavoriteCityCard } from '../../components/weather/FavoriteCityCard';

export const SettingsScreen = ({ navigation }) => {
  const { user, updatePreferences, logout } = useAuth();
  const { colors, themeMode, updateTheme, isDark } = useTheme();

  const [units, setUnits] = useState(user?.profile?.units || 'metric');
  const [favoriteCities, setFavoriteCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDefaultCity, setNewDefaultCity] = useState('');
  const [savingDefault, setSavingDefault] = useState(false);

  useEffect(() => {
    if (user?.profile?.units) {
      setUnits(user.profile.units);
    }
    loadFavoriteCities();
  }, [user]);

  const loadFavoriteCities = async () => {
    setLoadingCities(true);
    try {
      const res = await apiClient.get('/cities/');
      setFavoriteCities(res.data || []);
    } catch (e) {
      console.log('Error loading favorites:', e?.message);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleUnitChange = async (newUnit) => {
    if (units === newUnit) return;
    setUnits(newUnit);
    try {
      await updatePreferences({ units: newUnit });
    } catch (e) {
      Alert.alert('Error', 'Failed to update temperature units.');
    }
  };

  const handleThemeChange = async (newTheme) => {
    if (themeMode === newTheme) return;
    try {
      updateTheme(newTheme);
      await updatePreferences({ theme: newTheme });
    } catch (e) {
      console.log('Error updating theme preference:', e?.message);
    }
  };

  const handleRemoveCity = async (id, cityName) => {
    Alert.alert(
      'Remove City',
      `Remove ${cityName} from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/cities/${id}/`);
              setFavoriteCities(prev => prev.filter(c => c.id !== id));
            } catch (e) {
              Alert.alert('Error', 'Failed to remove favorite city.');
            }
          },
        },
      ]
    );
  };

  const handleSaveDefaultCity = async () => {
    if (!newDefaultCity.trim()) return;
    setSavingDefault(true);
    try {
      await updatePreferences({ default_city: newDefaultCity.trim() });
      setModalVisible(false);
      setNewDefaultCity('');
      Alert.alert('Success', `Default city updated to ${newDefaultCity.trim()}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to update default city.');
    } finally {
      setSavingDefault(false);
    }
  };

  const defaultCity = user?.profile?.default_city || 'Delhi';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>

        {/* Units Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Units</Text>
          <View style={[styles.segmentContainer, { backgroundColor: colors.segmentInactiveBg }]}>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                units === 'metric' && [styles.segmentActive, { backgroundColor: colors.segmentActiveBg }],
              ]}
              onPress={() => handleUnitChange('metric')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: units === 'metric' ? colors.segmentActiveText : colors.segmentInactiveText },
                ]}
              >
                Celsius
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentBtn,
                units === 'imperial' && [styles.segmentActive, { backgroundColor: colors.segmentActiveBg }],
              ]}
              onPress={() => handleUnitChange('imperial')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: units === 'imperial' ? colors.segmentActiveText : colors.segmentInactiveText },
                ]}
              >
                Fahrenheit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Theme</Text>
          <View style={[styles.segmentContainer, { backgroundColor: colors.segmentInactiveBg }]}>
            <TouchableOpacity
              style={[
                styles.segmentBtn,
                themeMode === 'light' && [styles.segmentActive, { backgroundColor: colors.segmentActiveBg }],
              ]}
              onPress={() => handleThemeChange('light')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: themeMode === 'light' ? colors.segmentActiveText : colors.segmentInactiveText },
                ]}
              >
                Light
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentBtn,
                themeMode === 'dark' && [styles.segmentActive, { backgroundColor: colors.segmentActiveBg }],
              ]}
              onPress={() => handleThemeChange('dark')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: themeMode === 'dark' ? colors.segmentActiveText : colors.segmentInactiveText },
                ]}
              >
                Dark
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Default City Section */}
        <View style={styles.section}>
          <View style={[styles.defaultCityCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <View>
              <Text style={[styles.defaultCityLabel, { color: colors.textSecondary }]}>Default city</Text>
              <Text style={[styles.defaultCityName, { color: colors.textPrimary }]}>{defaultCity}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setNewDefaultCity(defaultCity);
                setModalVisible(true);
              }}
            >
              <Text style={[styles.changeLink, { color: colors.primaryLight }]}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Favorite Cities Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Favorite cities</Text>
          {loadingCities ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
          ) : favoriteCities.length === 0 ? (
            <Text style={[styles.noCitiesText, { color: colors.textSecondary }]}>
              No favorite cities added yet.
            </Text>
          ) : (
            favoriteCities.map((c) => (
              <FavoriteCityCard
                key={c.id}
                name={c.name}
                showRemove
                onRemove={() => handleRemoveCity(c.id, c.name)}
              />
            ))
          )}

          {/* Add a city dashed button */}
          <CustomButton
            title="Add a city"
            variant="dashed"
            onPress={() => navigation.navigate('Search')}
            style={styles.addCityBtn}
          />
        </View>

        {/* Log Out Button */}
        <View style={styles.logoutContainer}>
          <CustomButton
            title="Log out"
            variant="secondary"
            onPress={logout}
            style={[styles.logoutBtn, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            textStyle={{ color: colors.textPrimary }}
          />
        </View>

        {/* Modal for Changing Default City */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Change Default City</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary },
                ]}
                value={newDefaultCity}
                onChangeText={setNewDefaultCity}
                placeholder="Enter city name (e.g. Delhi, London)"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveDefaultCity}
                  disabled={savingDefault}
                >
                  {savingDefault ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={{ color: '#ffffff', fontWeight: '700' }}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
  },
  defaultCityCard: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  defaultCityLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  defaultCityName: {
    fontSize: 18,
    fontWeight: '700',
  },
  changeLink: {
    fontSize: 15,
    fontWeight: '600',
  },
  noCitiesText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 8,
  },
  addCityBtn: {
    marginTop: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  logoutContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  logoutBtn: {
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
});
