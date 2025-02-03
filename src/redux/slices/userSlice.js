import { createSlice } from "@reduxjs/toolkit";
import { checkAndUpdateAchievements } from "../../functions";

// Load cars from localStorage if available
const loadCarsFromStorage = () => {
  try {
    const savedCars = localStorage.getItem('userCars');
    return savedCars ? JSON.parse(savedCars) : [];
  } catch (error) {
    console.error('Error loading cars from localStorage:', error);
    return [];
  }
};

const initialState = {
  nickname: "",
  money: 0,
  avatar: "",
  bio: "",
  auctionsNumber: 0,
  biddedAuctions: [],
  achievements: [],
  isAuthenticated: false,
  userPreferences: {
    notifications: true,
    language: "en",
  },
  statistics: {
    wonAuctions: 0,
    totalBids: 0,
    moneySpent: 0,
  },
  cars: loadCarsFromStorage(), // Load cars from localStorage
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      const newState = { ...state, ...action.payload };
      // Check for new achievements if relevant properties changed
      const relevantPropsChanged = [
        'cars',
        'biddedAuctions',
        'money',
        'achievements'
      ].some(prop => action.payload[prop] !== undefined);
      
      if (relevantPropsChanged) {
        checkAndUpdateAchievements(newState, userSlice.actions, () => ({ user: newState }));
      }
      return newState;
    },
    updateMoney: (state, action) => {
      state.money = action.payload;
      // Check for new achievements
      checkAndUpdateAchievements(state, userSlice.actions, () => ({ user: state }));
    },
    updateAvatar: (state, action) => {
      state.avatar = action.payload;
    },
    updateBio: (state, action) => {
      state.bio = action.payload;
    },
    addBiddedAuction: (state, action) => {
      state.biddedAuctions.push(action.payload);
      state.statistics.totalBids += 1;
      // Check for new achievements
      checkAndUpdateAchievements(state, userSlice.actions, () => ({ user: state }));
    },
    removeBiddedAuction: (state, action) => {
      state.biddedAuctions = state.biddedAuctions.filter(
        (auction) => auction.id !== action.payload
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
    addCar: (state, action) => {
      state.cars.push(action.payload);
      // Save to localStorage whenever cars are updated
      localStorage.setItem('userCars', JSON.stringify(state.cars));
      // Check for new achievements
      checkAndUpdateAchievements(state, userSlice.actions, () => ({ user: state }));
    },
    removeCar: (state, action) => {
      state.cars = state.cars.filter((car) => car.id !== action.payload);
      // Save to localStorage whenever cars are updated
      localStorage.setItem('userCars', JSON.stringify(state.cars));
      // Check for new achievements
      checkAndUpdateAchievements(state, userSlice.actions, () => ({ user: state }));
    },
    resetUser: (state) => {
      localStorage.removeItem('userCars'); // Clear cars from localStorage on reset
      return initialState;
    },
  },
});

export const {
  setUserData,
  updateMoney,
  updateAvatar,
  updateBio,
  addBiddedAuction,
  removeBiddedAuction,
  addAchievement,
  updateStatistics,
  setAuthenticated,
  updateUserPreferences,
  resetUser,
  addCar,
  removeCar,
} = userSlice.actions;

export default userSlice.reducer;
