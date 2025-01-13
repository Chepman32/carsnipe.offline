import React from 'react';
import { calculateTimeDifference } from '../../functions';
import { Card, Col, Flex, Space, Typography } from 'antd';
import "./auctionPage.css"
import ThinText from '../../components/Text/ThinText';
import { isMobile } from 'react-device-detect';

const getImageSource = (make, model) => {
    const imageName = `${make} ${model}.png`;
    return require(`../../assets/images/cars/${imageName}`);
};

export default function AuctionMobilePageItem({ auction, isSelected, index, handleItemClick }) {
    return (
        <Col className='mobileAuctionPageItem' span={24} style={{ height: '5%', width: '100%', display: 'flex' }} onClick={() => handleItemClick(auction)} >
            <Flex justify="space-between" align="flex-end" style={{width: "100%", paddingRight: "1vw", border: !isMobile && isSelected ? '2px solid #ff69b4' : 'none'}} >
                <div style={{display: "flex", alignItems: "center"}}>
                <img
                        src={getImageSource(auction.make, auction.model)}
                        alt="Auction"
                        className="mobileAuctionPageItem__image"
                        style={{ width: 'auto', height: '25vw', objectFit: "contain", marginRight: '10px' }}
                    />
                    <div style={{height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
                    <ThinText>{auction.year}&nbsp;{auction.make}&nbsp;{auction.model} </ThinText>
                        <Flex align="center">
                            <img src='https://static.thenounproject.com/png/1336726-200.png' className='hammer' alt=''/>
                            <Typography.Text className='subText'>
                                {calculateTimeDifference(auction.endTime)}
                            </Typography.Text>
                        </Flex>
                </div>
                </div>
                <Flex>
                <div style={{ display: 'flex', flexDirection: "column", alignItems: "flex-end" }}>
                            <p className='subText'>
                                {auction.currentBid > auction.minBid ? 'HIGHEST' : 'START'} BID
                            </p>
                            <Typography.Text className='price' >
                                {auction.currentBid || auction.minBid}
                            </Typography.Text>
                        </div>
                        <div style={{ display: 'flex', flexDirection: "column", alignItems: "flex-end", marginLeft: "3rem" }}>
                            <p className='subText'>Buy out</p>
                            <Typography.Text className='price'>{auction.buy}</Typography.Text>
                        </div>
                </Flex>
                </Flex>
        </Col>
    );
}
