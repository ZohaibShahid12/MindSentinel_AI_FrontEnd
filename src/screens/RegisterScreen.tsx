import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import AppModal from '../components/AppModal';
import { registerUser, loginUser } from '../api/auth';
import { setToken } from '../storage/tokenStorage';
import { apiErrorMessage } from '../utils/apiError';
import { INVALID_EMAIL_MESSAGE, isValidEmail, normalizeEmail } from '../utils/validation';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showError = (message: string) => {
    setErrorMessage(message);
    setErrorVisible(true);
  };

  const onRegister = async () => {
    const trimmedName = name.trim();
    const normalizedEmail = normalizeEmail(email);

    if (!trimmedName) {
      showError('Please enter your name.');
      return;
    }
    if (!normalizedEmail) {
      showError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      showError(INVALID_EMAIL_MESSAGE);
      return;
    }
    if (!password) {
      showError('Please enter a password.');
      return;
    }
    if (password.length < 4) {
      showError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({ name: trimmedName, email: normalizedEmail, password });
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
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Create Account</Text>

      <Text style={{ marginBottom: 6 }}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 12 }}
      />

      <Text style={{ marginBottom: 6 }}>Email</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 12 }}
      />

      <Text style={{ marginBottom: 6 }}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 10, marginBottom: 16, color: 'black' }}
      />

      <Pressable
        onPress={onRegister}
        disabled={loading}
        style={{
          backgroundColor: '#2f6fed',
          padding: 14,
          borderRadius: 10,
          alignItems: 'center',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '600' }}>Create</Text>}
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Login')} style={{ marginTop: 16, alignItems: 'center' }}>
        <Text style={{ color: '#2f6fed' }}>Back to login</Text>
      </Pressable>

      <AppModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
        title="Registration failed"
        message={errorMessage}
        variant="error"
        primaryLabel="OK"
      />
    </View>
  );
}
