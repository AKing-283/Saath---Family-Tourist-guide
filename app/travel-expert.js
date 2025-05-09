import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getTravelExpertResponse } from '../services/geminiService';

export default function TravelExpertScreen() {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    {
      id: '1',
      type: 'bot',
      text: 'Hello! I\'m your AI travel expert powered by Gemini. How can I help you plan your trip today?',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: message.trim(),
    };
    setChat(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const response = await getTravelExpertResponse(message.trim(), chat);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response,
      };
      setChat(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: 'I apologize, but I encountered an error. Please try again.',
      };
      setChat(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === 'user' ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text style={[styles.messageText, { color: item.type === 'user' ? 'white' : colors.text }]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Travel Expert</Text>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={100}
      >
        <FlatList
          data={chat}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          inverted={false}
        />
        <View style={[styles.inputContainer, { backgroundColor: colors.inputBackground }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Ask me anything about travel..."
            placeholderTextColor={colors.placeholder}
            value={message}
            onChangeText={setMessage}
            multiline
            editable={!loading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary },
              (!message.trim() || loading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!message.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons
                name="send"
                size={24}
                color={message.trim() ? 'white' : colors.placeholder}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    gap: 12,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    padding: 8,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 