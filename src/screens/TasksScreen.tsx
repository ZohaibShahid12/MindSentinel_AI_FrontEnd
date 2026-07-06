import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import AppModal from '../components/AppModal';
import { createTask, getTasks, updateTask } from '../api/tasks';
import { getToken } from '../storage/tokenStorage';
import { apiErrorMessage } from '../utils/apiError';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function TasksScreen() {
  const [taskDate, setTaskDate] = useState(todayISO());
  const [taskName, setTaskName] = useState('');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showError = (e: unknown) => {
    setErrorMessage(apiErrorMessage(e));
    setErrorVisible(true);
  };

  const refresh = useCallback(async () => {
    const token = await getToken();
    if (!token) throw new Error('Not logged in');
    const res = await getTasks({ token, task_date: taskDate });
    setTasks(res);
  }, [taskDate]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          await refresh();
        } catch (e: any) {
          if (!cancelled) showError(e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [refresh]),
  );

  const onCreate = async () => {
    if (!taskName.trim()) return;
    setCreating(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not logged in');
      await createTask({ token, task_name: taskName.trim(), task_date: taskDate });
      setTaskName('');
      await refresh();
    } catch (e: any) {
      showError(e);
    } finally {
      setCreating(false);
    }
  };

  const onToggle = async (task_id: number, is_completed: boolean) => {
    const token = await getToken();
    if (!token) return;
    try {
      await updateTask({ token, task_id, is_completed });
      await refresh();
    } catch (e: any) {
      showError(e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B5BDB" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontWeight: '800', marginBottom: 10 }}>Tasks for {taskDate}</Text>

      <Text style={{ marginBottom: 6 }}>Task name</Text>
      <TextInput
        value={taskName}
        onChangeText={setTaskName}
        placeholder="e.g. Morning meditation"
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, marginBottom: 10 }}
      />

      <Pressable
        onPress={onCreate}
        disabled={creating}
        style={{ backgroundColor: '#2f6fed', padding: 14, borderRadius: 12, opacity: creating ? 0.7 : 1, marginBottom: 14 }}
      >
        <Text style={{ color: 'white', fontWeight: '800', textAlign: 'center' }}>{creating ? 'Creating...' : 'Add Task'}</Text>
      </Pressable>

      <FlatList
        data={tasks}
        keyExtractor={(it) => String(it.task_id ?? Math.random())}
        renderItem={({ item }) => (
          <View style={{ padding: 14, borderRadius: 12, backgroundColor: '#f2f2f7', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '800' }}>{item.task_name}</Text>
              <Switch
                value={!!item.is_completed}
                onValueChange={(v) => onToggle(item.task_id, v)}
                trackColor={{ false: '#E5E7EB', true: '#34D399' }}
                thumbColor={Platform.OS === 'android' ? (item.is_completed ? '#f0fdf4' : '#f4f4f5') : undefined}
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No tasks found.</Text>}
      />

      <AppModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
        title="Tasks"
        message={errorMessage}
        variant="error"
        primaryLabel="OK"
      />
    </View>
    </SafeAreaView>
  );
}
