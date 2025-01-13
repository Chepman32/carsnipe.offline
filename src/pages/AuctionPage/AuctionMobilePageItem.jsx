import React from 'react';
import { Card, Col, Flex, Typography } from 'antd';
import "./auctionPage.css"; // Ensure this file contains mobile-specific styles

const getImageSource = (make, model) => {
    const imageName = `${make} ${model}.png`;
    return require(`../../assets/images/cars/${imageName}`);
};

export default function AuctionMobilePageItem({ auction, handleItemClick }) {
    return (
        <Col className='mobileAuctionPageItem' span={24} onClick={() => handleItemClick(auction)} >
            <Flex direction="column" align="center" style={{ width: "100%", padding: "10px" }}>
                <img
                    src={getImageSource(auction.make, auction.model)}
                    alt="Auction"
                    style={{ width: '100%', height: 'auto', objectFit: "contain", marginBottom: '10px' }}
                />
                <Typography.Text className='subText'>{auction.year} {auction.make} {auction.model}</Typography.Text>
                <Typography.Text className='price'>{auction.currentBid || auction.minBid}</Typography.Text>
                <Typography.Text className='subText'>Buy out: {auction.buy}</Typography.Text>
            </Flex>
        </Col>
    );
}
