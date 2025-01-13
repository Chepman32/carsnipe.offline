import React, { useEffect, useState } from "react";
import { Card, Col, Flex, Modal, Space, Spin, Typography } from "antd";
import "./auctionPage.css";
import { calculateTimeDifference, fetchAuctionCreator, fetchAuctionUser, playSwitchSound, selectAvatar } from "../../functions";
import { useNavigate } from "react-router-dom";
import AuctionActionsModalRow from "../../components/AuctionActionsModalRow/AuctionActionsModalRow";
import { isMobile } from "react-device-detect";
import { SelectedAuctionDetails } from "./SelectedAuctionDetails";

const getImageSource = (make, model) => {
    const imageName = `${make} ${model}.png`;
    return require(`../../assets/images/cars/${imageName}`);
  };

export const SelectedAuctionDetailsModal = ({ visible, close, selectedAuction, handleAuctionActionsShow }) => {
    const [avatar, setAvatar] = React.useState(null);

  useEffect(() => {
    const getAvatar = async () => {
      const auctionUser = await fetchAuctionUser(selectedAuction?.id);
      setAvatar(auctionUser.avatar);
    }
    getAvatar()
  }, [selectedAuction]);
  
  return (
    <Modal
      centered
      className="selectedAuctionDetailsModal"
      width={"90%"}
      open={visible}
      onCancel={close}
      footer={null}
    >
      <div className="auctionDetails" style={{ height: '100%', padding: '20px' }}>
      {selectedAuction && (
        <Flex direction="column" style={{ height: "100%" }}>
          <Card
            title={<h3>{`${selectedAuction.make.toUpperCase()} ${selectedAuction.model}`} </h3>}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ overflow: 'hidden' }}>
              <img
                src={getImageSource(selectedAuction.make, selectedAuction.model)}
                alt="Auction"
                className="auctionDetails_image"
              />
            </div>
            <Flex direction="column" align="center" style={{ marginTop: '20px', minWidth: "100%", justifyContent: "space-between" }}>
              <div className="selectedAuction__avatar">
                <img src={selectAvatar(avatar)} alt="Avatar" />
                <Typography.Text className="subText">{selectedAuction?.lastBidPlayer}</Typography.Text>
              </div>
              <Space direction="vertical" style={{width: "100%"}}>
                <div style={{width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                  <Typography.Text className="subText">{`${selectedAuction?.currentBid ? "Highest" : "Start"} Bid:`}&nbsp;</Typography.Text>
                  <Typography.Text className="price bid">{selectedAuction?.currentBid || selectedAuction.minBid}</Typography.Text>
                </div>
                <Space>
                  <Typography.Text className="subText">Buy out:</Typography.Text>
                  <Typography.Text className="price buy">{selectedAuction.buy}</Typography.Text>
                </Space>
                <Typography.Text className="time">
                {calculateTimeDifference(selectedAuction.endTime)}
                                  </Typography.Text>
                                  <div className="selectedAuctionDetailsModal__actions" onClick={handleAuctionActionsShow}>
                                  <h3 style={{textAlign: "right"}}>Purchase ...</h3>
                                  </div>
              </Space>
            </Flex>
          </Card>
        </Flex>
      )}
    </div>
    </Modal>
  );
};
