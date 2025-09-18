import React from 'react';
import { View, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';
import BottomNavigation from './BottomNavigation';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const routesWithoutBottomNav = ['/login', '/admin'];

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const showBottomNav = !routesWithoutBottomNav.includes(pathname);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      {showBottomNav && <BottomNavigation />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  content: {
    flex: 1,
  },
});
