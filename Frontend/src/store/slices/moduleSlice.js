import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeModule: 'dashboard',
  activeSubModule: null,
  activeTab: null,
};

const moduleSlice = createSlice({
  name: 'module',
  initialState,
  reducers: {
    setActiveModule: (state, action) => {
      state.activeModule = action.payload;
      state.activeSubModule = null;
      state.activeTab = null;
    },
    setActiveSubModule: (state, action) => {
      state.activeSubModule = action.payload;
      state.activeTab = null;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    resetModule: (state) => {
      state.activeModule = 'dashboard';
      state.activeSubModule = null;
      state.activeTab = null;
    },
  },
});

export const {
  setActiveModule,
  setActiveSubModule,
  setActiveTab,
  resetModule,
} = moduleSlice.actions;

export default moduleSlice.reducer;