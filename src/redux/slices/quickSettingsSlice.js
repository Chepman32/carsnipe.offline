import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  darkMode: JSON.parse(localStorage.getItem("darkMode")) ?? false,
  musicOn: JSON.parse(localStorage.getItem("musicOn")) ?? true,
  soundEffectsOn: JSON.parse(localStorage.getItem("soundEffectsOn")) ?? true,
};

const quickSettingsSlice = createSlice({
  name: "quickSettings",
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem("darkMode", JSON.stringify(state.darkMode));
    },
    toggleMusic(state) {
      state.musicOn = !state.musicOn;
      localStorage.setItem("musicOn", JSON.stringify(state.musicOn));
    },
    toggleSoundEffects(state) {
      state.soundEffectsOn = !state.soundEffectsOn;
      localStorage.setItem(
        "soundEffectsOn",
        JSON.stringify(state.soundEffectsOn)
      );
    },
  },
});

export const { toggleDarkMode, toggleMusic, toggleSoundEffects } =
  quickSettingsSlice.actions;
export default quickSettingsSlice.reducer;
