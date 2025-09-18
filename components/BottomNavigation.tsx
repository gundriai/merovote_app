import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';

interface TabItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const tabs: TabItem[] = [
  {
    name: 'Home',
    icon: 'home-outline',
    activeIcon: 'home',
    route: '/',
  },
  {
    name: 'Search',
    icon: 'search-outline',
    activeIcon: 'search',
    route: '/search',
  },
  {
    name: 'Create',
    icon: 'add-circle-outline',
    activeIcon: 'add-circle',
    route: '/create',
  },
  {
    name: 'Activity',
    icon: 'heart-outline',
    activeIcon: 'heart',
    route: '/activity',
  },
  {
    name: 'Profile',
    icon: 'person-outline',
    activeIcon: 'person',
    route: '/profile',
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  const handleTabPress = (route: string) => {
    router.push(route);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.route;
          const IconComponent = isActive ? tab.activeIcon : tab.icon;
          
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={IconComponent}
                  size={24}
                  color={isActive ? '#000000' : '#8e8e8e'}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 0.5,
    borderTopColor: '#dbdbdb',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: '#8e8e8e',
    fontWeight: '400',
  },
  activeTabLabel: {
    color: '#000000',
    fontWeight: '500',
  },
});
