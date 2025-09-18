import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PollStats } from '../types';
import { translationService } from '../services/translation';

interface HeaderProps {
  stats?: PollStats;
}

export default function Header({ stats }: HeaderProps) {
  const handleLogin = () => {
    router.push('/login');
  };

  const handleAdmin = () => {
    router.push('/admin');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
            </View>
            <Text style={styles.appName}>{translationService.t('header.app_name')}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>{translationService.t('header.nav.login')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Bar */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statDot} />
            <Text style={styles.statText}>{stats.activePolls || 0} {translationService.t('header.status.verified')}</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.statText}>{translationService.t('header.status.secure')}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 6,
  },
  loginButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
