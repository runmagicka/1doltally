import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "../../constants/url";

const getToken = (state) => state.auth.token;

export const fetchStats = createAsyncThunk(
  "stats/fetch",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState());
      const { data } = await axios.get(`${BASE_URL}/entries?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.entries;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch stats",
      );
    }
  },
);

// Compute all stats from raw entries
function compute(entries) {
  if (!entries.length) return null;

  // --- Top idols by count ---
  const idolCount = {};
  const idolMeta = {};
  entries.forEach((e) => {
    e.Idols?.forEach((idol) => {
      idolCount[idol.id] = (idolCount[idol.id] || 0) + 1;
      idolMeta[idol.id] = idol;
    });
  });
  const topIdols = Object.entries(idolCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([id, count]) => ({ idol: idolMeta[id], count }));

  // --- Thought breakdown ---
  const thoughtCount = {};
  entries.forEach((e) => {
    e.EntryThoughts?.forEach((t) => {
      thoughtCount[t.tag] = (thoughtCount[t.tag] || 0) + 1;
    });
  });
  const thoughtBreakdown = Object.entries(thoughtCount)
    .sort(([, a], [, b]) => b - a)
    .map(([tag, count]) => ({ tag, count }));

  // --- Medium breakdown ---
  const mediumCount = {};
  entries.forEach((e) => {
    e.mediumTags?.forEach((m) => {
      mediumCount[m] = (mediumCount[m] || 0) + 1;
    });
  });
  const mediumBreakdown = Object.entries(mediumCount)
    .sort(([, a], [, b]) => b - a)
    .map(([tag, count]) => ({ tag, count }));

  // --- Heatmap: count per date ---
  const dateCount = {};
  entries.forEach((e) => {
    const date = e.loggedAt.slice(0, 10);
    dateCount[date] = (dateCount[date] || 0) + 1;
  });
  const heatmapData = Object.entries(dateCount)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // --- Time of day ---
  const hourCount = Array(24).fill(0);
  entries.forEach((e) => {
    const hour = new Date(e.loggedAt).getHours();
    hourCount[hour]++;
  });
  const timeOfDay = hourCount.map((count, hour) => ({ hour, count }));

  // --- Most loyal idol: appears in most distinct months ---
  const idolMonths = {};
  entries.forEach((e) => {
    const month = e.loggedAt.slice(0, 7); // "2025-04"
    e.Idols?.forEach((idol) => {
      if (!idolMonths[idol.id]) idolMonths[idol.id] = new Set();
      idolMonths[idol.id].add(month);
    });
  });
  let mostLoyal = null;
  let maxMonths = 0;
  Object.entries(idolMonths).forEach(([id, months]) => {
    if (months.size > maxMonths) {
      maxMonths = months.size;
      mostLoyal = { idol: idolMeta[id], months: months.size };
    }
  });

  // --- Hyperfixation: biggest count increase this month vs last ---
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const thisMonthCount = {};
  const lastMonthCount = {};
  entries.forEach((e) => {
    const month = e.loggedAt.slice(0, 7);
    e.Idols?.forEach((idol) => {
      if (month === thisMonth)
        thisMonthCount[idol.id] = (thisMonthCount[idol.id] || 0) + 1;
      if (month === lastMonth)
        lastMonthCount[idol.id] = (lastMonthCount[idol.id] || 0) + 1;
    });
  });
  let hyperfixation = null;
  let maxIncrease = 0;
  Object.entries(thisMonthCount).forEach(([id, count]) => {
    const increase = count - (lastMonthCount[id] || 0);
    if (increase > maxIncrease) {
      maxIncrease = increase;
      hyperfixation = { idol: idolMeta[id], count, increase };
    }
  });

  return {
    totalEntries: entries.length,
    totalIdols: Object.keys(idolCount).length,
    topIdols,
    thoughtBreakdown,
    mediumBreakdown,
    heatmapData,
    timeOfDay,
    mostLoyal,
    hyperfixation,
  };
}

const statsSlice = createSlice({
  name: "stats",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.data = compute(action.payload);
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default statsSlice.reducer;
