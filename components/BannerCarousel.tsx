import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface Banner {
  id: string;
  imageUrl: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  button?: {
    text: string;
    href: string;
  };
  order?: number;
  likeCount?: number;
  isActive?: boolean;
}

const BANNERS: Banner[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop',
    imageAlt: 'Voting banner',
    title: 'Your Voice Matters',
    subtitle: 'Participate in the democratic process and make your vote count',
    button: {
      text: 'Vote Now',
      href: '/',
    },
    isActive: true,
    order: 1,
  },
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const banner = BANNERS[current] || BANNERS[0];

  // Auto-advance every 10 seconds
  useEffect(() => {
    if (BANNERS.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (idx: number) => setCurrent(idx);
  const prev = () => setCurrent((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  const next = () => setCurrent((prev) => (prev + 1) % BANNERS.length);

  return (
    <View style={styles.container}>
      <View style={styles.bannerContainer}>
        {/* Border with gradient effect */}
        <View style={styles.borderContainer}>
          <View style={styles.bannerContent}>
            {/* Banner Image */}
            <Image
              source={{ uri: banner.imageUrl }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            
            {/* Overlay */}
            <View style={styles.overlay} />
            
            {/* Banner Content */}
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{banner.title}</Text>
              {banner.subtitle && (
                <Text style={styles.subtitle}>{banner.subtitle}</Text>
              )}
              {banner.button && (
                <TouchableOpacity style={styles.button}>
                  <View style={styles.buttonContent}>
                    <View style={styles.redDot} />
                    <Text style={styles.buttonText}>{banner.button.text}</Text>
                    <View style={styles.blueDot} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Banner Indicators */}
        <View style={styles.indicatorsContainer}>
          {BANNERS.length > 1
            ? BANNERS.map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.indicator,
                    idx === current ? styles.activeIndicator : styles.inactiveIndicator,
                  ]}
                  onPress={() => goTo(idx)}
                />
              ))
            : (
                <View style={[styles.indicator, styles.activeIndicator]} />
              )}
        </View>

        {/* Navigation Arrows */}
        {BANNERS.length > 1 && (
          <>
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={prev}
            >
              <Ionicons name="chevron-back" size={20} color="#dc2626" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={next}
            >
              <Ionicons name="chevron-forward" size={20} color="#dc2626" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  bannerContainer: {
    position: 'relative',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  borderContainer: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(220, 38, 38, 0.4)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    marginTop: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
    marginRight: 8,
  },
  buttonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginLeft: 8,
  },
  indicatorsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#ffffff',
  },
  inactiveIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 20,
  },
  prevButton: {
    left: 8,
  },
  nextButton: {
    right: 8,
  },
});
