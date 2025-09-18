import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PollCategory } from '../types';

interface PollCategoriesProps {
  categories: PollCategory[];
  selectedCategory: PollCategory;
  onCategoryChange: (category: PollCategory) => void;
}

const getIconName = (iconType: string): keyof typeof Ionicons.glyphMap => {
  switch (iconType) {
    case 'grid':
      return 'grid-outline';
    case 'landmark':
      return 'business-outline';
    case 'users':
      return 'people-outline';
    case 'star':
      return 'star-outline';
    case 'zap':
      return 'flash-outline';
    default:
      return 'grid-outline';
  }
};

export default function PollCategories({
  categories,
  selectedCategory,
  onCategoryChange,
}: PollCategoriesProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isActive = selectedCategory.id === category.id;
          const iconName = getIconName(category.icon);
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryButton, isActive && styles.activeCategoryButton]}
              onPress={() => onCategoryChange(category)}
            >
              <Ionicons
                name={iconName}
                size={16}
                color={isActive ? '#dc2626' : '#6b7280'}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.categoryText,
                  isActive && styles.activeCategoryText,
                ]}
              >
                {category.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  activeCategoryButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  icon: {
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeCategoryText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#dc2626',
    borderRadius: 1,
  },
});
