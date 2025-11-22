import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/messages`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/messages/${userId}`, {
        params: { page }
      });
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ receiverId, content, attachments }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/messages`, {
        receiverId,
        content,
        attachments
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  'messages/markMessageAsRead',
  async (messageId, { rejectWithValue }) => {
    try {
      await axios.put(`${API_URL}/messages/${messageId}/read`);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark message as read');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/messages/${messageId}`);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete message');
    }
  }
);

const initialState = {
  conversations: [],
  messages: {},
  currentChat: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  }
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.conversations = [];
      state.messages = {};
      state.currentChat = null;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    addMessage: (state, action) => {
      const { userId, message } = action.payload;
      if (state.messages[userId]) {
        state.messages[userId].messages.push(message);
      }
    },
    updateMessage: (state, action) => {
      const { messageId, updates } = action.payload;
      Object.keys(state.messages).forEach(userId => {
        const message = state.messages[userId].messages.find(m => m._id === messageId);
        if (message) {
          Object.assign(message, updates);
        }
      });
    },
    removeMessage: (state, action) => {
      const messageId = action.payload;
      Object.keys(state.messages).forEach(userId => {
        state.messages[userId].messages = state.messages[userId].messages.filter(
          m => m._id !== messageId
        );
      });
    },
    updateConversation: (state, action) => {
      const { userId, updates } = action.payload;
      const conversation = state.conversations.find(c => c._id === userId);
      if (conversation) {
        Object.assign(conversation, updates);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.conversations;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, messages, otherUser, pagination } = action.payload;
        state.messages[userId] = { messages, otherUser, pagination };
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { message } = action.payload;
        const receiverId = message.receiverId._id;
        
        if (state.messages[receiverId]) {
          state.messages[receiverId].messages.push(message);
        }
        
        // Update conversation
        const conversation = state.conversations.find(c => c._id === receiverId);
        if (conversation) {
          conversation.lastMessage = {
            content: message.content,
            createdAt: message.createdAt,
            read: message.read
          };
        }
        
        state.error = null;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark Message as Read
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const messageId = action.payload;
        Object.keys(state.messages).forEach(userId => {
          const message = state.messages[userId].messages.find(m => m._id === messageId);
          if (message) {
            message.read = true;
            message.readAt = new Date().toISOString();
          }
        });
      })
      // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        Object.keys(state.messages).forEach(userId => {
          state.messages[userId].messages = state.messages[userId].messages.filter(
            m => m._id !== messageId
          );
        });
      });
  },
});

export const { 
  clearError, 
  clearMessages, 
  setCurrentChat, 
  addMessage, 
  updateMessage, 
  removeMessage,
  updateConversation 
} = messagesSlice.actions;
export default messagesSlice.reducer;
