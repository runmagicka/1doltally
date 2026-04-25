import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../constants/url";

const getToken = (state) => state.auth.token;

export const DEFAULT_THOUGHTS = [
  "Her face",
  "Her voice",
  "Her personality",
  "Her style",
  "Her performance",
  "Her laugh",
];

export const DEFAULT_MEDIUMS = [
  "Twitter",
  "Pics",
  "Videos",
  "Reddit",
  "Fanfic",
  "Imagination",
];

export const fetchOptions = createAsyncThunk(
  "options/fetch",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState());
      const headers = { Authorization: `Bearer ${token}` };
      const [thoughtRes, mediumRes] = await Promise.all([
        axios.get(`${BASE_URL}/options?category=thought`, { headers }),
        axios.get(`${BASE_URL}/options?category=medium`, { headers }),
      ]);
      return {
        thoughtOptions: thoughtRes.data.options,
        mediumOptions: mediumRes.data.options,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch options",
      );
    }
  },
);

export const addOption = createAsyncThunk(
  "options/add",
  async ({ category, label }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}/options`,
        { category, label },
        { headers: { Authorization: `Bearer ${getToken(getState())}` } },
      );
      return data.option;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add option",
      );
    }
  },
);

export const deleteOption = createAsyncThunk(
  "options/delete",
  async (id, { getState, rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/options/${id}`, {
        headers: { Authorization: `Bearer ${getToken(getState())}` },
      });
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete option",
      );
    }
  },
);

const optionsSlice = createSlice({
  name: "options",
  initialState: {
    thoughtOptions: [],
    mediumOptions: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.thoughtOptions = action.payload.thoughtOptions;
        state.mediumOptions = action.payload.mediumOptions;
      })
      .addCase(fetchOptions.rejected, (state) => {
        state.loading = false;
      });

    builder.addCase(addOption.fulfilled, (state, action) => {
      const opt = action.payload;
      if (opt.category === "thought") state.thoughtOptions.push(opt);
      else state.mediumOptions.push(opt);
    });

    builder.addCase(deleteOption.fulfilled, (state, action) => {
      const id = action.payload;
      state.thoughtOptions = state.thoughtOptions.filter((o) => o.id !== id);
      state.mediumOptions = state.mediumOptions.filter((o) => o.id !== id);
    });
  },
});

export default optionsSlice.reducer;
