import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../constants/url";

const getToken = (state) => state.auth.token;

export const fetchEntriesByIdol = createAsyncThunk(
  "entries/fetchByIdol",
  async (idolId, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/entries?idolId=${idolId}&limit=100`,
        { headers: { Authorization: `Bearer ${getToken(getState())}` } },
      );
      return data.entries;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch entries",
      );
    }
  },
);

export const deleteEntry = createAsyncThunk(
  "entries/delete",
  async (entryId, { getState, rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/entries/${entryId}`, {
        headers: { Authorization: `Bearer ${getToken(getState())}` },
      });
      return entryId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete entry",
      );
    }
  },
);

const entriesSlice = createSlice({
  name: "entries",
  initialState: {
    entries: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearEntries(state) {
      state.entries = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntriesByIdol.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntriesByIdol.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(fetchEntriesByIdol.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder.addCase(deleteEntry.fulfilled, (state, action) => {
      state.entries = state.entries.filter((e) => e.id !== action.payload);
    });
  },
});

export const { clearEntries } = entriesSlice.actions;
export default entriesSlice.reducer;
