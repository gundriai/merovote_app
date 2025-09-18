import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC143C" />
      
      {/* Nepal Flag Background */}
      <View style={styles.flagBackground}>
        {/* Red Background */}
        <View style={styles.redSection} />
        
        {/* Blue Border */}
        <View style={styles.blueBorder} />
        
        {/* White Section */}
        <View style={styles.whiteSection} />
        
        {/* Nepal Flag Symbol */}
        <View style={styles.flagSymbol}>
          <View style={styles.moon} />
          <View style={styles.sun} />
        </View>
      </View>

      {/* Content Overlay */}
      <LinearGradient
        colors={['rgba(220, 20, 60, 0.9)', 'rgba(0, 56, 168, 0.8)', 'rgba(255, 255, 255, 0.9)']}
        style={styles.gradientOverlay}
      >
        <SafeAreaView style={styles.safeArea}>
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

            {/* Revolution Message */}
            <View style={styles.revolutionMessage}>
              <Text style={styles.revolutionTitle}>Inspired by Gen Z Revolution</Text>
              <Text style={styles.revolutionText}>
                Built in solidarity with the youth movement that changed Nepal forever. 
                Your voice, your vote, your future.
              </Text>
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
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DC143C', // Nepal flag red
  },
  flagBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  redSection: {
    flex: 1,
    backgroundColor: '#DC143C', // Nepal flag red
  },
  blueBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#0038A8', // Nepal flag blue
  },
  whiteSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
    backgroundColor: '#ffffff',
  },
  flagSymbol: {
    position: 'absolute',
    top: height * 0.15,
    right: 20,
    width: 60,
    height: 60,
  },
  moon: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#DC143C',
  },
  sun: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#DC143C',
  },
  gradientOverlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#DC143C',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DC143C',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  welcomeText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  revolutionMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#DC143C',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  revolutionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC143C',
    marginBottom: 8,
    textAlign: 'center',
  },
  revolutionText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#DC143C',
  },
  cardHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC143C',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ea4335',
  },
  facebookButton: {
    backgroundColor: '#1877f2',
    borderWidth: 2,
    borderColor: '#1877f2',
  },
  guestButton: {
    backgroundColor: '#DC143C',
    borderWidth: 2,
    borderColor: '#DC143C',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ea4335',
  },
  facebookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#DC143C',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#DC143C',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  linkText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
