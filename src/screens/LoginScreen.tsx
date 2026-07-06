import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppModal from '../components/AppModal';
import { loginUser } from '../api/auth';
import { setToken } from '../storage/tokenStorage';
import { apiErrorMessage } from '../utils/apiError';
import { INVALID_EMAIL_MESSAGE, isValidEmail, normalizeEmail } from '../utils/validation';

export default function LoginScreen() {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onLogin = async () => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      setErrorMessage('Please enter your email address.');
      setErrorVisible(true);
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setErrorMessage(INVALID_EMAIL_MESSAGE);
      setErrorVisible(true);
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      setErrorVisible(true);
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email: normalizedEmail, password });
      await setToken(res.access_token);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (e: any) {
      setErrorMessage(apiErrorMessage(e));
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24 }}>
          <View style={{ alignItems: 'center', marginBottom: 36 }}>
            <Text style={{ fontSize: 34, fontWeight: '800', color: '#0f172a' }}>Welcome Back</Text>
            <Text
              style={{
                marginTop: 10,
                textAlign: 'center',
                color: '#6b7280',
                fontSize: 15,
                lineHeight: 24,
                maxWidth: 320,
              }}
            >
              Please sign in to continue Medical health checker & early detection system
            </Text>
          </View>

          <Text style={{ marginBottom: 8, color: '#374151', fontSize: 15, fontWeight: '600' }}>Email Address</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#9ca3af"
            style={{
              borderWidth: 2,
              borderColor: '#c7ccd4',
              borderRadius: 12,
              height: 54,
              paddingHorizontal: 14,
              fontSize: 15,
              marginBottom: 20,
            }}
          />

          <Text style={{ marginBottom: 8, color: '#374151', fontSize: 15, fontWeight: '600' }}>Password</Text>
          <View
            style={{
              borderWidth: 2,
              borderColor: '#c7ccd4',
              borderRadius: 12,
              minHeight: 54,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
            }}
          >
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              style={{ flex: 1, fontSize: 15, paddingVertical: 12 }}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>

          <Pressable style={{ alignSelf: 'flex-end', marginTop: 10 }}>
            <Text style={{ color: '#1e3a8a', fontSize: 14, fontWeight: '600' }}>Forgot password?</Text>
          </Pressable>

          <Pressable
            onPress={onLogin}
            disabled={loading}
            style={{
              marginTop: 20,
              backgroundColor: '#0b3a8c',
              borderRadius: 14,
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 18 }}>Sign In</Text>
            )}
          </Pressable>

          <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#6b7280', fontSize: 15 }}>Don't have an account ? </Text>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: '#0b3a8c', fontWeight: '700', fontSize: 16 }}>Sign Up</Text>
            </Pressable>
          </View>

          <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, height: 1.5, backgroundColor: '#8ea3c4' }} />
            <Text style={{ marginHorizontal: 16, color: '#1f2d3d', fontWeight: '700', fontSize: 18 }}>Or</Text>
            <View style={{ flex: 1, height: 1.5, backgroundColor: '#8ea3c4' }} />
          </View>

          <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable
              style={{
                width: '46%',
                height: 46,
                borderRadius: 28,
                backgroundColor: '#0b3a8c',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>Google</Text>
            </Pressable>
            <Pressable
              style={{
                width: '46%',
                height: 46,
                borderRadius: 28,
                backgroundColor: '#0b3a8c',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>Apple</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <AppModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
        title="Sign in failed"
        message={errorMessage}
        variant="error"
        primaryLabel="Try again"
      />
    </SafeAreaView>
  );
}
