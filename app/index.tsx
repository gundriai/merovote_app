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
import { AggregatedPoll, PollCategory, PollStats } from '../types';
import Header from '../components/Header';
import VotingCard from '../components/VotingCard';
import ComparisonCard from '../components/ComparisonCard';
import BannerCarousel from '../components/BannerCarousel';
import PollCategories from '../components/PollCategories';

const POLL_CATEGORIES: PollCategory[] = [
  { id: 'ALL', label: 'All', icon: 'grid', order: 0 },
  { id: 'POLITICS', label: 'Politics', icon: 'landmark', order: 1 },
  { id: 'SOCIAL', label: 'Social', icon: 'users', order: 2 },
  { id: 'ENTERTAINMENT', label: 'Entertainment', icon: 'star', order: 3 },
  { id: 'SPORTS', label: 'Sports', icon: 'zap', order: 4 },
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
    if (selectedCategory.id === 'ALL') return allPollsData;
    
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
          <Text style={styles.errorText}>Error loading polls</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
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
              <Text style={styles.loadingText}>Loading polls...</Text>
            </View>
          ) : polls.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No polls found</Text>
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
