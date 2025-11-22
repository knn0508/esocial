import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchMentorships = createAsyncThunk(
  'mentorship/fetchMentorships',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/mentorship`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch mentorships');
    }
  }
);

export const createMentorship = createAsyncThunk(
  'mentorship/createMentorship',
  async (mentorshipData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/mentorship`, mentorshipData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create mentorship');
    }
  }
);

export const fetchMentorship = createAsyncThunk(
  'mentorship/fetchMentorship',
  async (mentorshipId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/mentorship/${mentorshipId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch mentorship');
    }
  }
);

export const updateMentorshipStatus = createAsyncThunk(
  'mentorship/updateMentorshipStatus',
  async ({ mentorshipId, status, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/mentorship/${mentorshipId}/status`, {
        status,
        startDate,
        endDate
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update mentorship status');
    }
  }
);

export const addMentorshipNote = createAsyncThunk(
  'mentorship/addMentorshipNote',
  async ({ mentorshipId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/mentorship/${mentorshipId}/notes`, {
        content
      });
      return { mentorshipId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add note');
    }
  }
);

export const rateMentorship = createAsyncThunk(
  'mentorship/rateMentorship',
  async ({ mentorshipId, rating, feedback }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/mentorship/${mentorshipId}/rating`, {
        rating,
        feedback
      });
      return { mentorshipId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rate mentorship');
    }
  }
);

const initialState = {
  mentorships: [],
  currentMentorship: null,
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  }
};

const mentorshipSlice = createSlice({
  name: 'mentorship',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMentorships: (state) => {
      state.mentorships = [];
      state.currentMentorship = null;
    },
    setCurrentMentorship: (state, action) => {
      state.currentMentorship = action.payload;
    },
    updateMentorship: (state, action) => {
      const { mentorshipId, updates } = action.payload;
      const mentorship = state.mentorships.find(m => m._id === mentorshipId);
      if (mentorship) {
        Object.assign(mentorship, updates);
      }
      if (state.currentMentorship && state.currentMentorship._id === mentorshipId) {
        Object.assign(state.currentMentorship, updates);
      }
    },
    addMentorship: (state, action) => {
      state.mentorships.unshift(action.payload);
    },
    removeMentorship: (state, action) => {
      state.mentorships = state.mentorships.filter(mentorship => mentorship._id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Mentorships
      .addCase(fetchMentorships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMentorships.fulfilled, (state, action) => {
        state.loading = false;
        state.mentorships = action.payload.mentorships;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchMentorships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Mentorship
      .addCase(createMentorship.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMentorship.fulfilled, (state, action) => {
        state.loading = false;
        state.mentorships.unshift(action.payload.mentorship);
        state.error = null;
      })
      .addCase(createMentorship.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Mentorship
      .addCase(fetchMentorship.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMentorship.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMentorship = action.payload.mentorship;
        state.error = null;
      })
      .addCase(fetchMentorship.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Mentorship Status
      .addCase(updateMentorshipStatus.fulfilled, (state, action) => {
        const { mentorship } = action.payload;
        const mentorshipIndex = state.mentorships.findIndex(m => m._id === mentorship._id);
        if (mentorshipIndex !== -1) {
          state.mentorships[mentorshipIndex] = mentorship;
        }
        if (state.currentMentorship && state.currentMentorship._id === mentorship._id) {
          state.currentMentorship = mentorship;
        }
      })
      // Add Mentorship Note
      .addCase(addMentorshipNote.fulfilled, (state, action) => {
        const { mentorshipId } = action.payload;
        // Note is added to the mentorship on the server side
        // We could fetch the updated mentorship or handle it differently
      })
      // Rate Mentorship
      .addCase(rateMentorship.fulfilled, (state, action) => {
        const { mentorshipId, rating, feedback } = action.payload;
        const mentorship = state.mentorships.find(m => m._id === mentorshipId);
        if (mentorship) {
          mentorship.rating = rating;
          mentorship.feedback = feedback;
        }
        if (state.currentMentorship && state.currentMentorship._id === mentorshipId) {
          state.currentMentorship.rating = rating;
          state.currentMentorship.feedback = feedback;
        }
      });
  },
});

export const { 
  clearError, 
  clearMentorships, 
  setCurrentMentorship, 
  updateMentorship, 
  addMentorship, 
  removeMentorship 
} = mentorshipSlice.actions;
export default mentorshipSlice.reducer;
