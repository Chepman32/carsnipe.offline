// src/App.js
import React, { useCallback, useEffect, useState } from "react";
import { HashRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Spin } from 'antd';
import { Provider, useDispatch } from 'react-redux';
import { getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from "aws-amplify/api";
import store from './redux/store';
import MusicPlayer from './components/MusicPlayer/MusicPlayer';
import AuctionPage from "./pages/AuctionPage/AuctionPage";
import CustomHeader from "./components/CustomHeader/CustomHeader";
import CarsStore from "./pages/CarPages/CarsStore";
import MyCars from "./pages/CarPages/MyCars";
import AuctionsHub from "./pages/AuctionPage/AuctionHub";
import MyBids from "./pages/AuctionPage/MyBids";
import MyAuctions from "./pages/AuctionPage/MyAuctions";
import PaymentError from "./components/PaymentError";
import Store from "./pages/Store/Store";
import ProfileEditPage from "./pages/ProfileEditPage/ProfileEditPage";
import AchievementList from "./pages/AchievementList/AchievementList";
import { MainPage } from "./pages/MainPage/MainPage";
import './AuthStyles.css';
import MusicUploadPage from "./pages/MusicUploadPage/MusicUploadPage";
import MusicLibraryPage from "./pages/MusicLibraryPage/MusicLibraryPage";
import GameSettings from "./pages/GameSettings/GameSettings";
import { DarkModeWrapper } from "./components/DarkModeWrapper/DarkModeWrapper";
import UserPage from "./pages/UserPage/UserPage";
import { setUserData } from './redux/slices/userSlice';

function BackspaceHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Get the currently focused element
      const activeElement = document.activeElement;
      
      // Check if the focused element is an input, textarea, or any editable element
      const isEditableElement = (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true' ||
        activeElement.tagName === 'SELECT'
      );

      // Only navigate back if backspace is pressed and no editable element is focused
      if (event.key === 'Backspace' && !isEditableElement) {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
  return null;
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { username, userId, signInDetails } = await getCurrentUser();
      const userData = {
        id: userId,
        username,
        email: signInDetails?.loginId,
      };
      
      // Get current state from Redux
      const currentState = store.getState().user;
      
      // Only initialize if user data doesn't exist
      if (!currentState.nickname) {
        dispatch(setUserData({
          nickname: username,
          money: 100000, // Default starting money
          avatar: 'avatar1', // Default avatar
          bio: '', // Default bio
          biddedAuctions: [],
          achievements: [],
          userPreferences: {
            notifications: true,
            language: 'en'
          },
          statistics: {
            wonAuctions: 0,
            totalBids: 0,
            moneySpent: 0
          }
        }));
      }

      setUser(userData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking user:', error);
      // For development, initialize with mock data if auth fails and no existing data
      const currentState = store.getState().user;
      
      if (!currentState.nickname) {
        dispatch(setUserData({
          nickname: "Demo User",
          money: 100000,
          avatar: 'avatar1',
          bio: '',
          biddedAuctions: [],
          achievements: [],
          userPreferences: {
            notifications: true,
            language: 'en'
          },
          statistics: {
            wonAuctions: 0,
            totalBids: 0,
            moneySpent: 0
          }
        }));
      }
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DarkModeWrapper>
      <div className="App">
        <BackspaceHandler />
        <CustomHeader />
        <MusicPlayer />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/carsStore" element={<CarsStore />} />
            <Route path="/myCars" element={<MyCars />} />
            <Route path="/auctions" element={<AuctionPage />} />
            <Route path="/auctionsHub" element={<AuctionsHub />} />
            <Route path="/myBids" element={<MyBids />} />
            <Route path="/myAuctions" element={<MyAuctions />} />
            <Route path="/paymentError" element={<PaymentError />} />
            <Route path="/store" element={<Store />} />
            <Route path="/profileEditPage" element={<ProfileEditPage />} />
            <Route path="/achievements" element={<AchievementList />} />
            <Route path="/musicUpload" element={<MusicUploadPage />} />
            <Route path="/musicLibraryPage" element={<MusicLibraryPage />} />
            <Route path="/settings" element={<GameSettings />} />
            <Route path="/userPage/:id" element={<UserPage />} />
          </Routes>
        </div>
      </div>
    </DarkModeWrapper>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </Provider>
  );
}