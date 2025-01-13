import React, { useState, useEffect, useRef } from "react";
import { Form, message, Typography, Spin } from "antd";
import { generateClient } from 'aws-amplify/api';
import * as mutations from '../../graphql/mutations';
import { fetchUserCarsRequest, getUserCar, deleteUserCar, createNewAuctionUser, playSwitchSound, playOpeningSound, playClosingSound, fetchAuctionCreator, fetchUserInfoById } from "../../functions";
import CarCard from "../CarPages/CarCard";
import { useParams } from "react-router-dom";

const client = generateClient();

const UserPage = () => {
  const [userInfo, setUserInfo] = useState(null)
  const [cars, setCars] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
 const [loading, setLoading] = useState(true);
 const [newAuctionvisible, setNewAuctionVisible] = useState(false);
 const [selectedCar, setSelectedCar] = useState(null);
 const [carDetailsVisible, setCarDetailsVisible] = useState(false);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  
  const { id } = useParams()

 const carsContainerRef = useRef(null);
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        setUserLoading(true);
        const user = await fetchUserInfoById(id)
        setUserInfo(user)
        console.log("fetchAuctionCreator", user)
      } catch (error) {
        console.log('Error fetching user:', error);
      } finally {
        setUserLoading(false);
      }
    }
    fetchUserInfo()
   async function fetchUserCars() {
     try {
       setLoading(true);
       const userCars = await fetchUserCarsRequest(id);
       setCars(userCars);
     } catch (error) {
       console.error('Error fetching cars:', error);
     } finally {
       setLoading(false);
     }
   }
   fetchUserCars();
 }, [id]);

 useEffect(() => {
   const handleKeyDown = (event) => {
     const { key } = event;
     const carsCount = cars.length;
     if (key === "ArrowRight" && !carDetailsVisible && !newAuctionvisible) {
       playSwitchSound();
       setSelectedCarIndex((prevIndex) => (prevIndex + 1) % carsCount);
     } else if (key === "ArrowLeft" && !carDetailsVisible && !newAuctionvisible) {
       playSwitchSound();
       setSelectedCarIndex((prevIndex) => (prevIndex - 1 + carsCount) % carsCount);
     } else if (key === "ArrowDown" && !carDetailsVisible && !newAuctionvisible) {
       playSwitchSound();
       setSelectedCarIndex((prevIndex) => (prevIndex + 5) % carsCount); // Move down by 5 cars
     } else if (key === "ArrowUp" && !carDetailsVisible && !newAuctionvisible) {
       playSwitchSound();
       setSelectedCarIndex((prevIndex) => (prevIndex - 5 + carsCount) % carsCount); // Move up by 5 cars
     } else if (key === "Enter" && !carDetailsVisible && !newAuctionvisible) {
      cancelNewAuction()
       setSelectedCar(cars[selectedCarIndex].car);
       cancelNewAuction()
       showCarDetailsModal();
     }
   };

   document.addEventListener("keydown", handleKeyDown);
   return () => {
     document.removeEventListener("keydown", handleKeyDown);
   };
 }, [cars, selectedCarIndex, carDetailsVisible, newAuctionvisible]);

 
  const showCarDetailsModal = () => {
    playOpeningSound()
   setCarDetailsVisible(true);
 };

  const cancelNewAuction = () => {
   setNewAuctionVisible(false);
 };

 const getImageSource = (make, model) => {
   const imageName = `${make} ${model}.png`;
   return require(`../../assets/images/cars/${imageName}`);
 };

 return (
   <div style={{ padding: '20px' }}>
     <h1>{userInfo?.nickname} </h1>
     {loading ? (
       <Spin size="large" fullscreen />
     ) : cars && cars.length ? (
       <div
         style={{ width: "100%", display: 'flex', flexDirection: 'row', flexWrap: "wrap" }}
         ref={carsContainerRef}
       >
         {cars.map((car, index) => (
           <CarCard
             key={car.car.id + Math.random()}
             selectedCar={index === selectedCarIndex ? car.car : null}
             setSelectedCar={(car) => {
               setSelectedCar(car)
               setSelectedCarIndex(index)
               showCarDetailsModal()
             }}
             showCarDetailsModal={showCarDetailsModal}
             car={car.car}
             getImageSource={getImageSource}
           />
         ))}
       </div>
     ) : (
       <Typography.Title>You have no cars</Typography.Title>
     )}
   </div>
 );
};

export default UserPage;