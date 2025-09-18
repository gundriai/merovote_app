import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { translationService } from '../services/translation';
import { apiService } from '../services/api';
import { showAlert, hapticFeedback } from '../utils/mobile';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Comment } from '../types';
import { router } from 'expo-router';

interface CommentSectionProps {
  pollId: string;
  showWordLimit?: boolean;
  onClose?: () => void;
}

export default function CommentSection({ pollId, showWordLimit = false, onClose }: CommentSectionProps) {
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  // Fetch poll data to get comments
  const { data: pollData, isLoading: pollLoading } = useQuery({
    queryKey: ['poll', pollId],
    queryFn: () => apiService.getPollById(pollId),
    enabled: !!pollId,
  });

  // Get comments from poll data
  const comments = pollData?.comments || [];

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return translationService.t('time.just_now');
    if (diffInMinutes < 60) return translationService.t('time.minutes_ago', { count: diffInMinutes });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return translationService.t('time.hours_ago', { count: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    return translationService.t('time.days_ago', { count: diffInDays });
  };

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (commentData: { content: string; author?: string }) => 
      apiService.addComment(pollId, commentData.content, commentData.author),
    onSuccess: () => {
      // Invalidate and refetch poll data to show new comment
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['aggregated-polls'] });
      setComment('');
      
      try {
        hapticFeedback.success();
      } catch (hapticError) {
        console.warn('Haptic feedback failed:', hapticError);
      }
      
      showAlert('Success', 'Your comment has been posted!', 'success');
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
      
      try {
        hapticFeedback.error();
      } catch (hapticError) {
        console.warn('Haptic feedback failed:', hapticError);
      }
      
      // Handle authentication error (same as web app)
      if (error instanceof Error && error.message.includes('401')) {
        showAlert('Login Required', 'Please login to add comments', 'warning');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        // Use the actual error message (same as web app)
        const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
        showAlert('Error', errorMessage, 'error');
      }
    },
  });

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      showAlert('Error', 'Please enter a comment', 'error');
      return;
    }

    const wordCount = getWordCount(comment);
    if (showWordLimit && wordCount > 20) {
      showAlert('Error', 'Comment cannot be more than 20 words', 'error');
      return;
    }

    addCommentMutation.mutate({ content: comment.trim() });
  };

  // Add comment reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: ({ commentId, reactionType }: { commentId: string; reactionType: 'gajjab' | 'bekar' | 'furious' }) =>
      apiService.addCommentReaction(pollId, commentId, reactionType),
    onSuccess: () => {
      // Invalidate and refetch poll data to show updated reaction counts
      queryClient.invalidateQueries({ queryKey: ['poll', pollId] });
      queryClient.invalidateQueries({ queryKey: ['aggregated-polls'] });
      
      try {
        hapticFeedback.success();
      } catch (hapticError) {
        console.warn('Haptic feedback failed:', hapticError);
      }
    },
    onError: (error) => {
      console.error('Error adding reaction:', error);
      
      try {
        hapticFeedback.error();
      } catch (hapticError) {
        console.warn('Haptic feedback failed:', hapticError);
      }
      
      // Handle authentication error (same as web app)
      if (error instanceof Error && error.message.includes('401')) {
        showAlert('Login Required', 'Please login to react to comments', 'warning');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        // Use the actual error message (same as web app)
        const errorMessage = error instanceof Error ? error.message : 'Failed to add reaction';
        showAlert('Error', errorMessage, 'error');
      }
    },
  });

  const handleReactToComment = async (commentId: string, reactionType: 'gajjab' | 'bekar' | 'furious') => {
    addReactionMutation.mutate({ commentId, reactionType });
  };

  const wordCount = getWordCount(comment);
  const isOverLimit = showWordLimit && wordCount > 20;
  const isSubmitting = addCommentMutation.isPending;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubbles" size={20} color="#374151" />
          <Text style={styles.headerTitle}>
            Comments
            {showWordLimit && (
              <Text style={styles.wordLimitText}> (20 शब्द सीमा)</Text>
            )}
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Comments List */}
      <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
        {pollLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#6b7280" />
            <Text style={styles.emptyText}>
              Loading comments...
            </Text>
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>
              No comments yet
            </Text>
          </View>
        ) : (
          comments.map((comment: Comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentContent}>
                <Text style={styles.commentText}>{comment.content}</Text>
                <View style={styles.commentMeta}>
                  <Text style={styles.commentAuthor}>{comment.author}</Text>
                  <Text style={styles.commentTime}>• {formatTimeAgo(comment.createdAt)}</Text>
                </View>
              </View>
              
              {/* Reaction Buttons */}
              <View style={styles.reactions}>
                <TouchableOpacity
                  style={styles.reactionButton}
                  onPress={() => handleReactToComment(comment.id, 'gajjab')}
                >
                  <Ionicons name="thumbs-up" size={16} color="#10b981" />
                  <Text style={[styles.reactionCount, { color: '#10b981' }]}>
                    {comment.gajjabCount}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.reactionButton}
                  onPress={() => handleReactToComment(comment.id, 'bekar')}
                >
                  <Ionicons name="thumbs-down" size={16} color="#ef4444" />
                  <Text style={[styles.reactionCount, { color: '#ef4444' }]}>
                    {comment.bekarCount}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.reactionButton}
                  onPress={() => handleReactToComment(comment.id, 'furious')}
                >
                  <Ionicons name="flame" size={16} color="#f59e0b" />
                  <Text style={[styles.reactionCount, { color: '#f59e0b' }]}>
                    {comment.furiousCount}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Comment Form */}
      <View style={styles.commentForm}>
        {/* Login reminder for unauthenticated users */}
        <View style={styles.loginReminder}>
          <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
          <Text style={styles.loginReminderText}>
            Login to add comments and reactions
          </Text>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.commentInput, isOverLimit && styles.commentInputError]}
              placeholder={showWordLimit 
                ? 'Your comment (20 words limit)'
                : 'Write your comment...'
              }
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
            editable={true} // Allow typing but will show auth error on submit
          />
          {showWordLimit && (
            <Text style={[styles.wordCount, isOverLimit && styles.wordCountError]}>
              {wordCount}/20
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.submitButton, (!comment.trim() || isOverLimit) && styles.submitButtonDisabled]}
          onPress={handleSubmitComment}
          disabled={!comment.trim() || isOverLimit || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>
              Post Comment
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  wordLimitText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6b7280',
  },
  closeButton: {
    padding: 4,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  commentItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  commentContent: {
    flex: 1,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentAuthor: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  commentTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  reactions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  commentForm: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  loginReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loginReminderText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#ffffff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  commentInputError: {
    borderColor: '#ef4444',
  },
  wordCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  wordCountError: {
    color: '#ef4444',
  },
  submitButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
