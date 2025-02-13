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
import { FOCUS_ZONES, HEADER_MAIN_MENU, HEADER_SUB_MENU, setCurrentFocusedElement, setFocusedZone } from '../../redux/slices/focusSlice';
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
  const [focusedElement, setFocusedElement] = useState('avatars');
  const navigate = useNavigate();
  const darkMode = useSelector((state) => state.quickSettings.darkMode);
  const { focusedZone } = useSelector((state) => state.focus);

  useEffect(() => {
    form.setFieldsValue({
      nickname,
      bio
    });
  }, [form, nickname, bio]);

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent default if we're handling the key
      const key = event.key;
      
      // Only handle navigation if in the profile edit page zone
      if (focusedZone !== FOCUS_ZONES.PAGE) return;

      switch (focusedElement) {
        case 'avatars': {
          const totalAvatars = avatars.length;

          if (key === 'ArrowRight') {
            setFocusedAvatarIndex((prev) => 
              prev % avatarsPerRow === avatarsPerRow - 1 ? prev : prev + 1
            );
          } else if (key === 'ArrowLeft') {
            setFocusedAvatarIndex((prev) => 
              prev % avatarsPerRow === 0 ? prev : prev - 1
            );
          } else if (key === 'ArrowDown') {
            setFocusedAvatarIndex((prev) => 
              prev + avatarsPerRow < totalAvatars ? prev + avatarsPerRow : prev
            );
          } else if (key === 'ArrowUp') {
            // If on top row, move focus to header zone
            if (focusedAvatarIndex < avatarsPerRow) {
              dispatch(setFocusedZone(FOCUS_ZONES.HEADER));
              dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU));
            } else {
              // Otherwise, move up to previous row
              setFocusedAvatarIndex((prev) => prev - avatarsPerRow);
            }
          } else if (key === 'Enter') {
            handleAvatarSelect(avatars[focusedAvatarIndex]);
          } else if (key === 'Tab') {
            event.preventDefault(); // Prevent default tab behavior
            setFocusedElement('nickname');
          }
          break;
        }
        case 'nickname': {
          if (key === 'ArrowUp') {
            setFocusedElement('avatars');
            // Set focus to the last row's equivalent column
            const lastRowStartIndex = Math.floor((avatars.length - 1) / 4) * 4;
            const columnIndex = focusedAvatarIndex % 4;
            setFocusedAvatarIndex(Math.min(lastRowStartIndex + columnIndex, avatars.length - 1));
          } else if (key === 'ArrowDown') {
            setFocusedElement('bio');
          }
          break;
        }
        case 'bio': {
          if (key === 'ArrowUp') {
            setFocusedElement('nickname');
          } else if (key === 'ArrowDown') {
            setFocusedElement('submit');
          }
          break;
        }
        case 'submit': {
          if (key === 'ArrowUp') {
            setFocusedElement('bio');
          } else if (key === 'ArrowDown') {
            setFocusedElement('signout');
          } else if (key === 'Enter') {
            form.submit();
          }
          break;
        }
        case 'signout': {
          if (key === 'ArrowUp') {
            setFocusedElement('submit');
          } else if (key === 'Enter') {
            handleSignOut();
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusedElement, focusedAvatarIndex, focusedZone, avatars.length, dispatch]);

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
            <Form.Item name="nickname" label="Nickname">
              <Input 
                placeholder="Enter your nickname"
                className={`input-field ${focusedElement === 'nickname' ? 'focused' : ''}`}
              />
            </Form.Item>
            <Form.Item name="bio" label="Bio">
              <TextArea 
                placeholder="Tell us a couple of words about yourself" 
                rows={4}
                className={`textarea-field ${focusedElement === 'bio' ? 'focused' : ''}`}
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                block
                className={`submit-button ${focusedElement === 'submit' ? 'focused' : ''}`}
              >
                Save Changes
              </Button>
            </Form.Item>
            <Button
              icon={<LogoutOutlined />}
              onClick={handleSignOut}
              className={`signout-button ${focusedElement === 'signout' ? 'focused' : ''}`}
              danger
              block
            >
              Sign Out
            </Button>
          </Form>
        </div>
      </div>
    </>
  );
};

export default ProfileEditPage;