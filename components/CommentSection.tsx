import React, { useState } from 'react';
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

interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  gajjabCount: number;
  bekarCount: number;
  furiousCount: number;
}

interface CommentSectionProps {
  pollId: string;
  showWordLimit?: boolean;
  onClose?: () => void;
}

export default function CommentSection({ pollId, showWordLimit = false, onClose }: CommentSectionProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  // Mock comments for now - replace with API call
  const mockComments: Comment[] = [
    {
      id: '1',
      content: 'रवि लामिछाने नै उत्तम विकल्प हो',
      author: 'राम बहादुर',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      gajjabCount: 12,
      bekarCount: 2,
      furiousCount: 1,
    },
    {
      id: '2',
      content: 'गगन थापाको नेतृत्व चाहिन्छ',
      author: 'सीता देवी',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      gajjabCount: 8,
      bekarCount: 5,
      furiousCount: 0,
    },
  ];

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return translationService.t('time.just_now', 'just now');
    if (diffInMinutes < 60) return `${diffInMinutes} ${translationService.t('time.minutes_ago', 'minutes ago')}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${translationService.t('time.hours_ago', 'hours ago')}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${translationService.t('time.days_ago', 'days ago')}`;
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      showAlert('Error', translationService.t('comments.errors.fill_comment', 'Please enter a comment'), 'error');
      return;
    }

    const wordCount = getWordCount(comment);
    if (showWordLimit && wordCount > 20) {
      showAlert('Error', translationService.t('comments.errors.word_limit', 'Comment cannot be more than 20 words'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // await apiService.addComment(pollId, comment.trim());
      
      // Mock success - add comment to local state
      const newComment: Comment = {
        id: `comment_${Date.now()}`,
        content: comment.trim(),
        author: 'You',
        createdAt: new Date().toISOString(),
        gajjabCount: 0,
        bekarCount: 0,
        furiousCount: 0,
      };
      
      setComments(prev => [newComment, ...prev]);
      setComment('');
      hapticFeedback.success();
      showAlert('Success', translationService.t('comments.success.comment_posted', 'Your comment has been posted'), 'success');
    } catch (error) {
      console.error('Error adding comment:', error);
      hapticFeedback.error();
      showAlert('Error', translationService.t('comments.errors.failed', 'Failed to add comment'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactToComment = async (commentId: string, reactionType: 'gajjab' | 'bekar' | 'furious') => {
    try {
      // TODO: Replace with actual API call
      // await apiService.addCommentReaction(pollId, commentId, reactionType);
      
      // Mock success - update local state
      setComments(prev => prev.map((c: Comment) => 
        c.id === commentId 
          ? { ...c, [`${reactionType}Count`]: c[`${reactionType}Count`] + 1 }
          : c
      ));
      
      hapticFeedback.success();
    } catch (error) {
      console.error('Error adding reaction:', error);
      hapticFeedback.error();
      showAlert('Error', translationService.t('comments.errors.reaction_failed', 'Failed to add reaction'), 'error');
    }
  };

  const wordCount = getWordCount(comment);
  const isOverLimit = showWordLimit && wordCount > 20;
  const displayComments = comments.length > 0 ? comments : mockComments;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubbles" size={20} color="#374151" />
          <Text style={styles.headerTitle}>
            {translationService.t('comments.title', 'Comments')}
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
        {displayComments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>
              {translationService.t('comments.empty', 'No comments yet')}
            </Text>
          </View>
        ) : (
          displayComments.map((comment) => (
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
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.commentInput, isOverLimit && styles.commentInputError]}
            placeholder={showWordLimit 
              ? translationService.t('comments.placeholders.comment_with_limit', 'Your comment (20 words limit)')
              : translationService.t('comments.placeholders.comment', 'Write your comment...')
            }
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
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
              {translationService.t('comments.actions.post_comment', 'Post Comment')}
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
