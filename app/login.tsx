import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [authProvider, setAuthProvider] = useState<'google' | 'facebook' | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setAuthProvider('google');
      
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://txmr1pcp-3300.inc1.devtunnels.ms';
      const authUrl = `${apiUrl}/auth/google`;
      
      // Open the OAuth URL in the device's browser
      await Linking.openURL(authUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to open login page. Please try again.');
      setIsLoading(false);
      setAuthProvider(null);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      setAuthProvider('facebook');
      
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://txmr1pcp-3300.inc1.devtunnels.ms';
      const authUrl = `${apiUrl}/auth/facebook`;
      
      // Open the OAuth URL in the device's browser
      await Linking.openURL(authUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to open login page. Please try again.');
      setIsLoading(false);
      setAuthProvider(null);
    }
  };

  const handleGuestAccess = () => {
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Brand Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>MV</Text>
            </View>
          </View>
          <Text style={styles.appTitle}>MeroVote</Text>
          <Text style={styles.welcomeText}>Welcome back! Please sign in to continue</Text>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>Choose your preferred sign-in method</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            {/* Google Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, styles.googleButton]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading && authProvider === 'google' ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Signing in...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="logo-google" size={20} color="#ea4335" />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Facebook Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, styles.facebookButton]}
              onPress={handleFacebookLogin}
              disabled={isLoading}
            >
              {isLoading && authProvider === 'facebook' ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Signing in...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="logo-facebook" size={20} color="#ffffff" />
                  <Text style={styles.facebookButtonText}>Continue with Facebook</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Guest Access */}
            <TouchableOpacity
              style={[styles.loginButton, styles.guestButton]}
              onPress={handleGuestAccess}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By signing in, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 16,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  loginButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  facebookButton: {
    backgroundColor: '#1877f2',
    borderColor: '#1877f2',
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderColor: '#e5e7eb',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  facebookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#9ca3af',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});
