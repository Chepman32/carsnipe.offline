import React, { useState, useEffect, useRef, useCallback } from "react";
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

function getItemsPerRow() {
  const windowWidth = window.innerWidth;
  if (windowWidth <= 512) return 1;
  if (windowWidth <= 768) return 2;
  if (windowWidth <= 900) return 2;
  if (windowWidth <= 1200) return 3;
  if (windowWidth <= 1600) return 4;
  return 5;
}

const MyCars = ({ playerInfo }) => {
  const [loading, setLoading] = useState(false);
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
  const { focusedZone } = useSelector((state) => state.focus);
  const cars = useSelector((state) => state.user.cars); // Get cars from Redux state

  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const scroller = useRef(null);

  // Group cars by make, flatten for indexing
  const groupedCars = React.useMemo(() => {
    const grouped = {};
    cars.forEach((item) => {
      if (item && item.make) { 
        const mk = item.make;
        if (!grouped[mk]) grouped[mk] = [];
        grouped[mk].push(item);
      }
    });
    return grouped;
  }, [cars]);

  // Flatten them in a consistent, make-by-make array for indexing
  const flatCars = React.useMemo(() => {
    const makes = Object.keys(groupedCars).sort();
    let result = [];
    makes.forEach((mk) => {
      result = [...result, ...groupedCars[mk]];
    });
    return result;
  }, [groupedCars]);

  // Check if top car
  useEffect(() => {
    if (!focusedCar || flatCars.length === 0) {
      dispatch(setIsTopCar(false));
      return;
    }
    // Compare with first item in the flattened array
    if (flatCars[0].id === focusedCar.id) {
      dispatch(setIsTopCar(true));
    } else {
      dispatch(setIsTopCar(false));
    }
  }, [focusedCar, flatCars, dispatch]);

  useEffect(() => {
    if (focusedZone === FOCUS_ZONES.PAGE && !focusedCar && cars.length > 0) {
      setFocusedCar(flatCars[0]);
      setSelectedCarIndex(0);
    } else if (focusedZone === FOCUS_ZONES.HEADER && focusedCar) {
      setFocusedCar(null);
    }
  }, [focusedZone, focusedCar, cars, flatCars]);

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
    dispatch(setFocusedZone(FOCUS_ZONES.PAGE));
    if (focusedZone !== FOCUS_ZONES.HEADER) {
      dispatch(setCurrentFocusedElement(TOP_CAR));
    }
  }, [dispatch, focusedZone]);

  // Show details modal
  const showCarDetailsModal = useCallback(() => {
    setCarDetailsVisible(true);
  }, []);

  const handleKeyDown = useCallback((event) => {
    const { key } = event;
    if (carDetailsVisible || newAuctionvisible || focusedZone === FOCUS_ZONES.HEADER) return;

    const itemsPerRow = getItemsPerRow();
    if (!flatCars.length) return;

    // Identify current item
    const currentItem = flatCars[selectedCarIndex];
    if (!currentItem) return;

    // Group by make (already have groupedCars)
    const sortedMakes = Object.keys(groupedCars).sort();

    // Find which make the current item is in
    let currentMake = "";
    let currentMakeStartIndex = 0;
    let positionInMake = 0;

    for (const mk of sortedMakes) {
      const arr = groupedCars[mk];
      const startIndex = flatCars.indexOf(arr[0]);
      const endIndex = startIndex + arr.length - 1;
      if (selectedCarIndex >= startIndex && selectedCarIndex <= endIndex) {
        currentMake = mk;
        currentMakeStartIndex = startIndex;
        positionInMake = selectedCarIndex - startIndex;
        break;
      }
    }

    const currentMakeCars = groupedCars[currentMake] || [];
    const currentMakeLength = currentMakeCars.length;
    const currentMakeIndexInSorted = sortedMakes.indexOf(currentMake);

    const currentRow = Math.floor(positionInMake / itemsPerRow);
    const positionInRow = positionInMake % itemsPerRow;

    const scrollerElement = scroller.current;
    const scrollDistance = scrollerElement ? scrollerElement.scrollHeight * 0.04 : 0;

    switch (key) {
      case "ArrowRight": {
        // Move within the same make row if possible
        if (positionInRow < itemsPerRow - 1 && positionInMake < currentMakeLength - 1) {
          const newIndex = selectedCarIndex + 1;
          setSelectedCarIndex(newIndex);
          setFocusedCar(flatCars[newIndex]);
          if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
        }
        break;
      }
      case "ArrowLeft": {
        // Move within the same make row if possible
        if (positionInRow > 0) {
          const newIndex = selectedCarIndex - 1;
          setSelectedCarIndex(newIndex);
          setFocusedCar(flatCars[newIndex]);
          if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
        }
        break;
      }
      case "ArrowDown": {
        // Try moving down in the same make
        const nextRowStartIndex = currentMakeStartIndex + (currentRow + 1) * itemsPerRow;
        if (currentRow < Math.floor((currentMakeLength - 1) / itemsPerRow)) {
          // Move inside current make
          const nextIndex = Math.min(
            nextRowStartIndex + positionInRow,
            currentMakeStartIndex + currentMakeLength - 1
          );
          setSelectedCarIndex(nextIndex);
          setFocusedCar(flatCars[nextIndex]);
          if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
        } else {
          // Move to the next make if possible
          if (currentMakeIndexInSorted < sortedMakes.length - 1) {
            const nextMake = sortedMakes[currentMakeIndexInSorted + 1];
            const nextMakeStartIndex = flatCars.indexOf(groupedCars[nextMake][0]);
            setSelectedCarIndex(nextMakeStartIndex);
            setFocusedCar(flatCars[nextMakeStartIndex]);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
        }
        // Scroll
        if (scrollerElement) {
          scrollerElement.scrollBy({
            top: scrollDistance,
            behavior: "smooth"
          });
        }
        break;
      }
      case "ArrowUp": {
        // If we're in the top row of the top make, go to header
        const topMake = sortedMakes[0];
        // If in top row of top make
        if (
          currentMake === topMake &&
          currentRow === 0
        ) {
          // If user is at any item in that first row, go to header
          setFocusedCar(null);
          dispatch(setIsTopCar(false));
          dispatch(setFocusedZone(FOCUS_ZONES.HEADER));
          dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU));
          return;
        }
        // Otherwise, move up in the same make
        if (currentRow > 0) {
          const prevRowStartIndex = currentMakeStartIndex + (currentRow - 1) * itemsPerRow;
          const prevIndex = Math.min(
            prevRowStartIndex + positionInRow,
            currentMakeStartIndex + currentMakeLength - 1
          );
          setSelectedCarIndex(prevIndex);
          setFocusedCar(flatCars[prevIndex]);
          if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
        } else {
          // Move up to previous make
          if (currentMakeIndexInSorted > 0) {
            const prevMake = sortedMakes[currentMakeIndexInSorted - 1];
            const prevMakeCars = groupedCars[prevMake];
            const prevMakeStartIndex = flatCars.indexOf(prevMakeCars[0]);
            const lastRowIndex = Math.floor((prevMakeCars.length - 1) / itemsPerRow);
            const lastRowStartIndex = prevMakeStartIndex + lastRowIndex * itemsPerRow;
            const targetIndex = Math.min(
              lastRowStartIndex + positionInRow,
              prevMakeStartIndex + prevMakeCars.length - 1
            );
            setSelectedCarIndex(targetIndex);
            setFocusedCar(flatCars[targetIndex]);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
          }
        }
        // Scroll
        if (scrollerElement) {
          scrollerElement.scrollBy({
            top: -scrollDistance,
            behavior: "smooth"
          });
        }
        break;
      }
      case "Enter": {
        // Show details
        setSelectedCar(flatCars[selectedCarIndex]);
        if (soundEffectsOn || soundEffectsOnQuickSettings) playOpeningSound();
        showCarDetailsModal();
        break;
      }
      default:
        break;
    }
  }, [
    carDetailsVisible,
    newAuctionvisible,
    focusedZone,
    flatCars,
    groupedCars,
    selectedCarIndex,
    dispatch,
    soundEffectsOn,
    soundEffectsOnQuickSettings,
    showCarDetailsModal
  ]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const createNewAuction = async () => {
    if (!selectedCar) return;
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
      setSelectedCarIndex((prev) => (cars.length > 0 && prev > 0 ? prev - 1 : 0));
    }
  };

  const showCarDetailsModalExternal = () => {
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
        // Render grouped cars by make
        Object.keys(groupedCars).sort().map((make) => {
          const group = groupedCars[make];
          return (
            <div key={make}>
              <h2 className="make-name">{make}</h2>
              <div
                style={{
                  width: "100%",
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: "wrap"
                }}
              >
                {group.map((carItem) => {
                  // Find absolute index in flattened array
                  const realIndex = flatCars.findIndex(
                    (c) => c.id === carItem.id
                  );
                  return (
                    <CarCard
                      key={carItem.id}
                      focusedCar={focusedCar}
                      selectedCar={
                        realIndex === selectedCarIndex ? carItem : null
                      }
                      setSelectedCar={(car) => {
                        setSelectedCar(car);
                        setSelectedCarIndex(realIndex);
                        showCarDetailsModalExternal();
                      }}
                      showCarDetailsModal={showCarDetailsModalExternal}
                      car={carItem}
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