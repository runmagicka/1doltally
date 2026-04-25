import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../constants/url";

const getToken = (state) => state.auth.token;

export const fetchIdols = createAsyncThunk(
  "idols/fetchAll",
  async (sort = "createdAt", { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/idols?sort=${sort}`, {
        headers: { Authorization: `Bearer ${getToken(getState())}` },
      });
      return data.idols;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch idols",
      );
    }
  },
);

export const fetchIdolDetail = createAsyncThunk(
  "idols/fetchDetail",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/idols/${id}`, {
        headers: { Authorization: `Bearer ${getToken(getState())}` },
      });
      return data.idol;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch idol",
      );
    }
  },
);

export const updateIdolPhoto = createAsyncThunk(
  "idols/updatePhoto",
  async ({ id, file }, { getState, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const { data } = await axios.patch(`${BASE_URL}/idols/${id}`, formData, {
        headers: { Authorization: `Bearer ${getToken(getState())}` },
      });
      return data.idol;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update photo",
      );
    }
  },
);

const idolsSlice = createSlice({
  name: "idols",
  initialState: {
    idols: [],
    idolDetail: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearIdolDetail(state) {
      state.idolDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIdols.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIdols.fulfilled, (state, action) => {
        state.loading = false;
        state.idols = action.payload;
      })
      .addCase(fetchIdols.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchIdolDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.idolDetail = null;
      })
      .addCase(fetchIdolDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.idolDetail = action.payload;
      })
      .addCase(fetchIdolDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder.addCase(updateIdolPhoto.fulfilled, (state, action) => {
      const updated = action.payload;
      // Update in list
      const idx = state.idols.findIndex((i) => i.id === updated.id);
      if (idx !== -1) state.idols[idx].photoUrl = updated.photoUrl;
      // Update in detail
      if (state.idolDetail?.id === updated.id) {
        state.idolDetail.photoUrl = updated.photoUrl;
      }
    });
  },
});

export const { clearIdolDetail } = idolsSlice.actions;
export default idolsSlice.reducer;
