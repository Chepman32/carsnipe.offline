// src/App.js
import React, { useCallback, useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { Authenticator } from "@aws-amplify/ui-react";
import { HashRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Spin } from 'antd';
import { Provider } from 'react-redux';
import store from './redux/store';
import MusicPlayer from './components/MusicPlayer/MusicPlayer';
import { listUsers } from "./graphql/queries";
import { createUser } from "./graphql/mutations";
import "@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports";
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
import { checkAndUpdateAchievements, extractNameFromEmail, selectAvatar } from "./functions";
import AchievementList from "./pages/AchievementList/AchievementList";
import { MainPage } from "./pages/MainPage/MainPage";
import './AuthStyles.css';
import MusicUploadPage from "./pages/MusicUploadPage/MusicUploadPage";
import MusicLibraryPage from "./pages/MusicLibraryPage/MusicLibraryPage";
import GameSettings from "./pages/GameSettings/GameSettings";
import { DarkModeWrapper } from "./components/DarkModeWrapper/DarkModeWrapper";

const client = generateClient();
Amplify.configure(awsExports);

function BackspaceHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Backspace") {
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            activeElement.isContentEditable);

        if (!isInputFocused) {
          event.preventDefault(); // Prevent default Backspace behavior
          navigate(-1); // Navigate back to the previous page
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  return null; // This component only sets up the global Backspace handler
}

export default function App() {
  const [isNewUser, setIsNewUser] = useState(false);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingUser, setCreatingUser] = useState(false);
  const [money, setMoney] = useState();


  useEffect(() => {
    if (playerInfo?.id) {
      checkAndUpdateAchievements(playerInfo.id);
    }
  }, [playerInfo?.id, money]);

  const createNewPlayer = useCallback(async (username) => {
    if (!email) return;
    try {
      setCreatingUser(true);
      const existingUsers = await client.graphql({
        query: listUsers,
        variables: { filter: { email: { eq: email } } }
      });
      if (existingUsers?.data?.listUsers?.items?.length > 0) {
        const existingUser = existingUsers.data.listUsers.items[0];
        setPlayerInfo(existingUser);
        setMoney(existingUser.money);
        return;
      }
      const newUserData = {
        nickname: extractNameFromEmail(username) || username,
        email,
        money: 100000,
        bidded: [],
        avatar: "avatar1",
        bio: "",
        achievements: [],
        sold: []
      };
      const createdPlayer = await client.graphql({
        query: createUser,
        variables: { input: newUserData }
      });
      if (createdPlayer?.data?.createUser) {
        setPlayerInfo(createdPlayer.data.createUser);
        setMoney(createdPlayer.data.createUser.money);
      }
    } catch (error) {
      console.error("Error creating new player:", error);
    } finally {
      setCreatingUser(false);
      setLoading(false);
    }
  }, [email]);

  const currentAuthenticatedUser = useCallback(async () => {
    try {
      const { signInDetails } = await getCurrentUser();
      setEmail(signInDetails?.loginId);
      const playersData = await client.graphql({ query: listUsers });
      const playersList = playersData?.data?.listUsers.items;
      const user = playersList.find((u) => u?.email === signInDetails?.loginId);
      const isNewUser = !playersList.some((pl) => pl?.email === email);
      setIsNewUser(isNewUser);
      if (!user) {
        await createNewPlayer(signInDetails?.loginId);
      } else {
        setPlayerInfo(user);
        setMoney(user?.money);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching current authenticated user:", err);
      setLoading(false);
    }
  }, [createNewPlayer, email]);

  const listener = async (data) => {
    await createNewPlayer(data?.payload?.data?.nickname);
    if (!playerInfo && !loading) {
      window.location.reload();
    }
  };

  useEffect(() => {
    Hub.listen("auth", listener);
  }, [listener]);

  useEffect(() => {
    currentAuthenticatedUser();
    document.title = "Carsnipe Online";
  }, [currentAuthenticatedUser]);

  const handleExit = () => {
    if (window.electron?.quitApp) {
      window.electron.quitApp();
    } else {
      console.error("Electron quit functionality is not available.");
    }
  };

  if (loading || creatingUser) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <HashRouter>
      <BackspaceHandler />
      <div className={playerInfo == null || playerInfo === undefined ? "auth-container" : ""}>
        <div className={playerInfo == null || playerInfo === undefined ? "auth-left" : ""} />
        <div className={playerInfo == null || playerInfo === undefined ? "auth-right" : ""}>
          <div className={playerInfo == null || playerInfo === undefined ? "authenticator-wrapper" : ""}>
            <Authenticator>
              {({ signOut, user }) => (
                <>
                  {playerInfo && (
                    <Provider store={store}>
                      <main>
                        <CustomHeader
                          money={money}
                          nickname={playerInfo.nickname}
                          avatar={selectAvatar(playerInfo.avatar)}
                        />
                        <DarkModeWrapper>
                        <Routes>
                          <Route
                            path="/"
                            element={
                              <MainPage
                              />
                            }
                          />
                          <Route
                            path="/profileEditPage"
                            element={
                              <ProfileEditPage
                                playerInfo={playerInfo}
                                currentAuthenticatedUser={currentAuthenticatedUser}
                                signOut={signOut}
                                setPlayerInfo={setPlayerInfo}
                              />
                            }
                          />
                          <Route
                            path="/carsStore"
                            element={
                              <CarsStore
                                playerInfo={playerInfo}
                                money={money}
                                setMoney={setMoney}
                              />
                            }
                          />
                          <Route
                            path="/auctions"
                            element={
                              <AuctionPage
                                playerInfo={playerInfo}
                                money={money}
                                setMoney={setMoney}
                              />
                            }
                          />
                          <Route
                            path="/myCars"
                            element={
                              <MyCars
                                playerInfo={playerInfo}
                                money={money}
                                setMoney={setMoney}
                              />
                            }
                          />
                          <Route 
                            path="/auctionsHub" 
                            element={<AuctionsHub />} 
                          />
                          <Route
                            path="/myBids"
                            element={
                              <MyBids
                                playerInfo={playerInfo}
                                money={money}
                                setMoney={setMoney}
                              />
                            }
                          />
                          <Route
                            path="/myAuctions"
                            element={
                              <MyAuctions
                                playerInfo={playerInfo}
                                money={money}
                                setMoney={setMoney}
                              />
                            }
                          />
                          <Route
                            path="/achievements"
                            element={<AchievementList userId={playerInfo.id} />}
                          />
                          <Route 
                            path="/paymentError" 
                            element={<PaymentError />} 
                          />
                          <Route
                            path="/store"
                            element={<Store email={playerInfo.email} />}
                          />
                          <Route
                            path="/settings"
                            element={<GameSettings
                              playerInfo={playerInfo}
                            />}
                          />
                          <Route
                            path="/musicUpload"
                            element={<MusicUploadPage />}
                          />
                          <Route
                            path="/musicLibraryPage"
                            element={<MusicLibraryPage />}
                          />
                        </Routes>
                        </DarkModeWrapper>
                      </main>
                      <MusicPlayer />
                    </Provider>
                  )}
                </>
              )}
            </Authenticator>
          </div>
          {
            !playerInfo && (
              <div className="exit-button" onClick={handleExit} >
                Quit game
              </div>
            )
          }
        </div>
      </div>
    </HashRouter>
  );
}