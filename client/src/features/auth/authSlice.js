import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { setToken, getToken, apiError } from '@/services/api';

export const register = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      setToken(data.token);
      return data.user;
    } catch (err) {
      return rejectWithValue(apiError(err, 'Registration failed'));
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', payload);
      setToken(data.token);
      return data.user;
    } catch (err) {
      return rejectWithValue(apiError(err, 'Login failed'));
    }
  }
);

export const loadMe = createAsyncThunk(
  'auth/loadMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data.user;
    } catch (err) {
      return rejectWithValue(apiError(err));
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/users/me/profile', payload);
      return data.user;
    } catch (err) {
      return rejectWithValue(apiError(err, 'Update failed'));
    }
  }
);

const initialState = {
  user: null,
  status: getToken() ? 'loading' : 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      setToken(null);
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const success = (state, action) => {
      state.user = action.payload;
      state.status = 'authenticated';
      state.error = null;
    };
    builder
      .addCase(register.fulfilled, success)
      .addCase(login.fulfilled, success)
      .addCase(loadMe.fulfilled, success)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(loadMe.rejected, (state) => {
        state.user = null;
        state.status = 'idle';
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'idle';
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload;
        state.status = 'idle';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
