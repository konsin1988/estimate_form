import { configureStore } from "@reduxjs/toolkit";
import reducer from "./estSlice";

export const store = configureStore({
  reducer: {
    profile: reducer,
  },
});

// Typescript types
export const RootState = store.getState;
export const AppDispatch = store.dispatch;
