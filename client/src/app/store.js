import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import idolsReducer from "../features/idols/idolsSlice";
import groupsReducer from "../features/groups/groupsSlice";
import entriesReducer from "../features/entries/entriesSlice";
import optionsReducer from "../features/options/optionsSlice";
import statsReducer from "../features/stats/statsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    idols: idolsReducer,
    groups: groupsReducer,
    entries: entriesReducer,
    options: optionsReducer,
    stats: statsReducer,
  },
});
