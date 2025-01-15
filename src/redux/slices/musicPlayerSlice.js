// src/redux/slices/musicPlayerSlice.js

import { REHYDRATE } from 'redux-persist';
import { createSlice } from '@reduxjs/toolkit';
import { stations } from '../stations';

const initialState = {
  currentStation: stations[0],
  currentTrack: null,
  isPlaying: false,
  tracks: [],
  loading: false,
  error: null
};

const musicPlayerSlice = createSlice({
  name: 'musicPlayer',
  initialState,
  reducers: {
    loadTracksRequest(state) {
      state.loading = true;
      state.error = null;
    },
    loadTracksSuccess(state, action) {
      state.loading = false;
      state.tracks = action.payload;
      state.currentTrack = action.payload[0] || null;
    },
    loadTracksFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    playTrack(state, action) {
      state.currentTrack = action.payload;
      state.isPlaying = true;
    },
    pauseTrack(state) {
      state.isPlaying = false;
    },
    setCurrentTrack(state, action) {
      state.currentTrack = action.payload;
    },
    switchStationRequest(state, action) {
      state.loading = true;
      state.error = null;
    },
    switchStationSuccess(state, action) {
      state.loading = false;
      state.currentStation = action.payload.station;
      state.tracks = action.payload.tracks;
      state.currentTrack = action.payload.tracks[0] || null;
      // Remove or comment out this line if you don't want auto-play:
      // state.isPlaying = true;
    },
    switchStationFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    playNextStation(state) {
      const currentIndex = stations.findIndex(s => s.id === state.currentStation.id);
      const nextIndex = (currentIndex + 1) % stations.length;
      state.currentStation = stations[nextIndex];
      state.tracks = stations[nextIndex].tracks;
      state.currentTrack = stations[nextIndex].tracks[0] || null;
      state.isPlaying = true; // Remove if you also don't want next-station auto-play
    },
    playPreviousStation(state) {
      const currentIndex = stations.findIndex(s => s.id === state.currentStation.id);
      const prevIndex = (currentIndex - 1 + stations.length) % stations.length;
      state.currentStation = stations[prevIndex];
      state.tracks = stations[prevIndex].tracks;
      state.currentTrack = stations[prevIndex].tracks[0] || null;
      state.isPlaying = true; // Remove if you also don't want previous-station auto-play
    }
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action) => {
      // If musicPlayer is being rehydrated, explicitly reset isPlaying to false
      if (action.payload && action.payload.musicPlayer) {
        state.currentStation = action.payload.musicPlayer.currentStation;
        state.currentTrack = action.payload.musicPlayer.currentTrack;
        state.tracks = action.payload.musicPlayer.tracks;
        state.loading = action.payload.musicPlayer.loading;
        state.error = action.payload.musicPlayer.error;
        state.isPlaying = false;
      }
    });
  }
});

export const {
  loadTracksRequest,
  loadTracksSuccess,
  loadTracksFailure,
  playTrack,
  pauseTrack,
  setCurrentTrack,
  switchStationRequest,
  switchStationSuccess,
  switchStationFailure,
  playNextStation,
  playPreviousStation
} = musicPlayerSlice.actions;

export default musicPlayerSlice.reducer;