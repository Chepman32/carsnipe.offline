import { Typography, Tooltip, Modal } from 'antd';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import "../mainPage.css"

const MainPageCenter = ({ focused, handleMouseEnter, onClick, isMenuOpen }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const { darkMode } = useSelector((state) => state.quickSettings);

  const handleClick = () => {
    if (navigator.onLine) {
      !isMenuOpen && navigate("/auctionsHub");
    } else {
      setIsModalVisible(true);
    }
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Tooltip title={!navigator.onLine ? "You are offline" : ""} disabled={navigator.onLine}>
        <div className={`tile ${darkMode ? 'darkTile' : ''} ${focused ? 'focused' : ''}`} onMouseEnter={() => handleMouseEnter("center")} onClick={handleClick} tabIndex={0} onKeyPress={(e) => { if (e.key === 'Enter') handleClick(); }}>
          <Typography.Text className="mainpage__cardText_black">
            Auctions
          </Typography.Text>
        </div>
      </Tooltip>
      <Modal
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        closable={false}
        className='offline_modal'
      >
        <h2>You are currently offline. Please check your internet connection.</h2>
        <img src={require("../../../assets/images/offline-warning.png")} alt="Offline" style={{ width: '30rem', height: '30rem' }} />
        <div className="offline_modal_okBtn" onClick={handleCancel}>
          <p>ok</p>
        </div>
      </Modal>
    </>
  );
};

export default MainPageCenter;

