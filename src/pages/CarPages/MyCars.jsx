import React, { useState, useEffect, useRef } from "react";
import { Form, message, Typography, Spin } from "antd";
import { generateClient } from 'aws-amplify/api';
import { listCars as listCarsQuery } from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import "./carsPage.css";
import CarDetailsModal from "./CarDetailsModal";
import CarCard from "./CarCard";
import { 
  fetchUserCarsRequest, 
  getUserCar, 
  deleteUserCar, 
  createNewAuctionUser, 
  playSwitchSound, 
  playOpeningSound, 
  playClosingSound 
} from "../../functions";
import NewAuctionModal from "./NewAuctionModal";
import { useSelector, useDispatch } from "react-redux";
import { 
  FOCUS_ZONES,
  HEADER_MAIN_MENU,
  setCurrentFocusedElement,
  setFocusedZone,
  setIsTopCar,
  TOP_CAR
} from "../../redux/slices/focusSlice";

const client = generateClient();

const MyCars = ({ playerInfo }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAuctionvisible, setNewAuctionVisible] = useState(false);
  const [auctionDuration, setAuctionDuration] = useState(1);
  const [minBid, setMinBid] = useState(0);
  const [buy, setBuy] = useState(0);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [loadingNewAuction, setLoadingNewAuction] = useState(false);

  const [selectedCar, setSelectedCar] = useState(null);
  const [focusedCar, setFocusedCar] = useState(null); 
  const [carDetailsVisible, setCarDetailsVisible] = useState(false);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);

  const soundEffectsOnQuickSettings = useSelector((state) => state.quickSettings.soundEffectsOn);
  const soundEffectsOn = useSelector((state) => state.mainSettings.soundEffectsOn);
  const { focusedZone, currentFocusedElement } = useSelector((state) => state.focus);

  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const scroller = useRef(null);

  // ADDED: group cars by make
  const groupedCars = React.useMemo(() => {
    const grouped = {};
    cars.forEach((item) => {
      const mk = item.car.make;
      if (!grouped[mk]) grouped[mk] = [];
      grouped[mk].push(item);
    });
    return grouped;
  }, [cars]);

  useEffect(() => {
    // CHANGED: Compare cars[0]?.car?.id to focusedCar?.id
    if (cars[0]?.car?.id === focusedCar?.id) {
      dispatch(setIsTopCar(true));
    } else {
      dispatch(setIsTopCar(false));
    }
  }, [selectedCar, cars, focusedCar, dispatch]);

  useEffect(() => {
    if (focusedZone === FOCUS_ZONES.PAGE && !focusedCar && cars.length > 0) {
      setFocusedCar(cars[0].car);
      setSelectedCarIndex(0);
    } else if (focusedZone === FOCUS_ZONES.HEADER && focusedCar) {
      setFocusedCar(null);
    }
  }, [focusedZone, focusedCar, cars]);

  useEffect(() => {
    if (focusedCar) {
      const element = document.querySelector(`[data-car-id="${focusedCar.id}"]`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [focusedCar]);

  useEffect(() => {
    async function fetchUserCars() {
      try {
        setLoading(true);
        const userCars = await fetchUserCarsRequest(playerInfo.id);
        setCars(userCars);
      } catch (error) {
        console.error('Error fetching cars:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserCars();
  }, [playerInfo.id, loadingNewAuction]);

  useEffect(() => {
    dispatch(setFocusedZone(FOCUS_ZONES.PAGE));
    if (focusedZone !== FOCUS_ZONES.HEADER) {
      dispatch(setCurrentFocusedElement(TOP_CAR));
    }
  }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      if (carDetailsVisible || newAuctionvisible || focusedZone === FOCUS_ZONES.HEADER) return;

      const getItemsPerRow = () => {
        const windowWidth = window.innerWidth;
        if (windowWidth <= 512) return 1;
        if (windowWidth <= 768) return 2;
        if (windowWidth <= 900) return 2;
        if (windowWidth <= 1200) return 3;
        if (windowWidth <= 1600) return 4;
        return 5;
      };

      const itemsPerRow = getItemsPerRow();
      const totalItems = cars.length;
      const currentRow = Math.floor(selectedCarIndex / itemsPerRow);

      const scrollDistance = scroller.current ? scroller.current.scrollHeight * 0.04 : 0;

      switch (key) {
        case "ArrowRight": {
          if (selectedCarIndex < totalItems - 1) {
            setSelectedCarIndex(prev => prev + 1);
            setFocusedCar(cars[selectedCarIndex + 1].car);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          break;
        }
        case "ArrowLeft": {
          if (selectedCarIndex > 0) {
            setSelectedCarIndex(prev => prev - 1);
            setFocusedCar(cars[selectedCarIndex - 1].car);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
          break;
        }
        case "ArrowDown": {
          const nextRowIndex = selectedCarIndex + itemsPerRow;
          if (nextRowIndex < totalItems) {
            setSelectedCarIndex(nextRowIndex);
            setFocusedCar(cars[nextRowIndex].car);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            if (scroller.current) {
              scroller.current.scrollBy({
                top: scrollDistance,
                behavior: "smooth"
              });
            }
          }
          break;
        }
        case "ArrowUp": {
          if (selectedCarIndex === 0) {
            dispatch(setFocusedZone(FOCUS_ZONES.HEADER));
            dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU));
          } else {
            const prevRowIndex = selectedCarIndex - itemsPerRow;
            if (prevRowIndex >= 0) {
              setSelectedCarIndex(prevRowIndex);
              setFocusedCar(cars[prevRowIndex].car);
              if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
              if (scroller.current) {
                scroller.current.scrollBy({
                  top: -scrollDistance,
                  behavior: "smooth"
                });
              }
            }
          }
          break;
        }
        case "Enter": {
          setSelectedCar(cars[selectedCarIndex]?.car);
          if (soundEffectsOn || soundEffectsOnQuickSettings) playOpeningSound();
          showCarDetailsModal();
          break;
        }
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    cars,
    selectedCarIndex,
    carDetailsVisible,
    newAuctionvisible,
    soundEffectsOn,
    soundEffectsOnQuickSettings,
    focusedZone,
    dispatch
  ]);

  const createNewAuction = async () => {
    const auctionDurationSeconds = auctionDuration * 60 * 60;
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const endTime = currentTimeInSeconds + auctionDurationSeconds;
    const newAuction = {
      make: selectedCar.make,
      model: selectedCar.model,
      year: selectedCar.year,
      type: selectedCar.type,
      carId: selectedCar.id,
      endTime,
      status: 'Active',
      lastBidPlayer: '',
      player: playerInfo?.nickname,
      buy: selectedCar.price,
      minBid,
    };

    try {
      setLoadingNewAuction(true);
      const result = await client.graphql({
        query: mutations.createAuction,
        variables: { input: newAuction },
      });

      const createdAuctionId = result?.data?.createAuction?.id;
      if (createdAuctionId) {
        await createNewAuctionUser(playerInfo.id, createdAuctionId);
        const carToDelete = await getUserCar(playerInfo.id, selectedCar.id);
        if (carToDelete && carToDelete.id) {
          await deleteUserCar(carToDelete.id);
        } else {
          throw new Error("Car not found or invalid ID for deletion");
        }
        if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
        message.success('Auction created successfully!');
      } else {
        throw new Error('Failed to retrieve the ID of the created auction.');
      }
    } catch (error) {
      console.error('Error creating auction:', error);
    } finally {
      setLoadingNewAuction(false);
      setNewAuctionVisible(false);
      setSelectedCarIndex((prev) => (cars.length > prev ? prev - 1 : 0));
    }
  };

  const showCarDetailsModal = () => {
    setCarDetailsVisible(true);
  };

  const cancelNewAuction = () => {
    if (soundEffectsOn || soundEffectsOnQuickSettings) playClosingSound();
    setNewAuctionVisible(false);
  };

  const handleCarDetailsCancel = () => {
    if (soundEffectsOn || soundEffectsOnQuickSettings) playClosingSound();
    cancelNewAuction();
    setCarDetailsVisible(false);
  };

  const getImageSource = (make, model) => {
    const imageName = `${make} ${model}.png`;
    return require(`../../assets/images/cars/${imageName}`);
  };

  return (
    <div style={{ padding: '20px' }} ref={scroller}>
      {loading ? (
        <Spin size="large" fullscreen />
      ) : cars && cars.length ? (
        // CHANGED: Instead of cars.map, render groups by make
        Object.keys(groupedCars).map((make) => {
          const group = groupedCars[make];
          return (
            <div key={make}>
              <h2>{make}</h2>
              <div style={{ width: "100%", display: 'flex', flexDirection: 'row', flexWrap: "wrap" }}>
                {group.map((carItem) => {
                  // Find this car’s global index for focus logic
                  const realIndex = cars.findIndex(
                    (c) => c.car.id === carItem.car.id
                  );
                  return (
                    <CarCard
                      key={carItem.car.id}
                      focusedCar={focusedCar}
                      selectedCar={realIndex === selectedCarIndex ? carItem.car : null}
                      setSelectedCar={(car) => {
                        setSelectedCar(car);
                        setSelectedCarIndex(realIndex);
                        showCarDetailsModal();
                      }}
                      showCarDetailsModal={showCarDetailsModal}
                      car={carItem.car}
                      getImageSource={getImageSource}
                    />
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        <Typography.Title>You have no cars</Typography.Title>
      )}
      <CarDetailsModal
        visible={carDetailsVisible && selectedCar !== null}
        handleCancel={handleCarDetailsCancel}
        setSelectedCar={(car) => setSelectedCar(car)}
        selectedCar={selectedCar}
        loadingNewAuction={loadingNewAuction}
        forAuction
        showNewAuction={() => {
          handleCarDetailsCancel();
          if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          setNewAuctionVisible(true);
        }}
      />
      {newAuctionvisible && selectedCar && (
        <NewAuctionModal
          visible={newAuctionvisible}
          handleCancel={cancelNewAuction}
          handleOk={createNewAuction}
          form={form}
          minBid={minBid}
          setMinBid={setMinBid}
          buy={buy}
          setBuy={setBuy}
          auctionDuration={auctionDuration}
          setAuctionDuration={setAuctionDuration}
          userCars={cars}
          setSelectedCar={setSelectedCar}
          selectedCar={selectedCar}
        />
      )}
    </div>
  );
};

export default MyCars;