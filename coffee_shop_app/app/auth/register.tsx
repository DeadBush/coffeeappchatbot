import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { authService } from '../../services/authService';

function isValidEmail(email: string) {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return re.test(email);
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateRegister = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Email cannot be empty.");
      return false;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return false;
    }
    if (!password || password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateRegister()) return;

    try {
      setLoading(true);
      await authService.register({ name, email, password });
      Alert.alert(
        'Success',
        'Registration successful! Please check your email for verification.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginTextBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#636E72',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#F5F6FA',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6C5CE7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginText: {
    color: '#636E72',
    fontSize: 14,
  },
  loginTextBold: {
    color: '#6C5CE7',
    fontWeight: 'bold',
  },
}); 