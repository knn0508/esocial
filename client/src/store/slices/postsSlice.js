import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/posts`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/posts`, postData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/like`);
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

export const repostPost = createAsyncThunk(
  'posts/repostPost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/repost`);
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to repost');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/posts/${postId}`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

export const fetchComments = createAsyncThunk(
  'posts/fetchComments',
  async ({ postId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/posts/${postId}/comments`, {
        params: { page }
      });
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, content, parentCommentId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/comments`, {
        content,
        parentCommentId
      });
      return { postId, comment: response.data.comment };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const likeComment = createAsyncThunk(
  'posts/likeComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/comments/${commentId}/like`);
      return { commentId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/comments/${commentId}`);
      return commentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

const initialState = {
  posts: [],
  comments: {},
  loading: false,
  error: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  }
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPosts: (state) => {
      state.posts = [];
      state.comments = {};
      state.pagination = { current: 1, pages: 1, total: 0 };
    },
    updatePost: (state, action) => {
      const { postId, updates } = action.payload;
      const post = state.posts.find(p => p._id === postId);
      if (post) {
        Object.assign(post, updates);
      }
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter(post => post._id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload.post);
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, isLiked, likesCount } = action.payload;
        const post = state.posts.find(p => p._id === postId);
        if (post) {
          post.isLiked = isLiked;
          post.likesCount = likesCount;
        }
      })
      // Repost Post
      .addCase(repostPost.fulfilled, (state, action) => {
        const { postId, isReposted, repostsCount } = action.payload;
        const post = state.posts.find(p => p._id === postId);
        if (post) {
          post.isReposted = isReposted;
          post.repostsCount = repostsCount;
        }
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post._id !== action.payload);
      })
      // Fetch Comments
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId, comments, pagination } = action.payload;
        state.comments[postId] = { comments, pagination };
      })
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (state.comments[postId]) {
          state.comments[postId].comments.unshift(comment);
        }
        // Update post comments count
        const post = state.posts.find(p => p._id === postId);
        if (post) {
          post.commentsCount += 1;
        }
      })
      // Like Comment
      .addCase(likeComment.fulfilled, (state, action) => {
        const { commentId, isLiked, likesCount } = action.payload;
        Object.keys(state.comments).forEach(postId => {
          const comment = state.comments[postId].comments.find(c => c._id === commentId);
          if (comment) {
            comment.isLiked = isLiked;
            comment.likesCount = likesCount;
          }
        });
      })
      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const commentId = action.payload;
        Object.keys(state.comments).forEach(postId => {
          state.comments[postId].comments = state.comments[postId].comments.filter(
            c => c._id !== commentId
          );
        });
        // Update post comments count
        const post = state.posts.find(p => p._id === Object.keys(state.comments).find(
          pid => state.comments[pid].comments.some(c => c._id === commentId)
        ));
        if (post) {
          post.commentsCount -= 1;
        }
      });
  },
});

export const { clearError, clearPosts, updatePost, addPost, removePost } = postsSlice.actions;
export default postsSlice.reducer;
