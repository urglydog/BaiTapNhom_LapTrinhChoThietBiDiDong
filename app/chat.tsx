import React, { useState, useCallback } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useAppSelector } from '../src/hooks/redux';
import { lightTheme, darkTheme } from '../src/themes';
import { ThemeProvider } from 'styled-components';
import { sendMessage } from '../src/services/chatService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const themeState = useAppSelector((state) => state.theme);
  const theme = themeState.theme === 'dark' ? darkTheme : lightTheme;

  const handleSend = useCallback(async () => {
    if (input.trim() === '') {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessage(input);
      const botMessage: Message = {
        id: Date.now().toString() + 'bot',
        text: response,
        isUser: false,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString() + 'error',
        text: 'Sorry, something went wrong.',
        isUser: false,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [input]);

  return (
    <ThemeProvider theme={theme}>
      <Stack.Screen options={{ title: 'MovieBot' }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageContainer,
                item.isUser ? styles.userMessageContainer : [styles.botMessageContainer, { backgroundColor: theme.card }],
              ]}
            >
              <Text style={{ color: item.isUser ? '#fff' : theme.text }}>{item.text}</Text>
            </View>
          )}
        />
        <View style={[styles.inputContainer, { borderTopColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask MovieBot..."
            placeholderTextColor={theme.subtext}
          />
          <Button title="Send" onPress={handleSend} disabled={loading} />
        </View>
        {loading && <ActivityIndicator size="large" color={theme.primary} />}
      </View>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    padding: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
});

export default ChatScreen;
