import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/groups`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch groups');
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/groups`, groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create group');
    }
  }
);

export const fetchGroup = createAsyncThunk(
  'groups/fetchGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/groups/${groupId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch group');
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ groupId, groupData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/groups/${groupId}`, groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update group');
    }
  }
);

export const joinGroup = createAsyncThunk(
  'groups/joinGroup',
  async ({ groupId, inviteCode }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/groups/${groupId}/join`, { inviteCode });
      return { groupId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join group');
    }
  }
);

export const leaveGroup = createAsyncThunk(
  'groups/leaveGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/groups/${groupId}/leave`);
      return { groupId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to leave group');
    }
  }
);

export const fetchGroupPosts = createAsyncThunk(
  'groups/fetchGroupPosts',
  async ({ groupId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/groups/${groupId}/posts`, {
        params: { page }
      });
      return { groupId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch group posts');
    }
  }
);

const initialState = {
  groups: [],
  currentGroup: null,
  groupPosts: {},
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  }
};

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearGroups: (state) => {
      state.groups = [];
      state.currentGroup = null;
      state.groupPosts = {};
    },
    setCurrentGroup: (state, action) => {
      state.currentGroup = action.payload;
    },
    addGroup: (state, action) => {
      state.groups.unshift(action.payload);
    },
    removeGroup: (state, action) => {
      state.groups = state.groups.filter(group => group._id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload.groups;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Group
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.unshift(action.payload.group);
        state.error = null;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Group
      .addCase(fetchGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGroup = action.payload.group;
        state.error = null;
      })
      .addCase(fetchGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Group
      .addCase(updateGroup.fulfilled, (state, action) => {
        const { group } = action.payload;
        const groupIndex = state.groups.findIndex(g => g._id === group._id);
        if (groupIndex !== -1) {
          state.groups[groupIndex] = group;
        }
        if (state.currentGroup && state.currentGroup._id === group._id) {
          state.currentGroup = group;
        }
      })
      // Join Group
      .addCase(joinGroup.fulfilled, (state, action) => {
        const { groupId } = action.payload;
        const group = state.groups.find(g => g._id === groupId);
        if (group) {
          group.isMember = true;
          group.memberCount += 1;
        }
        if (state.currentGroup && state.currentGroup._id === groupId) {
          state.currentGroup.isMember = true;
          state.currentGroup.memberCount += 1;
        }
      })
      // Leave Group
      .addCase(leaveGroup.fulfilled, (state, action) => {
        const { groupId } = action.payload;
        const group = state.groups.find(g => g._id === groupId);
        if (group) {
          group.isMember = false;
          group.memberCount -= 1;
        }
        if (state.currentGroup && state.currentGroup._id === groupId) {
          state.currentGroup.isMember = false;
          state.currentGroup.memberCount -= 1;
        }
      })
      // Fetch Group Posts
      .addCase(fetchGroupPosts.fulfilled, (state, action) => {
        const { groupId, posts, pagination } = action.payload;
        state.groupPosts[groupId] = { posts, pagination };
      });
  },
});

export const { 
  clearError, 
  clearGroups, 
  setCurrentGroup, 
  addGroup, 
  removeGroup 
} = groupsSlice.actions;
export default groupsSlice.reducer;
