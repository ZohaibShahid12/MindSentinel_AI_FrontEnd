import React, { useEffect } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clearToken } from '../storage/tokenStorage';
import { clearActiveChatSessionId } from '../storage/chatSessionStorage';

export default function LogoutScreen({ navigation }: { navigation: any }) {
  useEffect(() => {
    let mounted = true;
    (async () => {
      await clearActiveChatSessionId();
      await clearToken();
      if (mounted) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator />
      <Text style={{ marginTop: 8 }}>Logging out...</Text>
    </SafeAreaView>
  );
}

