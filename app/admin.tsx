import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { apiService } from '../services/api';
import { AggregatedPoll, PollStats } from '../types';
import Header from '../components/Header';

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState('posts');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch admin data
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiService.getAdminStats(),
  });

  const {
    data: polls = [],
    isLoading: pollsLoading,
    error,
    refetch: refetchPolls,
  } = useQuery({
    queryKey: ['admin-polls'],
    queryFn: () => apiService.getAdminPolls(),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchPolls()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePause = async (pollId: string) => {
    try {
      await apiService.togglePollVisibility(pollId);
      Alert.alert('Success', 'Poll visibility has been toggled');
      refetchPolls();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle poll visibility');
    }
  };

  const handleDelete = async (pollId: string) => {
    Alert.alert(
      'Delete Poll',
      'Are you sure you want to delete this poll? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deletePoll(pollId);
              Alert.alert('Success', 'Poll has been deleted successfully');
              refetchPolls();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete poll');
            }
          },
        },
      ]
    );
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'REACTION_BASED': return 'Reaction-Based';
      case 'ONE_VS_ONE': return 'One vs One';
      default: return 'Vote';
    }
  };

  const getTypeBadgeColor = (type: string): string => {
    switch (type) {
      case 'REACTION_BASED': return '#10b981';
      case 'ONE_VS_ONE': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tabs = [
    { id: 'cards', label: 'Voter Cards', icon: 'grid-outline' },
    { id: 'posts', label: 'Poll Management', icon: 'settings-outline' },
    { id: 'analytics', label: 'Analytics', icon: 'pie-chart-outline' },
    { id: 'security', label: 'Security', icon: 'shield-outline' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'cards':
        return (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Ionicons name="grid-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyStateText}>Card management feature coming soon</Text>
            </View>
          </View>
        );
      case 'analytics':
        return (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Ionicons name="pie-chart-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyStateText}>Detailed analytics feature coming soon</Text>
            </View>
          </View>
        );
      case 'security':
        return (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Ionicons name="shield-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyStateText}>Security settings feature coming soon</Text>
            </View>
          </View>
        );
      case 'posts':
      default:
        return (
          <View style={styles.tabContent}>
            {pollsLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading polls...</Text>
              </View>
            ) : polls.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No polls found</Text>
              </View>
            ) : (
              polls.map((poll: AggregatedPoll) => (
                <View key={poll.id} style={styles.pollCard}>
                  <View style={styles.pollHeader}>
                    <View style={styles.pollInfo}>
                      <Text style={styles.pollTitle}>{poll.title}</Text>
                      {poll.description && (
                        <Text style={styles.pollDescription}>{poll.description}</Text>
                      )}
                      <View style={styles.pollMeta}>
                        <View style={[styles.typeBadge, { backgroundColor: getTypeBadgeColor(poll.type) }]}>
                          <Text style={styles.typeBadgeText}>{getTypeLabel(poll.type)}</Text>
                        </View>
                        {poll.isHidden && (
                          <View style={styles.pausedBadge}>
                            <Text style={styles.pausedBadgeText}>Paused</Text>
                          </View>
                        )}
                        <Text style={styles.metaText}>{formatDate(poll.createdAt)}</Text>
                        <Text style={styles.metaText}>{poll.totalVotes} votes</Text>
                        <Text style={styles.metaText}>{poll.totalComments} comments</Text>
                      </View>
                    </View>
                    <View style={styles.pollActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => Alert.alert('Edit', 'Edit functionality coming soon')}
                      >
                        <Ionicons name="create-outline" size={16} color="#3b82f6" />
                        <Text style={styles.actionButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, poll.isHidden ? styles.resumeButton : styles.pauseButton]}
                        onPress={() => handlePause(poll.id)}
                      >
                        <Ionicons 
                          name={poll.isHidden ? "play-outline" : "pause-outline"} 
                          size={16} 
                          color={poll.isHidden ? "#10b981" : "#f59e0b"} 
                        />
                        <Text style={[styles.actionButtonText, { color: poll.isHidden ? "#10b981" : "#f59e0b" }]}>
                          {poll.isHidden ? "Resume" : "Pause"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDelete(poll.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                        <Text style={[styles.actionButtonText, { color: "#ef4444" }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Vote Statistics */}
                  <View style={styles.voteStats}>
                    {poll.pollOptions && poll.pollOptions.length > 0 ? (
                      poll.pollOptions.slice(0, 3).map((option, index) => (
                        <View key={option.id} style={styles.statItem}>
                          <Text style={styles.statNumber}>{option.voteCount}</Text>
                          <Text style={styles.statLabel}>{option.label}</Text>
                        </View>
                      ))
                    ) : poll.voteCounts ? (
                      Object.entries(poll.voteCounts).slice(0, 3).map(([key, value], index) => (
                        <View key={key} style={styles.statItem}>
                          <Text style={styles.statNumber}>{value}</Text>
                          <Text style={styles.statLabel}>{key}</Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.noVotesContainer}>
                        <Text style={styles.noVotesText}>No votes yet</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header stats={stats} />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="bar-chart-outline" size={24} color="#dc2626" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats?.totalPolls || 0}</Text>
              <Text style={styles.statLabel}>Total Polls</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="people-outline" size={24} color="#3b82f6" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats?.activePolls || 0}</Text>
              <Text style={styles.statLabel}>Active Polls</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="chatbubble-outline" size={24} color="#10b981" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats?.totalComments || 0}</Text>
              <Text style={styles.statLabel}>Total Comments</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="grid-outline" size={24} color="#8b5cf6" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{stats?.totalVotes || 0}</Text>
              <Text style={styles.statLabel}>Total Votes</Text>
            </View>
          </View>
        </View>

        {/* Header with Refresh Button */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={onRefresh}
              disabled={pollsLoading}
            >
              <Ionicons 
                name="refresh" 
                size={16} 
                color="#6b7280" 
                style={pollsLoading ? styles.spinning : undefined}
              />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => Alert.alert('Create Poll', 'Poll creation feature coming soon')}
            >
              <Ionicons name="add" size={16} color="#ffffff" />
              <Text style={styles.createButtonText}>Create Poll</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error loading data</Text>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={16} 
                color={activeTab === tab.id ? '#dc2626' : '#6b7280'} 
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    gap: 4,
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#dc2626',
    borderRadius: 6,
    gap: 4,
  },
  createButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#dc2626',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  pollCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pollInfo: {
    flex: 1,
    marginRight: 12,
  },
  pollTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  pollDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  pollMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  pausedBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pausedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  pollActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  editButton: {
    borderColor: '#3b82f6',
  },
  pauseButton: {
    borderColor: '#f59e0b',
  },
  resumeButton: {
    borderColor: '#10b981',
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  voteStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  noVotesContainer: {
    flex: 1,
    alignItems: 'center',
  },
  noVotesText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
