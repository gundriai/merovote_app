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
import { AggregatedPoll, Candidate } from '../types';
import { apiService } from '../services/api';
import { showAlert, hapticFeedback, formatTimeRemaining } from '../utils/mobile';
import { translationService } from '../services/translation';
import CommentDrawer from './CommentDrawer';
import { useAuth } from '../hooks/useAuth';

interface ComparisonCardProps {
  poll: AggregatedPoll;
}

const getCandidateColor = (index: number) => {
  const colors = [
    { 
      bg: '#e0f2fe', 
      border: '#bae6fd', 
      text: '#0369a1', 
      progress: '#7dd3fc', // Light blue
    },
    { 
      bg: '#f0fdf4', 
      border: '#bbf7d0', 
      text: '#166534', 
      progress: '#86efac', // Light green
    },
    { 
      bg: '#fef3c7', 
      border: '#fde68a', 
      text: '#92400e', 
      progress: '#fcd34d', // Light amber
    },
    { 
      bg: '#f3e8ff', 
      border: '#e9d5ff', 
      text: '#7c2d12', 
      progress: '#c4b5fd', // Light purple
    },
    { 
      bg: '#fce7f3', 
      border: '#fbcfe8', 
      text: '#be185d', 
      progress: '#f9a8d4', // Light pink
    },
    { 
      bg: '#ecfdf5', 
      border: '#d1fae5', 
      text: '#065f46', 
      progress: '#6ee7b7', // Light teal
    },
  ];
  return colors[index % colors.length];
};

export default function ComparisonCard({ poll }: ComparisonCardProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showComments, setShowComments] = useState(false);
  const { isAuthenticated } = useAuth();

  // Use candidates directly from poll data
  const candidates = (poll as any)?.candidates || [];
  const totalVotes = candidates.reduce((sum: number, candidate: any) => sum + (candidate.voteCount || 0), 0);

  // Check if user has voted
  useEffect(() => {
    setHasVoted(poll.votedDetails?.alreadyVoted || false);
  }, [poll.votedDetails?.alreadyVoted]);

  // Calculate time remaining
  useEffect(() => {
    const updateTimeRemaining = () => {
      setTimeRemaining(formatTimeRemaining(poll?.endDate));
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [poll?.endDate]);

  // Real voting with API call
  const handleVoteAction = async (candidateId: string) => {
    try {
      // Find the poll option ID for this candidate
      const pollOption = poll.pollOptions?.find(option => option.candidateId === candidateId);
      if (!pollOption) {
        throw new Error('Poll option not found for this candidate');
      }

      const result = await apiService.voteOnPoll(poll.id, pollOption.id);
      
      if (result.success) {
        setHasVoted(true);
        hapticFeedback.success();
        showAlert('Success', 'Your vote has been recorded successfully!', 'success');
      } else {
        throw new Error(result.error || 'Failed to vote');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to vote';
      
      // Check if it's an authentication error first
      if (errorMessage.includes('Authentication required')) {
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
        showAlert('Error', errorMessage, 'error');
      }
    }
  };

  const handleVote = (candidateId: string) => {
    if (hasVoted) {
      hapticFeedback.warning();
      showAlert('Info', 'You have already voted on this poll', 'warning');
      return;
    }

    if (new Date() > new Date(poll?.endDate)) {
      hapticFeedback.warning();
      showAlert('Info', 'This poll has ended', 'warning');
      return;
    }

    hapticFeedback.medium();
    handleVoteAction(candidateId);
  };

  const getPercentage = (voteCount: number): number => {
    if (totalVotes === 0) return 0;
    const percentage = Math.round((voteCount / totalVotes) * 100);
    return Math.max(percentage, 5); // Minimum 5% for visibility
  };

  const isExpired = new Date() > new Date(poll?.endDate);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Countdown Banner */}
        {!isExpired && (
          <View style={styles.countdownBanner}>
            <Text style={styles.countdownText}>
              Voting ends in: <Text style={styles.countdownTime}>{timeRemaining}</Text>
            </Text>
          </View>
        )}
        
        {/* Top Section - Poll Details */}
        <View style={styles.topSection}>
          <View style={styles.pollInfo}>
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Comparison Voting</Text>
              </View>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text style={styles.timeText}>{timeRemaining}</Text>
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="people-outline" size={16} color="#6b7280" />
                <Text style={styles.statText}>{totalVotes} votes</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="trending-up-outline" size={16} color="#6b7280" />
                <Text style={styles.statText}>Active</Text>
              </View>
            </View>
            
            <Text style={styles.title}>{poll.title}</Text>
            {poll.description && (
              <Text style={styles.description}>{poll.description}</Text>
            )}
          </View>
        </View>

        {/* Voting Summary */}
        {totalVotes > 0 && (
          <View style={styles.votingSummary}>
            <View style={styles.summaryItem}>
              <Ionicons name="people" size={16} color="#6b7280" />
              <Text style={styles.summaryText}>{totalVotes} Total Votes</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="time" size={16} color="#6b7280" />
              <Text style={styles.summaryText}>{timeRemaining}</Text>
            </View>
          </View>
        )}
        
        {/* Debug Info - Remove in production */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>Debug: Total Votes: {totalVotes}</Text>
            <Text style={styles.debugText}>Candidates: {candidates.map((c: any) => `${c.name}: ${c.voteCount}`).join(', ')}</Text>
          </View>
        )}

        {/* Main Comparison Section */}
        <View style={styles.comparisonSection}>
          {candidates.length === 2 ? (
            <View style={styles.twoCandidatesContainer}>
              {/* First Candidate */}
              <View style={styles.candidateContainer}>
                <View style={styles.candidateContent}>
                  <View style={styles.candidateImageContainer}>
                    <TouchableOpacity 
                      style={styles.candidateImageTouchable}
                      onPress={() => !hasVoted && !isExpired && handleVote(candidates[0].id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.candidateImage}>
                        {candidates[0].imageUrl ? (
                          <Image 
                            source={{ uri: candidates[0].imageUrl }} 
                            style={styles.image}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.placeholderImage}>
                            <Ionicons name="person" size={32} color="#9ca3af" />
                          </View>
                        )}
                        {/* Check if this candidate was chosen */}
                        {poll.votedDetails?.alreadyVoted && poll.pollOptions?.find(option => option.candidateId === candidates[0].id)?.id === poll.votedDetails?.optionChosen && (
                          <View style={styles.votedOverlay}>
                            <Text style={styles.votedText}>VOTED</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                    {/* Plus icon outside the image container */}
                    {!hasVoted && !isExpired && (
                      <View style={styles.plusIcon}>
                        <Ionicons name="add" size={14} color="#ffffff" />
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.candidateName}>{candidates[0].name}</Text>
                  {candidates[0].description && (
                    <Text style={styles.candidateDescription} numberOfLines={2}>
                      {candidates[0].description}
                    </Text>
                  )}
                  
                  {/* Vote Stats */}
                  <View style={styles.voteStatsContainer}>
                    <View style={styles.voteStatsBar}>
                      <View 
                        style={[
                          styles.voteStatsFill,
                          { 
                            height: `${getPercentage(candidates[0].voteCount)}%`,
                            backgroundColor: getCandidateColor(0).progress,
                          }
                        ]}
                      />
                      <View style={styles.voteStatsOverlay}>
                        <Text style={styles.voteCount}>{candidates[0].voteCount || 0}</Text>
                        <Text style={styles.votePercentage}>{getPercentage(candidates[0].voteCount)}%</Text>
                      </View>
                    </View>
                    {/* Additional vote info */}
                    <View style={styles.voteInfoContainer}>
                      <Text style={styles.voteInfoText}>
                        {totalVotes > 0 ? `${candidates[0].voteCount || 0} of ${totalVotes} votes` : 'No votes yet'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* VS Section */}
              <View style={styles.vsContainer}>
                <View style={styles.vsIcon}>
                  <Ionicons name="flash" size={24} color="#ffffff" />
                </View>
              </View>

              {/* Second Candidate */}
              <View style={styles.candidateContainer}>
                <View style={styles.candidateContent}>
                  <View style={styles.candidateImageContainer}>
                    <TouchableOpacity 
                      style={styles.candidateImageTouchable}
                      onPress={() => !hasVoted && !isExpired && handleVote(candidates[1].id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.candidateImage}>
                        {candidates[1].imageUrl ? (
                          <Image 
                            source={{ uri: candidates[1].imageUrl }} 
                            style={styles.image}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.placeholderImage}>
                            <Ionicons name="person" size={32} color="#9ca3af" />
                          </View>
                        )}
                        {/* Check if this candidate was chosen */}
                        {poll.votedDetails?.alreadyVoted && poll.pollOptions?.find(option => option.candidateId === candidates[1].id)?.id === poll.votedDetails?.optionChosen && (
                          <View style={styles.votedOverlay}>
                            <Text style={styles.votedText}>VOTED</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                    {/* Plus icon outside the image container */}
                    {!hasVoted && !isExpired && (
                      <View style={styles.plusIcon}>
                        <Ionicons name="add" size={14} color="#ffffff" />
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.candidateName}>{candidates[1].name}</Text>
                  {candidates[1].description && (
                    <Text style={styles.candidateDescription} numberOfLines={2}>
                      {candidates[1].description}
                    </Text>
                  )}
                  
                  {/* Vote Stats */}
                  <View style={styles.voteStatsContainer}>
                    <View style={styles.voteStatsBar}>
                      <View 
                        style={[
                          styles.voteStatsFill,
                          { 
                            height: `${getPercentage(candidates[1].voteCount)}%`,
                            backgroundColor: getCandidateColor(1).progress,
                          }
                        ]}
                      />
                      <View style={styles.voteStatsOverlay}>
                        <Text style={styles.voteCount}>{candidates[1].voteCount || 0}</Text>
                        <Text style={styles.votePercentage}>{getPercentage(candidates[1].voteCount)}%</Text>
                      </View>
                    </View>
                    {/* Additional vote info */}
                    <View style={styles.voteInfoContainer}>
                      <Text style={styles.voteInfoText}>
                        {totalVotes > 0 ? `${candidates[1].voteCount || 0} of ${totalVotes} votes` : 'No votes yet'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            // Handle more than 2 candidates
            <View style={styles.multipleCandidatesContainer}>
              {candidates.map((candidate: Candidate, index: number) => {
                const colorScheme = getCandidateColor(index);
                const isDisabled = hasVoted || isExpired;
                
                return (
                  <View key={candidate.id} style={styles.multipleCandidateItem}>
                    <View style={styles.multipleCandidateImageContainer}>
                      <TouchableOpacity 
                        style={styles.multipleCandidateImageTouchable}
                        onPress={() => !isDisabled && handleVote(candidate.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.multipleCandidateImage}>
                          {candidate.imageUrl ? (
                            <Image 
                              source={{ uri: candidate.imageUrl }} 
                              style={styles.image}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.placeholderImage}>
                              <Ionicons name="person" size={24} color="#9ca3af" />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                      {/* Plus icon outside the image container for multiple candidates */}
                      {!isDisabled && (
                        <View style={styles.multiplePlusIcon}>
                          <Ionicons name="add" size={12} color="#ffffff" />
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.multipleCandidateName}>{candidate.name}</Text>
                    {candidate.description && (
                      <Text style={styles.multipleCandidateDescription} numberOfLines={2}>
                        {candidate.description}
                      </Text>
                    )}
                    
                    {/* Vote Stats for multiple candidates */}
                    <View style={styles.multipleVoteStatsContainer}>
                      <View style={styles.multipleVoteStatsBar}>
                        <View 
                          style={[
                            styles.multipleVoteStatsFill,
                            { 
                              height: `${getPercentage(candidate.voteCount)}%`,
                              backgroundColor: colorScheme.progress,
                            }
                          ]}
                        />
                        <View style={styles.multipleVoteStatsOverlay}>
                          <Text style={styles.multipleVoteCount}>{candidate.voteCount || 0}</Text>
                          <Text style={styles.multipleVotePercentage}>{getPercentage(candidate.voteCount)}%</Text>
                        </View>
                      </View>
                      <View style={styles.multipleVoteInfoContainer}>
                        <Text style={styles.multipleVoteInfoText}>
                          {totalVotes > 0 ? `${candidate.voteCount || 0} of ${totalVotes}` : 'No votes'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Comment Button */}
        <TouchableOpacity
          style={styles.commentButton}
          onPress={() => setShowComments(true)}
        >
          <Ionicons name="chatbubbles-outline" size={20} color="#6b7280" />
          <Text style={styles.commentButtonText}>
            {translationService.t('show_comments')}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Comment Drawer */}
      <CommentDrawer
        visible={showComments}
        onClose={() => setShowComments(false)}
        pollId={poll.id}
        showWordLimit={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  countdownBanner: {
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  countdownText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  countdownTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fef3c7',
  },
  topSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pollInfo: {
    gap: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  votingSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  comparisonSection: {
    padding: 16,
  },
  twoCandidatesContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    minHeight: 300,
  },
  candidateContainer: {
    flex: 1,
  },
  candidateContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  candidateImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  candidateImageTouchable: {
    borderRadius: 40,
    overflow: 'hidden',
  },
  candidateImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 40,
  },
  votedText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  plusIcon: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 20,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  candidateDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  voteStatsContainer: {
    width: '100%',
    marginTop: 8,
  },
  voteInfoContainer: {
    marginTop: 4,
    alignItems: 'center',
  },
  voteInfoText: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  voteStatsBar: {
    height: 100,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  voteStatsFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 8,
  },
  voteStatsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voteCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  votePercentage: {
    fontSize: 12,
    color: '#374151',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  vsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  vsIcon: {
    backgroundColor: '#f59e0b',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  multipleCandidatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  multipleCandidateItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  multipleCandidateImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  multipleCandidateImageTouchable: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  multipleCandidateImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  multiplePlusIcon: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 20,
  },
  multipleCandidateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },
  multipleCandidateDescription: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 14,
  },
  multipleVoteStatsContainer: {
    width: '100%',
  },
  multipleVoteInfoContainer: {
    marginTop: 4,
    alignItems: 'center',
  },
  multipleVoteInfoText: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
  multipleVoteStatsBar: {
    height: 80,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  multipleVoteStatsFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 6,
  },
  multipleVoteStatsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multipleVoteCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  multipleVotePercentage: {
    fontSize: 10,
    color: '#374151',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  debugContainer: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    margin: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  debugText: {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  commentButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});
