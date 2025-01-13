import React, { useEffect, useRef, useState } from 'react';
import { Menu, Typography, Drawer, Button } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { MenuOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleMusic,
  toggleDarkMode,
  toggleSoundEffects
} from '../../redux/slices/quickSettingsSlice';
import {
  MenuItems
} from './MenuItems';
import plus_symbol from '../../assets/icons/plus_ymbol.png';
import {
  FOCUS_ZONES,
  HEADER_MAIN_MENU,
  HEADER_PROFILE,
  HEADER_STORE,
  QUICK_MENU_DARK_MODE,
  QUICK_MENU_MUSIC,
  QUICK_MENU_SOUND,
  handleKeyDown,
  setCurrentFocusedElement,
  setIsQuickMenuOpen
} from '../../redux/slices/focusSlice';
import { setMusicVolume } from '../../redux/slices/mainSettingsSlice';
import {
  playNextStation,
  playPreviousStation
} from '../../redux/slices/musicPlayerSlice';
import fastForward from "../../assets/icons/fast-forward.png"
import rewind from "../../assets/icons/rewind.png"

const { Text, Title } = Typography;

const CustomHeader = ({ nickname, avatar, money }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const closeMenuTimeout = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { musicOn, soundEffectsOn, darkMode } = useSelector((state) => state.quickSettings);
  const { musicVolume } = useSelector((state) => state.mainSettings);
  const { focusedZone, currentFocusedElement, isQuickMenuOpen } = useSelector((state) => state.focus);
  const { currentStation } = useSelector((state) => state.musicPlayer);

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const handleToggleMusic = () => {
    if (musicVolume <= 0) {
      dispatch(setMusicVolume(50));
    }
    dispatch(toggleMusic());
  };

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  const handleToggleSoundEffects = () => {
    dispatch(toggleSoundEffects());
  };

  const handleMouseEnterMenu = () => {
    setIsMenuOpen(true);
    dispatch(setIsQuickMenuOpen(true));
  };

  const handleMouseLeaveMenu = () => {
    setIsMenuOpen(false);
    if (focusedZone !== FOCUS_ZONES.QUICK_MENU && currentFocusedElement !== HEADER_PROFILE) {
      dispatch(setIsQuickMenuOpen(false));
    }
  };

  useEffect(() => {
    const keyDownHandler = (event) => {
      dispatch(handleKeyDown(event.key));
      if (event.key === 'Enter') {
        switch (currentFocusedElement) {
          case 'HEADER_MAIN_MENU':
            navigate('/');
            break;
          case 'HEADER_CARS_STORE':
            navigate('/carsStore');
            break;
          case 'HEADER_MY_CARS':
            navigate('/myCars');
            break;
          case 'HEADER_AUCTIONS':
            navigate('/auctionsHub');
            break;
          case HEADER_STORE:
            navigate('/store');
            break;
          case HEADER_PROFILE:
            navigate('/profileEditPage');
            break;
          case QUICK_MENU_DARK_MODE:
            dispatch(toggleDarkMode());
            break;
          case QUICK_MENU_MUSIC:
            handleToggleMusic();
            break;
          case QUICK_MENU_SOUND:
            dispatch(toggleSoundEffects());
            break;
          default:
            break;
        }
      }
      else if(event.key === 'Escape') {
        dispatch(setIsQuickMenuOpen(false));
        dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU));
      }
    };

    window.addEventListener('keydown', keyDownHandler);
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [
    dispatch,
    navigate,
    currentFocusedElement
  ]);

  useEffect(() => {
    if (currentFocusedElement === HEADER_PROFILE) {
      dispatch(setIsQuickMenuOpen(true));
    } else if (focusedZone !== FOCUS_ZONES.QUICK_MENU) {
      dispatch(setIsQuickMenuOpen(false));
    }
  }, [currentFocusedElement, focusedZone, dispatch]);

  useEffect(() => {
    return () => {
      if (closeMenuTimeout.current) {
        clearTimeout(closeMenuTimeout.current);
      }
    };
  }, []);

  if (location.pathname === '/') {
    return null;
  }

  return (
    <>
      <Menu
        theme={darkMode ? 'dark' : 'light'}
        mode="horizontal"
        className={darkMode ? 'customHeader dark-mode' : 'customHeader light-mode'}
        style={{
          width: '100%',
          lineHeight: '64px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Button
            aria-label="Open Menu"
            className="burgerMenuButton"
            icon={<MenuOutlined />}
            onClick={toggleDrawer}
            style={{ display: isMobile ? 'block' : 'none' }}
          />
          {!isMobile && <MenuItems />}
          <section style={{ display: 'flex', alignItems: 'center' }}>
            <Link
              to="/store"
              className={isHovered ? 'storeLink scale-up' : 'storeLink scale-down'}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                background:
                  location.pathname === '/store'
                    ? 'rgba(42, 72, 234, 0.57)'
                    : 'transparent',
                border:
                  focusedZone === FOCUS_ZONES.HEADER &&
                  currentFocusedElement === HEADER_STORE
                    ? '2px solid red'
                    : 'none'
              }}
              tabIndex={0}
            >
              <img src={plus_symbol} alt="plus_symbol" className="headerIcon" />
              <Text
                style={{
                  marginRight: 15,
                  fontWeight: 'bold',
                  color: darkMode ? '#ffdd00' : '#000000'
                }}
              >
                {'$' + money}
              </Text>
            </Link>
            <Link
              onMouseEnter={handleMouseEnterMenu}
              onMouseLeave={handleMouseLeaveMenu}
              to="/profileEditPage"
              className="customHeader__avatar"
              style={{
                padding: '0.45rem',
                background:
                  location.pathname === '/profileEditPage' ||
                  location.pathname === '/achievements'
                    ? 'rgba(42, 72, 234, 0.57)'
                    : 'transparent',
                border:
                  focusedZone === FOCUS_ZONES.HEADER &&
                  currentFocusedElement === HEADER_PROFILE
                    ? '2px solid red'
                    : 'none',
                borderRadius: '.7rem'
              }}
              ref={menuRef}
              tabIndex={0}
            >
              <Text
                style={{
                  marginRight: 15,
                  color: 'var(--text-color)',
                  fontSize: '1.4rem',
                  fontWeight: 'bold'
                }}
              >
                {nickname}
              </Text>
              <img src={avatar} alt="avatar" />
            </Link>
            <div
              className={
                isMenuOpen ||
                isQuickMenuOpen ||
                currentFocusedElement === HEADER_PROFILE ||
                focusedZone === FOCUS_ZONES.QUICK_MENU
                  ? 'settings-menu open'
                  : 'settings-menu'
              }
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={handleMouseEnterMenu}
              onMouseLeave={handleMouseLeaveMenu}
              tabIndex={0}
              role="menu"
              aria-label="Settings Menu"
            >
              <div
                className={`settings-menu-item ${
                  focusedZone === FOCUS_ZONES.QUICK_MENU &&
                  currentFocusedElement === QUICK_MENU_DARK_MODE
                    ? 'focused'
                    : ''
                }`}
                onClick={handleToggleDarkMode}
                role="menuitem"
                tabIndex={-1}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/5262/5262027.png"
                  alt="Dark Mode"
                />
                <span>Dark Mode: {darkMode ? 'On' : 'Off'}</span>
              </div>
              <div
                className={`settings-menu-item ${
                  focusedZone === FOCUS_ZONES.QUICK_MENU &&
                  currentFocusedElement === QUICK_MENU_MUSIC
                    ? 'focused'
                    : ''
                }`}
                onClick={handleToggleMusic}
                role="menuitem"
                tabIndex={-1}
              >
                <img
                  src="https://static.vecteezy.com/system/resources/previews/011/934/413/non_2x/silver-music-note-icon-free-png.png"
                  alt="Music"
                />
                <span>Music: {musicOn ? 'On' : 'Off'}</span>
              </div>
              <div
                className={`settings-menu-item ${
                  focusedZone === FOCUS_ZONES.QUICK_MENU &&
                  currentFocusedElement === QUICK_MENU_SOUND
                    ? 'focused'
                    : ''
                }`}
                onClick={handleToggleSoundEffects}
                role="menuitem"
                tabIndex={-1}
              >
                <img
                  src="https://cdn1.iconfinder.com/data/icons/ios-and-android-line-set-2/52/call__phone__volume__sound-512.png"
                  alt="Sound"
                />
                <span>Sound: {soundEffectsOn ? 'On' : 'Off'}</span>
              </div>
              <Title
                level={5}
                style={{
                  margin: '8px 0',
                  textAlign: 'center',
                  color: 'var(--text-color)',
                  fontWeight: 800
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {currentStation && (
                    <img
                      src={currentStation.icon}
                      alt={currentStation.name}
                      style={{ width: '24px', height: '24px', marginRight: '8px' }}
                    />
                  )}
                  {currentStation ? currentStation.name : ''}
                </div>
              </Title>
              <div className="settings-menu-item station-controls">
                <button
                  onClick={() => dispatch(playPreviousStation())}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <img
                    src={rewind}
                    alt="Previous Station"
                    style={{ width: '24px', height: '24px' }}
                  />
                </button>
                <button
                  onClick={() => dispatch(playNextStation())}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <img
                    src={fastForward}
                    alt="Next Station"
                    style={{ width: '24px', height: '24px' }}
                  />
                </button>
              </div>
            </div>
          </section>
        </div>
      </Menu>
      <Drawer
        title="Menu"
        placement="left"
        closable={true}
        onClose={toggleDrawer}
        open={drawerVisible}
      >
        <MenuItems />
      </Drawer>
      <div className="headerPlaceholder"></div>
    </>
  );
};

export default CustomHeader;