// File: src/redux/slices/focusSlice.js

import { createSlice } from "@reduxjs/toolkit";

export const FOCUS_ZONES = {
  HEADER: "HEADER",
  PAGE: "PAGE",
  SETTINGS: "SETTINGS",
  STORE: "STORE",
  QUICK_MENU: "QUICK_MENU",
};

export const HEADER_MAIN_MENU = "HEADER_MAIN_MENU";
export const HEADER_CARS_STORE = "HEADER_CARS_STORE";
export const HEADER_MY_CARS = "HEADER_MY_CARS";
export const HEADER_AUCTIONS = "HEADER_AUCTIONS";
export const HEADER_STORE = "HEADER_STORE";
export const HEADER_PROFILE = "HEADER_PROFILE";
export const HEADER_LAST_OPTION = "HEADER_LAST_OPTION";

export const SETTINGS_DARK_MODE = "SETTINGS_DARK_MODE";
export const SETTINGS_SOUND_EFFECTS = "SETTINGS_SOUND_EFFECTS";
export const SETTINGS_MUSIC_VOLUME = "SETTINGS_MUSIC_VOLUME";

export const TOP_CAR = "TOP_CAR";

export const QUICK_MENU_DARK_MODE = "QUICK_MENU_DARK_MODE";
export const QUICK_MENU_MUSIC = "QUICK_MENU_MUSIC";
export const QUICK_MENU_SOUND = "QUICK_MENU_SOUND";
export const QUICK_MENU_STATION = "QUICK_MENU_STATION";

const initialState = {
  focusedZone: FOCUS_ZONES.PAGE,
  currentFocusedElement: "PAGE_MAIN_CONTENT",
  currentSettingsElement: SETTINGS_DARK_MODE,
  currentQuickMenuItem: QUICK_MENU_DARK_MODE,
  currentRoute: "/",
  isTopCar: false,
  storeFocusedIndex: 0,
  storeItemsCount: 6,
  settingsNeedsToggle: null,
  settingsVolumeChange: 0,
  isQuickMenuOpen: false,
  stationNeedsChange: null, // New field to track next/previous station requests
};

const focusSlice = createSlice({
  name: "focus",
  initialState,
  reducers: {
    handleKeyDown(state, action) {
      const key = action.payload;
      switch (state.focusedZone) {
        case FOCUS_ZONES.HEADER: {
          if (key === "ArrowLeft") {
            if (state.currentFocusedElement === HEADER_CARS_STORE) {
              state.currentFocusedElement = HEADER_MAIN_MENU;
            } else if (state.currentFocusedElement === HEADER_MY_CARS) {
              state.currentFocusedElement = HEADER_CARS_STORE;
            } else if (state.currentFocusedElement === HEADER_AUCTIONS) {
              state.currentFocusedElement = HEADER_MY_CARS;
            } else if (state.currentFocusedElement === HEADER_STORE) {
              state.currentFocusedElement = HEADER_AUCTIONS;
            } else if (state.currentFocusedElement === HEADER_PROFILE) {
              state.currentFocusedElement = HEADER_STORE;
            }
          } else if (key === "ArrowRight") {
            if (state.currentFocusedElement === HEADER_MAIN_MENU) {
              state.currentFocusedElement = HEADER_CARS_STORE;
            } else if (state.currentFocusedElement === HEADER_CARS_STORE) {
              state.currentFocusedElement = HEADER_MY_CARS;
            } else if (state.currentFocusedElement === HEADER_MY_CARS) {
              state.currentFocusedElement = HEADER_AUCTIONS;
            } else if (state.currentFocusedElement === HEADER_AUCTIONS) {
              state.currentFocusedElement = HEADER_STORE;
            } else if (state.currentFocusedElement === HEADER_STORE) {
              state.currentFocusedElement = HEADER_PROFILE;
            }
          } else if (key === "ArrowDown") {
            if (state.isQuickMenuOpen) {
              state.focusedZone = FOCUS_ZONES.QUICK_MENU;
              state.currentFocusedElement = QUICK_MENU_DARK_MODE;
              state.currentQuickMenuItem = QUICK_MENU_DARK_MODE;
              return;
            }
            if (state.currentRoute === "/carsStore" || state.currentRoute === "/mycars") {
              state.focusedZone = FOCUS_ZONES.PAGE;
              state.currentFocusedElement = TOP_CAR;
            } else if (state.currentRoute === "/store") {
              state.focusedZone = FOCUS_ZONES.STORE;
              state.storeFocusedIndex = 0;
            } else if (state.currentRoute === "/profileEditPage") {
              state.focusedZone = FOCUS_ZONES.PAGE;
              state.currentFocusedElement = "avatars";
            }
            if (
              state.currentFocusedElement === HEADER_PROFILE &&
              state.isQuickMenuOpen
            ) {
              state.focusedZone = FOCUS_ZONES.QUICK_MENU;
              state.currentFocusedElement = QUICK_MENU_DARK_MODE;
              state.currentQuickMenuItem = QUICK_MENU_DARK_MODE;
            }
          }
          break;
        }
        case FOCUS_ZONES.PAGE: {
          if (key === "ArrowDown") {
            if (state.currentFocusedElement === TOP_CAR) {
              state.currentFocusedElement = "";
            }
          }
          break;
        }
        case FOCUS_ZONES.SETTINGS: {
          if (key === "ArrowUp") {
            if (state.currentSettingsElement === SETTINGS_MUSIC_VOLUME) {
              state.currentSettingsElement = SETTINGS_SOUND_EFFECTS;
            } else if (state.currentSettingsElement === SETTINGS_SOUND_EFFECTS) {
              state.currentSettingsElement = SETTINGS_DARK_MODE;
              state.currentFocusedElement = SETTINGS_DARK_MODE;
            } else if (state.currentSettingsElement === SETTINGS_DARK_MODE) {
              state.focusedZone = FOCUS_ZONES.HEADER;
              state.currentFocusedElement = HEADER_MAIN_MENU;
              state.currentSettingsElement = null;
            }
          } else if (key === "ArrowDown") {
            if (
              state.currentSettingsElement === SETTINGS_DARK_MODE ||
              state.currentSettingsElement === null
            ) {
              state.currentSettingsElement = SETTINGS_SOUND_EFFECTS;
              state.currentFocusedElement = SETTINGS_SOUND_EFFECTS;
            } else if (
              state.currentSettingsElement === SETTINGS_SOUND_EFFECTS
            ) {
              state.currentSettingsElement = SETTINGS_MUSIC_VOLUME;
              state.currentFocusedElement = SETTINGS_MUSIC_VOLUME;
            }
          } else if (key === "Enter" || key === " ") {
            if (
              state.currentSettingsElement === SETTINGS_DARK_MODE ||
              state.currentSettingsElement === SETTINGS_SOUND_EFFECTS
            ) {
              state.settingsNeedsToggle = state.currentSettingsElement;
            }
          } else if (key === "ArrowLeft" || key === "ArrowRight") {
            if (state.currentSettingsElement === SETTINGS_MUSIC_VOLUME) {
              state.settingsVolumeChange = key === "ArrowRight" ? 1 : -1;
            }
          }
          break;
        }
        case FOCUS_ZONES.QUICK_MENU: {
          if (key === "ArrowUp") {
            if (state.currentFocusedElement === QUICK_MENU_MUSIC) {
              state.currentFocusedElement = QUICK_MENU_DARK_MODE;
              state.currentQuickMenuItem = QUICK_MENU_DARK_MODE;
            } else if (state.currentFocusedElement === QUICK_MENU_SOUND) {
              state.currentFocusedElement = QUICK_MENU_MUSIC;
              state.currentQuickMenuItem = QUICK_MENU_MUSIC;
            } else if (state.currentFocusedElement === QUICK_MENU_DARK_MODE) {
              state.focusedZone = FOCUS_ZONES.HEADER;
              state.currentFocusedElement = HEADER_PROFILE;
            } else if (state.currentFocusedElement === QUICK_MENU_STATION) {
              state.currentFocusedElement = QUICK_MENU_SOUND;
              state.currentQuickMenuItem = QUICK_MENU_SOUND;
            }
          } else if (key === "ArrowDown") {
            if (state.currentFocusedElement === QUICK_MENU_DARK_MODE) {
              state.currentFocusedElement = QUICK_MENU_MUSIC;
              state.currentQuickMenuItem = QUICK_MENU_MUSIC;
            } else if (state.currentFocusedElement === QUICK_MENU_MUSIC) {
              state.currentFocusedElement = QUICK_MENU_SOUND;
              state.currentQuickMenuItem = QUICK_MENU_SOUND;
            } else if (state.currentFocusedElement === QUICK_MENU_SOUND) {
              state.currentFocusedElement = QUICK_MENU_STATION;
              state.currentQuickMenuItem = QUICK_MENU_STATION;
            } else if (state.currentFocusedElement === QUICK_MENU_STATION) {
              state.focusedZone = FOCUS_ZONES.PAGE;
              if (state.currentRoute === "/carsStore") {
                state.currentFocusedElement = TOP_CAR;
              } else if (state.currentRoute === "/profileEditPage") {
                state.currentFocusedElement = "avatars";
              } else if (state.currentRoute === "/store") {
                state.currentFocusedElement = "store";
              } else if (state.currentRoute === "/settings") {
                state.currentFocusedElement = SETTINGS_DARK_MODE;
              } else {
                state.currentFocusedElement = "PAGE_MAIN_CONTENT";
              }
              state.currentQuickMenuItem = null;
            }
          } else if (key === "ArrowLeft") {
            if (state.currentFocusedElement === QUICK_MENU_STATION) {
              state.stationNeedsChange = "previous";
            }
          } else if (key === "ArrowRight") {
            if (state.currentFocusedElement === QUICK_MENU_STATION) {
              state.stationNeedsChange = "next";
            }
          } else if (key === "Escape") {
            state.focusedZone = FOCUS_ZONES.HEADER;
            state.currentFocusedElement = HEADER_PROFILE;
          }
          break;
        }
        case FOCUS_ZONES.STORE: {
          if (key === "ArrowLeft") {
            state.storeFocusedIndex = Math.max(state.storeFocusedIndex - 1, 0);
          } else if (key === "ArrowRight") {
            state.storeFocusedIndex = Math.min(
              state.storeFocusedIndex + 1,
              state.storeItemsCount - 1
            );
          } else if (key === "ArrowUp") {
            state.focusedZone = FOCUS_ZONES.HEADER;
            state.currentFocusedElement = HEADER_MAIN_MENU;
            state.storeFocusedIndex = 0;
            if (state.currentRoute === "/carsStore") {
              state.currentFocusedElement = TOP_CAR;
            }
          }
          break;
        }
        default:
          break;
      }
    },
    setLocation: (state, action) => {
      state.currentRoute = action.payload;
    },
    setFocusedZone(state, action) {
      state.focusedZone = action.payload;
      if (action.payload === FOCUS_ZONES.SETTINGS) {
        state.currentSettingsElement = SETTINGS_DARK_MODE;
        state.currentFocusedElement = SETTINGS_DARK_MODE;
      }
    },
    setCurrentFocusedElement: (state, action) => {
      state.currentFocusedElement = action.payload;
    },
    setCurrentSettingsElement: (state, action) => {
      state.currentSettingsElement = action.payload;
    },
    setIsTopCar: (state, action) => {
      state.isTopCar = action.payload;
    },
    setStoreItemsCount: (state, action) => {
      state.storeItemsCount = action.payload;
    },
    setSettingsNeedsToggle: (state, action) => {
      state.settingsNeedsToggle = action.payload;
    },
    setSettingsVolumeChange: (state, action) => {
      state.settingsVolumeChange = action.payload;
    },
    setIsQuickMenuOpen: (state, action) => {
      state.isQuickMenuOpen = action.payload;
    },
    setStationNeedsChange: (state, action) => {
      state.stationNeedsChange = action.payload;
    },
  },
});

export const {
  handleKeyDown,
  setLocation,
  setFocusedZone,
  setCurrentFocusedElement,
  setIsTopCar,
  setStoreItemsCount,
  setCurrentSettingsElement,
  setSettingsNeedsToggle,
  setSettingsVolumeChange,
  setIsQuickMenuOpen,
  setStationNeedsChange,
} = focusSlice.actions;

export default focusSlice.reducer;