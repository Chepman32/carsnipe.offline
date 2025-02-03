// src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Defaults to localStorage for web
import { all } from 'redux-saga/effects';

import musicPlayerReducer from './slices/musicPlayerSlice';
import quickSettingsReducer from './slices/quickSettingsSlice';
import mainSettingsReducer from './slices/mainSettingsSlice';
import { musicPlayerSaga } from './sagas/musicPlayerSaga';
import focusReducer from './slices/focusSlice';
import userReducer from './slices/userSlice';

// Root Saga
function* rootSaga() {
  yield all([
    musicPlayerSaga(),
    // Add other sagas here if needed
  ]);
}

// Persist config for mainSettings (unchanged)
const mainSettingsPersistConfig = {
  key: 'mainSettings',
  storage,
  whitelist: ['darkMode', 'soundEffectsOn'],
};

const quickSettingsPersistConfig = {
  key: 'mainSettings',
  storage,
  whitelist: ['musicOn'],
};

const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['nickname', 'money', 'avatar', 'bio', 'achievements', 'userPreferences', 'statistics', 'auctionsNumber', 'biddedAuctions'],
};

const musicPlayerPersistConfig = {
  key: 'musicPlayer',
  storage,
  whitelist: ['currentStation', 'currentTrack', 'tracks', 'loading', 'error'],
};

// Wrap the musicPlayer reducer
const persistedMusicPlayerReducer = persistReducer(
  musicPlayerPersistConfig,
  musicPlayerReducer
);

const persistedQuickSettingsReducer = persistReducer(
  quickSettingsPersistConfig,
  quickSettingsReducer
);

const persistedMainSettingsReducer = persistReducer(
  mainSettingsPersistConfig,
  mainSettingsReducer
);

const persistedUserReducer = persistReducer(
  userPersistConfig,
  userReducer
);

// Create Saga Middleware
const sagaMiddleware = createSagaMiddleware();

// Configure the Redux Store
const store = configureStore({
  reducer: {
    musicPlayer: persistedMusicPlayerReducer,
    quickSettings: persistedQuickSettingsReducer,
    mainSettings: persistedMainSettingsReducer,
    focus: focusReducer,
    user: persistedUserReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false, // Disable thunk middleware since you're using saga
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(sagaMiddleware),
});

// Create Persistor
export const persistor = persistStore(store);

// Run Saga Middleware
sagaMiddleware.run(rootSaga);

export default store;