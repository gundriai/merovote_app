import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AggregatedPoll, VoteOption } from '../types';
import { apiService } from '../services/api';
import { showAlert, hapticFeedback, formatTimeRemaining } from '../utils/mobile';

interface VotingCardProps {
  poll: AggregatedPoll;
}

const getIconFromName = (iconName: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
    'thumbs-up': 'thumbs-up-outline',
    'thumbs-down': 'thumbs-down-outline',
    'flame': 'flame-outline',
    'star': 'star-outline',
    'minus': 'remove-outline',
    'heart': 'heart-outline',
    'zap': 'flash-outline',
  };
  return iconMap[iconName] || 'thumbs-up-outline';
};

const getVoteOptions = (pollType: string): VoteOption[] => {
  if (pollType === 'REACTION_BASED') {
    return [
      { type: 'gajjab', label: 'Gajjab', icon: 'thumbs-up', color: 'green', bgColor: 'bg-green-500', hoverColor: 'hover:bg-green-50' },
      { type: 'bekar', label: 'Bekar', icon: 'thumbs-down', color: 'red', bgColor: 'bg-red-500', hoverColor: 'hover:bg-red-50' },
      { type: 'furious', label: 'Furious', icon: 'flame', color: 'orange', bgColor: 'bg-orange-500', hoverColor: 'hover:bg-orange-50' },
    ];
  }
  return [];
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

const getColorStyle = (color: string) => {
  const colorMap: { [key: string]: any } = {
    'green': { bg: '#10b981', text: '#065f46', border: '#059669' },
    'red': { bg: '#ef4444', text: '#991b1b', border: '#dc2626' },
    'blue': { bg: '#3b82f6', text: '#1e40af', border: '#2563eb' },
    'yellow': { bg: '#eab308', text: '#a16207', border: '#ca8a04' },
    'purple': { bg: '#8b5cf6', text: '#6b21a8', border: '#7c3aed' },
    'orange': { bg: '#f97316', text: '#c2410c', border: '#ea580c' },
    'pink': { bg: '#ec4899', text: '#be185d', border: '#db2777' },
  };
  return colorMap[color] || colorMap['blue'];
};

export default function VotingCard({ poll }: VotingCardProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Use poll options from API if available, otherwise fallback to hardcoded options
  const voteOptions = poll.pollOptions && poll.pollOptions.length > 0 
    ? poll.pollOptions.map(option => ({
        type: option.type || option.label || 'unknown',
        label: option.label || 'Unknown',
        icon: option.icon || 'thumbs-up',
        color: option.color || 'blue',
        bgColor: 'bg-blue-500',
        hoverColor: 'hover:bg-blue-50',
      }))
    : getVoteOptions(poll.type);

  // Check if user has voted
  useEffect(() => {
    setHasVoted(poll.votedDetails?.alreadyVoted || false);
  }, [poll.votedDetails?.alreadyVoted]);

  // Calculate time remaining
  useEffect(() => {
    const updateTimeRemaining = () => {
      setTimeRemaining(formatTimeRemaining(poll.endDate));
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [poll.endDate]);

  // Use vote counts from poll options data
  const voteCounts = poll.pollOptions?.reduce((acc, option) => {
    acc[option.type || option.label || 'unknown'] = option.voteCount;
    return acc;
  }, {} as { [key: string]: number }) || {};

  // Real voting with API call
  const handleVoteAction = async (voteType: string) => {
    try {
      // Find the poll option ID for this vote type
      const pollOption = poll.pollOptions?.find(option => option.type === voteType);
      if (!pollOption) {
        throw new Error('Poll option not found');
      }

      await apiService.voteOnPoll(poll.id, pollOption.id);
      
      setHasVoted(true);
      hapticFeedback.success();
      showAlert('Success', 'Your vote has been recorded successfully!', 'success');
    } catch (error) {
      // Check if it's an authentication error first
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('Authentication required'))) {
        // Don't log 401 errors to console as they're expected for unauthenticated users
        hapticFeedback.warning();
        showAlert('Login Required', 'Please login to cast your vote', 'warning');
        // Navigate to login screen immediately
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        // Log other errors and show error message
        console.error('Error voting:', error);
        hapticFeedback.error();
        showAlert('Error', 'Failed to cast vote. Please try again.', 'error');
      }
    }
  };

  const handleVote = (voteType: string) => {
    if (hasVoted) {
      hapticFeedback.warning();
      showAlert('Info', 'You have already voted on this poll', 'warning');
      return;
    }

    if (new Date() > new Date(poll.endDate)) {
      hapticFeedback.warning();
      showAlert('Info', 'This poll has ended', 'warning');
      return;
    }

    hapticFeedback.medium();
    handleVoteAction(voteType);
  };

  const isExpired = new Date() > new Date(poll.endDate);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { backgroundColor: getTypeBadgeColor(poll.type) }]}>
                <Text style={styles.badgeText}>{getTypeLabel(poll.type)}</Text>
              </View>
              <Text style={styles.timeText}>{timeRemaining}</Text>
            </View>
            <Text style={styles.title}>{poll.title}</Text>
            {poll.description && (
              <Text style={styles.description}>{poll.description}</Text>
            )}
          </View>
          {poll.mediaUrl && (
            <View style={styles.mediaContainer}>
              <Image 
                source={{ uri: poll.mediaUrl }} 
                style={styles.mediaImage}
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Voting Options */}
          <View style={styles.voteOptionsContainer}>
            {voteOptions.map((option) => {
              const Icon = getIconFromName(option.icon);
              const count = voteCounts[option.type] || 0;
              const isDisabled = hasVoted || isExpired;
              const isOptionChosen = poll.votedDetails?.alreadyVoted && poll.votedDetails?.optionChosen === option.type;
              const colorStyle = getColorStyle(option.color);

              return (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.voteButton,
                    isDisabled && styles.disabledButton,
                    isOptionChosen && styles.chosenButton,
                  ]}
                  onPress={() => handleVote(option.type)}
                  disabled={isDisabled}
                >
                  <View style={[styles.iconContainer, { backgroundColor: colorStyle.bg }]}>
                    <Ionicons name={Icon} size={20} color="#ffffff" />
                    {isOptionChosen && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={12} color="#ffffff" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.optionLabel, { color: colorStyle.text }]}>
                    {option.label}
                  </Text>
                  <Text style={styles.voteCount}>{count}</Text>
                  <Text style={styles.voteLabel}>votes</Text>
                  {isOptionChosen && (
                    <View style={styles.votedOverlay}>
                      <Text style={styles.votedText}>VOTED</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerContent: {
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  mediaContainer: {
    width: 80,
    height: 80,
    marginLeft: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 16,
  },
  voteOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  voteButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  disabledButton: {
    opacity: 0.3,
  },
  chosenButton: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  voteCount: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  voteLabel: {
    fontSize: 8,
    color: '#9ca3af',
    marginTop: 2,
  },
  votedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  votedText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
