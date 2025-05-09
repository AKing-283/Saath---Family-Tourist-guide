import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OnboardingScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Ionicons name="location" size={80} color="#4CAF50" />
        </View>
        
        <Text style={styles.title}>Smart Local Assistant</Text>
        <Text style={styles.subtitle}>
          Discover the best places around you with AI-powered recommendations
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="search" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>Find nearby places</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="map" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>View on map</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="information-circle" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>Get detailed information</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('Home')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
        <Ionicons name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F0FFF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  features: {
    width: '100%',
    marginBottom: 48,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureText: {
    fontSize: 16,
    color: '#4A5568',
    marginLeft: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 24,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default OnboardingScreen; 