import { createSlice } from "@reduxjs/toolkit";

const getBooleanFromLocalStorage = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  if (stored === null) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage`, error);
    return defaultValue;
  }
};

const initialState = {
  darkMode: getBooleanFromLocalStorage("darkMode", false),
  musicVolume: (() => {
    const stored = localStorage.getItem("musicVolume");
    const parsed = parseInt(stored, 10);
    return isNaN(parsed) ? 50 : parsed;
  })(),
  soundEffectsOn: getBooleanFromLocalStorage("soundEffectsOn", true), // Ensure this is correctly named
};

const mainSettingsSlice = createSlice({
  name: "mainSettings",
  initialState,
  reducers: {
    setDarkMode(state, action) {
      state.darkMode = action.payload;
      localStorage.setItem("darkMode", JSON.stringify(state.darkMode));
    },
    setMusicVolume(state, action) {
      state.musicVolume = action.payload;
      localStorage.setItem("musicVolume", state.musicVolume.toString());
    },
    setSoundEffectsOn(state, action) {
      state.soundEffectsOn = action.payload;
      localStorage.setItem(
        "soundEffectsOn",
        JSON.stringify(state.soundEffectsOn)
      );
    },
  },
});

export const { setDarkMode, setMusicVolume, setSoundEffectsOn } =
  mainSettingsSlice.actions;
export default mainSettingsSlice.reducer;
