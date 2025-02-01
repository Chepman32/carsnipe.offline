import React, { useEffect, useState } from 'react';
import { Form, Input, Button, notification, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { generateClient } from 'aws-amplify/api';
import * as mutations from '../../graphql/mutations';
import avatar1 from "../../assets/images/avatars/avatar1.jpg";
import avatar2 from "../../assets/images/avatars/avatar2.jpg";
import avatar3 from "../../assets/images/avatars/avatar3.jpeg";
import avatar4 from "../../assets/images/avatars/avatar4.jpeg";
import avatar5 from "../../assets/images/avatars/avatar5.jpeg";
import avatar6 from "../../assets/images/avatars/avatar6.jpeg";
import avatar7 from "../../assets/images/avatars/avatar7.png";
import avatar8 from "../../assets/images/avatars/avatar8.jpeg";
import avatar9 from "../../assets/images/avatars/avatar9.png";
import avatar10 from "../../assets/images/avatars/avatar10.png";
import avatar11 from "../../assets/images/avatars/avatar11.jpeg";
import avatar12 from "../../assets/images/avatars/avatar12.jpeg";
import avatar13 from "../../assets/images/avatars/avatar13.png";
import avatar14 from "../../assets/images/avatars/avatar14.png";
import avatar15 from "../../assets/images/avatars/avatar15.png";
import avatar16 from "../../assets/images/avatars/avatar16.png";
import "./styles.css";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FOCUS_ZONES, HEADER_MAIN_MENU, setCurrentFocusedElement, setFocusedZone } from '../../redux/slices/focusSlice';
import { setUserData, updateAvatar, updateUserPreferences } from '../../redux/slices/userSlice';

const client = generateClient();

const { Title } = Typography;
const { TextArea } = Input;

const avatarMap = {
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
  avatar9,
  avatar10,
  avatar11,
  avatar12,
  avatar13,
  avatar14,
  avatar15,
  avatar16
};

const avatars = Object.keys(avatarMap);
const avatarsPerRow = 4; // Number of avatars in one row

const ProfileEditPage = ({ signOut }) => {
  const dispatch = useDispatch();
  const { nickname, avatar, bio } = useSelector((state) => state.user);
  const [form] = Form.useForm();
  const [selectedAvatar, setSelectedAvatar] = useState(avatar);
  const [loading, setLoading] = useState(false);
  const [focusedAvatarIndex, setFocusedAvatarIndex] = useState(0);
  const [focusedElement, setFocusedElement] = useState('avatars'); // avatars, nickname, bio, achievements, signout
  const [isEditing, setIsEditing] = useState(false);

  const darkMode = useSelector((state) => state.quickSettings.darkMode);
  const { focusedZone } = useSelector((state) => state.focus);

  const navigate = useNavigate();

  useEffect(() => {
    if (focusedZone === FOCUS_ZONES.PAGE) {
      setFocusedElement('avatars');
      setFocusedAvatarIndex(0);
      setIsEditing(false);
    }
  }, [focusedZone]);

  useEffect(() => {
    form.setFieldsValue({
      nickname,
      bio
    });
  }, [form, nickname, bio]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isEditing && document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT") {
        if (event.key === "Escape") {
          document.activeElement.blur();
          setIsEditing(false);
          return;
        }
        if (event.key === "Tab") {
          return;
        }
        return;
      }

      let newIndex = focusedAvatarIndex;

      switch (event.key) {
        case "ArrowRight":
          if (focusedElement === 'avatars') {
            // Check if we're at the end of a row
            const currentRow = Math.floor(focusedAvatarIndex / avatarsPerRow);
            const positionInRow = focusedAvatarIndex % avatarsPerRow;
            
            // Only move right if we're not at the end of the row
            if (positionInRow < avatarsPerRow - 1 && focusedAvatarIndex + 1 < avatars.length) {
              newIndex = focusedAvatarIndex + 1;
            } else {
              // Stay at current position if at end of row
              newIndex = focusedAvatarIndex;
            }
          } else if (focusedElement === 'signout') {
            setFocusedElement('achievements');
          }
          break;
        case "ArrowLeft":
          if (focusedElement === 'avatars') {
            // Check position in row
            const positionInRow = focusedAvatarIndex % avatarsPerRow;
            
            // Only move left if we're not at the start of the row
            if (positionInRow > 0) {
              newIndex = focusedAvatarIndex - 1;
            } else {
              // Stay at current position if at start of row
              newIndex = focusedAvatarIndex;
            }
          } else if (focusedElement === 'achievements') {
            setFocusedElement('signout');
          }
          break;
        case "ArrowDown":
          if (focusedElement === 'avatars') {
            if (focusedAvatarIndex + avatarsPerRow < avatars.length) {
              newIndex = focusedAvatarIndex + avatarsPerRow;
            } else {
              setFocusedElement('nickname');
              setFocusedAvatarIndex(-1);
              return;
            }
          } else if (focusedElement === 'nickname') {
            setFocusedElement('bio');
            return;
          } else if (focusedElement === 'bio') {
            setFocusedElement('save');
            return;
          } else if (focusedElement === 'save') {
            setFocusedElement('signout');
            return;
          }
          break;
        case "ArrowUp":
          if (focusedAvatarIndex < avatarsPerRow && focusedElement === 'avatars') {
            dispatch(setFocusedZone(FOCUS_ZONES.HEADER))
            dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU))
            setFocusedAvatarIndex(-1)
            return;
          } else if (focusedElement === 'nickname') {
            setFocusedElement('avatars');
            setFocusedAvatarIndex(avatars.length - 1);
            return;
          } else if (focusedElement === 'bio') {
            setFocusedElement('nickname');
            return;
          } else if (focusedElement === 'save') {
            setFocusedElement('bio');
            return;
          } else if (focusedElement === 'signout') {
            setFocusedElement('save');
            return;
          } else if (focusedElement === 'achievements') {
            setFocusedElement('bio');
            return;
          }
          if (focusedElement === 'avatars') {
            newIndex = focusedAvatarIndex - avatarsPerRow >= 0 ? focusedAvatarIndex - avatarsPerRow : focusedAvatarIndex;
          }
          break;
        case "Enter":
        case " ":
          if (focusedElement === 'avatars') {
            setSelectedAvatar(avatars[focusedAvatarIndex]);
          } else if (focusedElement === 'achievements') {
            window.location.href = '/achievements#/achievements';
          } else if (focusedElement === 'nickname' || focusedElement === 'bio') {
            setIsEditing(true);
            const element = focusedElement === 'nickname' ? 
              document.querySelector('.input-field') : 
              document.querySelector('.textarea-field');
            if (element) {
              element.focus();
            }
          } else if (focusedElement === 'signout') {
            signOut();
          }
          break;
        default:
          break;
      }

      if (focusedElement === 'avatars') {
        setFocusedAvatarIndex(newIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedAvatarIndex, dispatch, focusedZone, focusedElement, isEditing]);

  const handleAvatarSelect = (avatarName) => {
    setSelectedAvatar(avatarName);
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // Update user data in Redux
      dispatch(setUserData({
        nickname: values.nickname,
        bio: values.bio
      }));

      // Update avatar if changed
      if (selectedAvatar !== avatar) {
        dispatch(updateAvatar(selectedAvatar));
      }

      notification.success({
        message: 'Profile Updated',
        description: 'Your profile has been successfully updated!'
      });
      setLoading(false);
    } catch (error) {
      notification.error({
        message: 'Update Failed',
        description: error.message
      });
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
    notification.info({
      message: 'Signed Out',
      description: 'You have been signed out successfully',
      placement: 'topRight',
    });
  };

  return (
    <>
      <div className={`profile-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="profile-box">
          <Title level={3} className="profile-title">
            Edit Profile: {nickname}
          </Title>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <div className="avatar-container">
              {avatars.map((avatarName, index) => (
                <img
                  key={index}
                  src={avatarMap[avatarName]}
                  className={`avatar-item ${selectedAvatar === avatarName ? 'selected' : ''} ${
                    index === focusedAvatarIndex ? 'focused' : ''
                  }`}
                  alt={avatarName}
                  onClick={() => handleAvatarSelect(avatarName)}
                />
              ))}
            </div>
            <Form.Item>
              <Input 
                placeholder="Enter your nickname" 
                value={nickname} 
                onChange={(event) => form.setFieldsValue({ nickname: event.target.value })}
                className={`input-field ${focusedElement === 'nickname' && !isEditing ? 'focused' : ''}`}
                readOnly={!isEditing}
              />
            </Form.Item>
            <Form.Item>
              <TextArea 
                placeholder="Tell us a couple of words about yourself" 
                rows={4}
                value={bio}
                onChange={(e) => form.setFieldsValue({ bio: e.target.value })}
                className={`textarea-field ${focusedElement === 'bio' && !isEditing ? 'focused' : ''}`}
                readOnly={!isEditing}
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                block
                className={`save-button ${focusedElement === 'save' ? 'focused' : ''}`}
                loading={loading}
              >
                Save Changes
              </Button>
            </Form.Item>
          </Form>
          <Button 
            danger
            icon={<LogoutOutlined />}
            onClick={handleSignOut}
            block
            className={`signout-button ${focusedElement === 'signout' ? 'focused' : ''}`}
          >
            Sign Out
          </Button>
        </div>
      </div>
      <Link 
        to="/achievements#/achievements"
        type="primary" 
        className={`achievementsButton ${focusedElement === 'achievements' ? 'focused' : ''}`}
      >
        My achievements
      </Link>
    </>
  );
};

export default ProfileEditPage;