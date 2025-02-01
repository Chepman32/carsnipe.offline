import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  nickname: '',
  money: 0,
  avatar: '',
  auctionsNumber: 0,
  biddedAuctions: [],
  achievements: [],
  isAuthenticated: false,
  userPreferences: {
    notifications: true,
    language: 'en',
  },
  statistics: {
    wonAuctions: 0,
    totalBids: 0,
    moneySpent: 0,
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateMoney: (state, action) => {
      state.money = action.payload;
    },
    updateAvatar: (state, action) => {
      state.avatar = action.payload;
    },
    addBiddedAuction: (state, action) => {
      state.biddedAuctions.push(action.payload);
      state.statistics.totalBids += 1;
    },
    removeBiddedAuction: (state, action) => {
      state.biddedAuctions = state.biddedAuctions.filter(
        auction => auction.id !== action.payload
      );
    },
    addAchievement: (state, action) => {
      state.achievements.push(action.payload);
    },
    updateStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload };
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    updateUserPreferences: (state, action) => {
      state.userPreferences = { ...state.userPreferences, ...action.payload };
    },
    resetUser: () => initialState,
  },
});

export const {
  setUserData,
  updateMoney,
  updateAvatar,
  addBiddedAuction,
  removeBiddedAuction,
  addAchievement,
  updateStatistics,
  setAuthenticated,
  updateUserPreferences,
  resetUser,
} = userSlice.actions;

export default userSlice.reducer;
