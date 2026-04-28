import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../constants/url";

const getToken = (state) => state.auth.token;

export const fetchGroups = createAsyncThunk(
  "groups/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/groups`, {
        headers: { Authorization: `Bearer ${getToken(getState())}` },
      });
      return data.groups;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch groups",
      );
    }
  },
);

export const fetchIdolsByGroup = createAsyncThunk(
  "groups/fetchByGroup",
  async (groupId, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/idols/by-group/${groupId}`,
        {
          headers: { Authorization: `Bearer ${getToken(getState())}` },
        },
      );
      return data; // { members, others }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch idols by group",
      );
    }
  },
);

export const fetchGroupDetail = createAsyncThunk(
  "groups/fetchDetail",
  async (groupId, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${getToken(getState())}` },
      });
      return data; // { group, stats }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch group detail",
      );
    }
  },
);

export const updateGroupPhoto = createAsyncThunk(
  "groups/updatePhoto",
  async ({ id, file }, { getState, rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const { data } = await axios.patch(`${BASE_URL}/groups/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${getToken(getState())}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return data.group;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update group photo",
      );
    }
  },
);

export const fetchAllForLog = createAsyncThunk(
  "groups/fetchAllForLog",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/idols/all-for-log`, {
        headers: { Authorization: `Bearer ${getToken(getState())}` },
      });
      return data.idols;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch idols for log",
      );
    }
  },
);

const groupsSlice = createSlice({
  name: "groups",
  initialState: {
    groups: [],
    byGroup: { members: [], others: [] },
    allForLog: [],
    groupDetail: null,
    groupStats: null,
    loading: false,
    detailLoading: false,
  },
  reducers: {
    clearGroupDetail(state) {
      state.groupDetail = null;
      state.groupStats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state) => {
        state.loading = false;
      });

    builder.addCase(fetchIdolsByGroup.fulfilled, (state, action) => {
      state.byGroup = action.payload;
    });

    builder.addCase(fetchAllForLog.fulfilled, (state, action) => {
      state.allForLog = action.payload;
    });

    builder
      .addCase(fetchGroupDetail.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchGroupDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.groupDetail = action.payload.group;
        state.groupStats = action.payload.stats;
      })
      .addCase(fetchGroupDetail.rejected, (state) => {
        state.detailLoading = false;
      });

    builder.addCase(updateGroupPhoto.fulfilled, (state, action) => {
      if (state.groupDetail) {
        state.groupDetail.photoUrl = action.payload.photoUrl;
      }
    });
  },
});

export default groupsSlice.reducer;
export const { clearGroupDetail } = groupsSlice.actions;
