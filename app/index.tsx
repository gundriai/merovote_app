import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { apiService } from '../services/api';
import { translationService } from '../services/translation';
import { AggregatedPoll, PollCategory, PollStats } from '../types';
import Header from '../components/Header';
import VotingCard from '../components/VotingCard';
import ComparisonCard from '../components/ComparisonCard';
import BannerCarousel from '../components/BannerCarousel';
import PollCategories from '../components/PollCategories';

const POLL_CATEGORIES: PollCategory[] = [
  { id: 'All', label: 'All', icon: 'grid', order: 1, labelKey: 'home.categories.all' },
  { id: 'FaceToFace', label: 'Face to Face', icon: 'people', order: 2, labelKey: 'home.categories.face_to_face' },
  { id: 'Daily', label: 'Daily', icon: 'zap', order: 3, labelKey: 'home.categories.daily' },
  { id: 'Political', label: 'Political', icon: 'landmark', order: 4, labelKey: 'home.categories.political' },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<PollCategory>(POLL_CATEGORIES[0]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all polls data once
  const {
    data: allPollsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['all-polls'],
    queryFn: () => apiService.getPolls(), // Fetch all polls without category filter
  });

  // Filter polls locally based on selected category
  const polls = React.useMemo(() => {
    if (!allPollsData) return [];
    if (selectedCategory.id === 'All') return allPollsData;
    
    return allPollsData.filter(poll => {
      // Check if poll categories include the selected category
      return poll.category && poll.category.includes(selectedCategory.label);
    });
  }, [allPollsData, selectedCategory]);

  // Calculate stats from the fetched data
  const stats = React.useMemo(() => {
    if (!allPollsData) return null;
    
    const totalPolls = allPollsData.length;
    const totalVotes = allPollsData.reduce((sum, poll) => sum + (poll.totalVotes || 0), 0);
    const totalComments = allPollsData.reduce((sum, poll) => sum + (poll.totalComments || 0), 0);
    const activePolls = allPollsData.filter(poll => !poll.isHidden).length;
    
    return {
      totalPolls,
      activePolls,
      totalVotes,
      totalComments,
    };
  }, [allPollsData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCategoryChange = (category: PollCategory) => {
    setSelectedCategory(category);
  };

  const renderPoll = (poll: AggregatedPoll) => {
    if (poll.type === 'ONE_VS_ONE') {
      return <ComparisonCard key={poll.id} poll={poll} />;
    }
    return <VotingCard key={poll.id} poll={poll} />;
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Header stats={stats} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{translationService.t('home.error_loading_polls')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>{translationService.t('home.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header stats={stats} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Poll Categories */}
        <PollCategories
          categories={POLL_CATEGORIES}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Polls Section */}
        <View style={styles.pollsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{translationService.t('home.loading')}</Text>
            </View>
          ) : polls.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{translationService.t('home.no_polls')}</Text>
            </View>
          ) : (
            polls.map(renderPoll)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Add padding for bottom navigation
  },
  pollsContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
