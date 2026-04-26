import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../constants/url";

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });
      return data; // { token }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/register`, {
        username,
        email,
        password,
      });
      return data; // { message, token }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Register failed");
    }
  },
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const { data } = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data; // { id, username, email, avatarUrl, createdAt }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch profile",
      );
    }
  },
);

export const updateAvatar = createAsyncThunk(
  "auth/updateAvatar",
  async (file, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await axios.patch(
        `${BASE_URL}/auth/profile/avatar`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data; // { avatarUrl }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update avatar",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token") || null,
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAuth(state) {
      state.token = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Profile
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      // Server returns { user: { id, username, email, avatar } }
      state.user = action.payload.user;
    });

    // Update Avatar
    builder.addCase(updateAvatar.fulfilled, (state, action) => {
      // Server returns { avatar: url }
      if (state.user) {
        state.user.avatar = action.payload.avatar;
      }
    });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
