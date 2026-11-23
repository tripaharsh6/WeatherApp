import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const memoryStore = {};

export const storage = {
  async setItem(key, value) {
    try {
      if (Platform.OS === 'web') {
        memoryStore[key] = value;
        try {
          localStorage.setItem(key, value);
        } catch (e) {}
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      memoryStore[key] = value;
    }
  },

  async getItem(key) {
    try {
      if (Platform.OS === 'web') {
        return memoryStore[key] || (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null);
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      return memoryStore[key] || null;
    }
  },

  async removeItem(key) {
    try {
      if (Platform.OS === 'web') {
        delete memoryStore[key];
        try {
          localStorage.removeItem(key);
        } catch (e) {}
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      delete memoryStore[key];
    }
  },
};
