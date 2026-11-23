import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const FavoriteCityCard = ({
  name,
  condition,
  temperature,
  temperatureUnit = '°',
  onPress,
  onRemove,
  showRemove = false,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.leftInfo}>
        <Text style={[styles.cityName, { color: colors.textPrimary }]}>{name}</Text>
        {condition && (
          <Text style={[styles.condition, { color: colors.textSecondary }]}>{condition}</Text>
        )}
      </View>

      <View style={styles.rightAction}>
        {showRemove ? (
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.removeText, { color: colors.danger }]}>Remove</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.temperature, { color: colors.textPrimary }]}>
            {temperature}{temperatureUnit}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginVertical: 6,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  leftInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  condition: {
    fontSize: 14,
    fontWeight: '500',
  },
  rightAction: {
    alignItems: 'flex-end',
  },
  temperature: {
    fontSize: 22,
    fontWeight: '700',
  },
  removeText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
