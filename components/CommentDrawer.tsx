import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import CommentSection from './CommentSection';

interface CommentDrawerProps {
  visible: boolean;
  onClose: () => void;
  pollId: string;
  showWordLimit?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');
const DRAWER_HEIGHT = screenHeight * 0.8; // 80% of screen height

export default function CommentDrawer({ visible, onClose, pollId, showWordLimit = false }: CommentDrawerProps) {
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const gestureRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: screenHeight,
        useNativeDriver: true,
        duration: 300,
      }).start();
    }
  }, [visible]);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleGestureStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;
      
      if (translationY > 100 || velocityY > 500) {
        // Close drawer
        Animated.timing(translateY, {
          toValue: screenHeight,
          useNativeDriver: true,
          duration: 300,
        }).start(() => {
          onClose();
        });
      } else {
        // Snap back to open position
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  const closeDrawer = () => {
    Animated.timing(translateY, {
      toValue: screenHeight,
      useNativeDriver: true,
      duration: 300,
    }).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeDrawer}
        />
        
        {/* Drawer */}
        <PanGestureHandler
          ref={gestureRef}
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={handleGestureStateChange}
        >
          <Animated.View
            style={[
              styles.drawer,
              {
                transform: [{ translateY }],
                height: DRAWER_HEIGHT,
              },
            ]}
          >
            {/* Handle */}
            <View style={styles.handle} />
            
            {/* Comment Section */}
            <CommentSection
              pollId={pollId}
              showWordLimit={showWordLimit}
              onClose={closeDrawer}
            />
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },
});
