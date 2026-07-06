import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppModal from '../components/AppModal';
import {
  createChatSession,
  getChatHistory,
  listChatSessions,
  sendChat,
  type ChatSession,
} from '../api/chat';
import {
  clearActiveChatSessionId,
  getActiveChatSessionId,
  setActiveChatSessionId,
} from '../storage/chatSessionStorage';
import { getToken } from '../storage/tokenStorage';
import { apiErrorMessage } from '../utils/apiError';

const PRIMARY = '#3B5BDB';
const NAVY = '#1B2B5E';

function msPerTick(totalWords: number): number {
  if (totalWords > 120) return 22;
  if (totalWords > 60) return 28;
  return 38;
}

function TypingIndicator() {
  const dot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [dot]);

  const opacity = dot.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginBottom: 12,
      alignItems: 'flex-end',
    }}>
      <View style={{
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: '#EEF2FF', alignItems: 'center',
        justifyContent: 'center', marginRight: 8,
      }}>
        <Text style={{ fontSize: 16 }}>🤖</Text>
      </View>
      <Animated.View style={{
        maxWidth: '75%',
        backgroundColor: '#F3F4F6',
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        opacity,
      }}>
        <Text style={{ fontSize: 18, color: '#9CA3AF', letterSpacing: 2 }}>• • •</Text>
      </Animated.View>
    </View>
  );
}

export default function ChatScreen() {
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsVisible, setSessionsVisible] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const [typewriter, setTypewriter] = useState<{ messageId: number; display: string; full: string } | null>(null);
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flatRef = useRef<FlatList>(null);

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showError = (e: unknown) => {
    setErrorMessage(apiErrorMessage(e));
    setErrorVisible(true);
  };

  const clearTypewriterInterval = () => {
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }
  };

  const loadHistoryForSession = useCallback(async (id: number) => {
    const token = await getToken();
    if (!token) throw new Error('Not logged in');
    const res = await getChatHistory({ token, session_id: id, limit: 50 });
    setHistory(Array.isArray(res) ? res : []);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const resolveActiveSession = useCallback(async (): Promise<number> => {
    const token = await getToken();
    if (!token) throw new Error('Not logged in');

    const listed = await listChatSessions({ token });
    setSessions(listed);

    let activeId = await getActiveChatSessionId();
    const exists = activeId != null && listed.some((s) => s.session_id === activeId);

    if (!exists) {
      if (listed.length > 0) {
        activeId = listed[0].session_id;
      } else {
        const created = await createChatSession({ token });
        activeId = created.session_id;
        setSessions([created]);
      }
      await setActiveChatSessionId(activeId);
    }

    setSessionId(activeId);
    return activeId;
  }, []);

  const refresh = useCallback(async () => {
    const id = await resolveActiveSession();
    await loadHistoryForSession(id);
  }, [loadHistoryForSession, resolveActiveSession]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          await refresh();
        } catch (e) {
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

  useEffect(() => () => clearTypewriterInterval(), []);

  const startWordReveal = useCallback((messageId: number, fullText: string) => {
    clearTypewriterInterval();
    const full = (fullText ?? '').trim();
    if (!full) {
      setTypewriter(null);
      return;
    }
    const words = full.split(/\s+/).filter((w) => w.length > 0);
    if (words.length === 0) {
      setTypewriter(null);
      return;
    }
    const joinedFull = words.join(' ');

    setTypewriter({ messageId, display: '', full: joinedFull });
    let i = 0;

    const tick = () => {
      const remaining = words.length - i;
      const step = remaining > 80 ? 3 : remaining > 40 ? 2 : 1;
      i = Math.min(words.length, i + step);
      const slice = words.slice(0, i).join(' ');
      setTypewriter({ messageId, display: slice, full: joinedFull });
      if (i >= words.length) {
        clearTypewriterInterval();
        setTimeout(() => setTypewriter(null), 450);
      }
    };

    tick();
    typeIntervalRef.current = setInterval(tick, msPerTick(words.length));
  }, []);

  useEffect(() => {
    if (typewriter) {
      flatRef.current?.scrollToEnd({ animated: true });
    }
  }, [typewriter?.display]);

  const onNewChat = async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not logged in');
      clearTypewriterInterval();
      setTypewriter(null);
      const created = await createChatSession({ token });
      await setActiveChatSessionId(created.session_id);
      setSessionId(created.session_id);
      setHistory([]);
      setSessions((prev) => [created, ...prev.filter((s) => s.session_id !== created.session_id)]);
      setSessionsVisible(false);
    } catch (e) {
      showError(e);
    }
  };

  const onSelectSession = async (id: number) => {
    try {
      await setActiveChatSessionId(id);
      setSessionId(id);
      setSessionsVisible(false);
      clearTypewriterInterval();
      setTypewriter(null);
      setLoading(true);
      await loadHistoryForSession(id);
    } catch (e) {
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  const onSend = async () => {
    if (!message.trim() || sending || sessionId == null) return;
    setSending(true);
    setAwaitingReply(true);
    clearTypewriterInterval();
    setTypewriter(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not logged in');
      const res = await sendChat({ token, message: message.trim(), session_id: sessionId });
      setMessage('');
      await loadHistoryForSession(sessionId);
      const aid = res?.assistant_message?.message_id;
      const content = res?.assistant_message?.content ?? '';
      if (aid != null && content) {
        startWordReveal(Number(aid), String(content));
      }
    } catch (e: any) {
      showError(e);
    } finally {
      setAwaitingReply(false);
      setSending(false);
    }
  };

  const activeSession = sessions.find((s) => s.session_id === sessionId);
  const headerTitle = activeSession?.title?.trim() || 'AI Assistant';

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderColor: '#F3F4F6',
      }}>
        <View style={{
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
          marginRight: 12,
        }}>
          <Text style={{ fontSize: 22 }}>🤖</Text>
        </View>
        <Pressable style={{ flex: 1 }} onPress={() => setSessionsVisible(true)}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: NAVY }} numberOfLines={1}>
            {headerTitle}
          </Text>
          <Text style={{ fontSize: 12, color: awaitingReply ? '#F59E0B' : '#10B981' }}>
            {awaitingReply ? '● Typing…' : '● Online · tap for past chats'}
          </Text>
        </Pressable>
        <Pressable
          onPress={onNewChat}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: '#EEF2FF',
          }}
        >
          <Text style={{ color: PRIMARY, fontWeight: '700', fontSize: 13 }}>+ New</Text>
        </Pressable>
      </View>

      {history.length === 0 && !awaitingReply && (
        <View style={{ alignItems: 'center', paddingTop: 40, paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 48 }}>💬</Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: NAVY, marginTop: 12, textAlign: 'center' }}>
            New conversation
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
            This session starts with a clean slate. Earlier chats are kept separate.
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}>
        <FlatList
          ref={flatRef}
          data={history}
          keyExtractor={(it) => String(it.message_id ?? Math.random())}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={awaitingReply ? <TypingIndicator /> : null}
          renderItem={({ item }) => {
            const isUser = item.role === 'user';
            const isStreamingAssistant =
              !isUser &&
              typewriter &&
              Number(item.message_id) === typewriter.messageId;
            const bubbleText = isStreamingAssistant ? typewriter.display : item.content;
            const showCaret =
              isStreamingAssistant && typewriter.display !== typewriter.full;

            return (
              <View style={{
                flexDirection: 'row',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                marginBottom: 12,
                alignItems: 'flex-end',
              }}>
                {!isUser && (
                  <View style={{
                    width: 30, height: 30, borderRadius: 15,
                    backgroundColor: '#EEF2FF', alignItems: 'center',
                    justifyContent: 'center', marginRight: 8,
                  }}>
                    <Text style={{ fontSize: 16 }}>🤖</Text>
                  </View>
                )}
                <View style={{
                  maxWidth: '75%',
                  backgroundColor: isUser ? PRIMARY : '#F3F4F6',
                  borderRadius: 18,
                  borderBottomRightRadius: isUser ? 4 : 18,
                  borderBottomLeftRadius: isUser ? 18 : 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}>
                  <Text style={{
                    fontSize: 14, lineHeight: 20,
                    color: isUser ? 'white' : '#1F2937',
                  }}>
                    {bubbleText}
                    {showCaret ? (
                      <Text style={{ color: PRIMARY, fontWeight: '800' }}>|</Text>
                    ) : null}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View style={{
          flexDirection: 'row', alignItems: 'flex-end',
          paddingHorizontal: 12, paddingVertical: 10,
          borderTopWidth: 1, borderColor: '#F3F4F6',
          backgroundColor: 'white',
        }}>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#F3F4F6', borderRadius: 24,
            paddingHorizontal: 16, paddingVertical: 8, marginRight: 8,
            minHeight: 44,
          }}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              multiline
              editable={!sending}
              style={{ flex: 1, fontSize: 14, color: '#1F2937', maxHeight: 100 }}
              onSubmitEditing={onSend}
            />
          </View>
          <Pressable onPress={onSend} disabled={sending}
            style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: sending ? '#93C5FD' : PRIMARY,
              alignItems: 'center', justifyContent: 'center',
            }}>
            {sending
              ? <ActivityIndicator size="small" color="white" />
              : <Text style={{ color: 'white', fontSize: 18 }}>➤</Text>
            }
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={sessionsVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '70%',
            paddingBottom: 24,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderColor: '#F3F4F6',
            }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: NAVY }}>Your chats</Text>
              <Pressable onPress={() => setSessionsVisible(false)}>
                <Text style={{ color: '#6B7280', fontSize: 16 }}>Close</Text>
              </Pressable>
            </View>
            <FlatList
              data={sessions}
              keyExtractor={(s) => String(s.session_id)}
              ListHeaderComponent={
                <Pressable
                  onPress={onNewChat}
                  style={{
                    margin: 16,
                    padding: 14,
                    borderRadius: 12,
                    backgroundColor: '#EEF2FF',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: PRIMARY, fontWeight: '700' }}>+ Start new chat</Text>
                </Pressable>
              }
              renderItem={({ item }) => {
                const active = item.session_id === sessionId;
                return (
                  <Pressable
                    onPress={() => onSelectSession(item.session_id)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderColor: '#F3F4F6',
                      backgroundColor: active ? '#F8FAFF' : 'white',
                    }}
                  >
                    <Text style={{ fontWeight: '700', color: NAVY }} numberOfLines={1}>
                      {item.title || 'Chat'}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                      {item.message_count ?? 0} messages
                    </Text>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#6B7280', padding: 24 }}>
                  No chats yet. Start a new conversation.
                </Text>
              }
            />
          </View>
        </View>
      </Modal>

      <AppModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
        title="Chat error"
        message={errorMessage}
        variant="error"
        primaryLabel="OK"
      />
    </SafeAreaView>
  );
}
