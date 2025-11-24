import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useAppSelector } from '../src/hooks/redux';
import { lightTheme, darkTheme } from '../src/themes';
import { ThemeProvider } from 'styled-components/native';
import { sendMessage } from '../src/services/chatService';
import { Ionicons } from '@expo/vector-icons'; // Assuming Ionicons are available

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const ChatbotFloatingButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
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
      console.error('Error sending message:', error);
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
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: theme.primaryColor }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <ThemeProvider theme={theme}>
          <View style={[styles.centeredView]}>
            <View style={[styles.modalView, { backgroundColor: theme.backgroundColor, height: '92%' }]}>
              <View style={[styles.modalHeader, { backgroundColor: theme.primaryColor }]}>
                <Text style={[styles.modalTitle, { color: 'white' }]}>MovieBot</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.messageContainer,
                      item.isUser ? styles.userMessageContainer : styles.botMessageContainer,
                      {
                        backgroundColor: item.isUser ? theme.primaryColor : theme.secondaryBackgroundColor,
                      },
                    ]}
                  >
                    <Text style={{ color: item.isUser ? '#fff' : theme.textColor }}>{item.text}</Text>
                  </View>
                )}
                style={[styles.messageList, { paddingHorizontal: 20 }]}
                contentContainerStyle={styles.messageListContent}
              />

              <View style={[styles.inputContainer, { paddingHorizontal: 20, paddingBottom: 20 }]}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.textColor,
                      borderColor: theme.textColor,
                      backgroundColor: theme.secondaryBackgroundColor,
                    },
                  ]}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask MovieBot..."
                  placeholderTextColor={theme.textMutedColor}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: theme.primaryColor }]}
                  onPress={handleSend}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Ionicons name="send" size={24} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ThemeProvider>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // This flex 1 should be applied when this component is the root of the screen.
    // When used as an overlay, it will probably need absolute positioning on the parent.
  },
  floatingButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    // For web compatibility, use boxShadow instead of shadow* properties
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
    elevation: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim background
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    width: '90%',
    height: '80%',
    alignItems: 'center',
    // For web compatibility, use boxShadow instead of shadow* properties
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  messageList: {
    width: '100%',
  },
  messageListContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '70%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    width: '100%',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100, // Limit height for multiline input
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatbotFloatingButton;
