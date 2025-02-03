import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal, Form, Input, message, Select, Spin } from "antd";
import { generateClient } from "aws-amplify/api";
import { listCars as listCarsQuery } from "../../graphql/queries";
import * as mutations from "../../graphql/mutations";
import CarDetailsModal from "./CarDetailsModal";
import CarCard from "./CarCard";
import {
  createNewUserCar,
  checkAndUpdateAchievements,
  playSwitchSound,
  playOpeningSound,
  playClosingSound
} from "../../functions";
import { CreditWarningModal } from "../../components/CreditWarningModal/CreditWarningModal";
import { useDispatch, useSelector } from "react-redux";
import {
  FOCUS_ZONES,
  HEADER_MAIN_MENU,
  setCurrentFocusedElement,
  setFocusedZone,
  setIsTopCar,
  TOP_CAR
} from "../../redux/slices/focusSlice";
import { updateMoney, addBiddedAuction, updateStatistics, addCar } from "../../redux/slices/userSlice";
import { cars as mockCars } from '../../redux/mockCarsData';
import "./carsPage.css";

const { Option } = Select;
const client = generateClient();

function getItemsPerRow() {
  const windowWidth = window.innerWidth;
  let itemWidth;
  if (windowWidth <= 512) {
    itemWidth = windowWidth * 0.95;
  } else if (windowWidth <= 768) {
    itemWidth = windowWidth * 0.48;
  } else if (windowWidth <= 900) {
    itemWidth = windowWidth * 0.48;
  } else if (windowWidth <= 1200) {
    itemWidth = windowWidth * 0.31;
  } else if (windowWidth <= 1600) {
    itemWidth = windowWidth * 0.23;
  } else {
    itemWidth = windowWidth * 0.19;
  }
  const itemsPerRow = Math.floor((windowWidth - 40) / (itemWidth + 10));
  return Math.max(1, itemsPerRow);
}

const CarsStore = () => {
  const dispatch = useDispatch();
  const { money, biddedAuctions } = useSelector((state) => state.user);
  const [cars, setCars] = useState(mockCars);
  const [visible, setVisible] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [focusedCar, setFocusedCar] = useState(null);
  const [form] = Form.useForm();
  const [carDetailsVisible, setCarDetailsVisible] = useState(false);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const [creditWarningModalvisible, setCreditWarningModalvisible] = useState(false);
  const [carsLoading, setCarsLoading] = useState(false);

  const soundEffectsOnQuickSettings = useSelector((state) => state.quickSettings.soundEffectsOn);
  const soundEffectsOn = useSelector((state) => state.mainSettings.soundEffectsOn);
  const { focusedZone, currentFocusedElement } = useSelector((state) => state.focus);

  useEffect(() => {
    if (!focusedCar || cars.length === 0) {
      dispatch(setIsTopCar(false));
      return;
    }
    const carsByMake = groupCarsByMake(cars);
    const sortedMakes = Object.keys(carsByMake).sort();
    if (sortedMakes.length === 0) {
      dispatch(setIsTopCar(false));
      return;
    }
    const firstMake = sortedMakes[0];
    const firstMakeCars = carsByMake[firstMake];
    if (!firstMakeCars || firstMakeCars.length === 0) {
      dispatch(setIsTopCar(false));
      return;
    }
    const itemsPerRow = getItemsPerRow();
    const indexInFirstMake = firstMakeCars.findIndex((car) => car.id === focusedCar.id);
    if (indexInFirstMake >= 0 && indexInFirstMake < itemsPerRow) {
      dispatch(setIsTopCar(true));
    } else {
      dispatch(setIsTopCar(false));
    }
  }, [cars, focusedCar, dispatch]);

  useEffect(() => {
    dispatch(setFocusedZone(FOCUS_ZONES.PAGE));
    if (focusedZone !== FOCUS_ZONES.HEADER) {
      dispatch(setCurrentFocusedElement(TOP_CAR));
    }
  }, [dispatch]);

  useEffect(() => {
    if (cars.length > 0) {
      const carsByMake = groupCarsByMake(cars);
      const firstMake = Object.keys(carsByMake)[0];
      if (firstMake) {
        const firstCar = carsByMake[firstMake][0];
        const firstCarIndex = cars.indexOf(firstCar);
        setSelectedCarIndex(firstCarIndex);
        setFocusedCar(firstCar);
      }
    }
  }, [cars]);

  useEffect(() => {
    if (focusedZone === FOCUS_ZONES.PAGE && !focusedCar && cars.length > 0) {
      const carsByMake = groupCarsByMake(cars);
      const firstMake = Object.keys(carsByMake)[0];
      if (firstMake) {
        const firstCar = carsByMake[firstMake][0];
        const firstCarIndex = cars.indexOf(firstCar);
        setSelectedCarIndex(firstCarIndex);
        setFocusedCar(firstCar);
      }
    } else if (focusedZone === FOCUS_ZONES.HEADER && focusedCar) {
      setFocusedCar(null);
    }
  }, [focusedZone, focusedCar, cars]);

  useEffect(() => {
    if (focusedCar) {
      const element = document.querySelector(`[data-car-id="${focusedCar.id}"]`);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      }
    }
  }, [focusedCar]);

  const showCarDetailsModal = useCallback(() => {
    setCarDetailsVisible(true);
  }, []);

  const fetchCars = useCallback(async () => {
    try {
      const carData = await client.graphql({ query: listCarsQuery });
      const cars = carData.data.listCars.items;
      const sortedCars = cars.sort((a, b) => {
        const nameA = `${a.make || ""} ${a.model || ""}`.trim();
        const nameB = `${b.make || ""} ${b.model || ""}`.trim();
        return nameA.localeCompare(nameB);
      });
      setCars(sortedCars);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setCarsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchAllCars() {
      await fetchCars();
    }
    fetchAllCars();
  }, [fetchCars]);

  const groupCarsByMake = (cars) => {
    const groups = cars.reduce((groups, car) => {
      const make = car.make ? car.make.trim().toUpperCase() : "UNKNOWN";
      if (!groups[make]) {
        groups[make] = [];
      }
      groups[make].push(car);
      return groups;
    }, {});

    // Convert to array of [make, cars] pairs, sort by make, and convert back to object
    return Object.fromEntries(
      Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
    );
  };

  useEffect(() => {
    if (focusedZone === FOCUS_ZONES.HEADER) {
      setSelectedCarIndex(null);
    }
    if (focusedZone === FOCUS_ZONES.PAGE) {
      setSelectedCarIndex(0);
    }
    if (cars.indexOf(selectedCar) === 0) {
      dispatch(setCurrentFocusedElement(TOP_CAR));
    }
  }, [focusedZone, cars, selectedCar, dispatch]);

  useEffect(() => {
    if (cars.indexOf(focusedCar) === 0) {
      dispatch(setCurrentFocusedElement(TOP_CAR));
    }
  }, [selectedCar, dispatch, cars, focusedCar]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      if (carDetailsVisible || focusedZone === FOCUS_ZONES.HEADER) return;
      
      const itemsPerRowLocal = getItemsPerRow();
      const carsByMake = groupCarsByMake(cars);
      const makes = Object.keys(carsByMake);
      
      if (!selectedCarIndex && selectedCarIndex !== 0) {
        setSelectedCarIndex(0);
        setFocusedCar(cars[0]);
        return;
      }

      // Find current make and position
      const currentMake = makes.find((make) => {
        const makeStartIndex = cars.indexOf(carsByMake[make][0]);
        const makeEndIndex = makeStartIndex + carsByMake[make].length - 1;
        return selectedCarIndex >= makeStartIndex && selectedCarIndex <= makeEndIndex;
      });

      if (!currentMake) return;

      const currentMakeCars = carsByMake[currentMake];
      const currentMakeStartIndex = cars.indexOf(currentMakeCars[0]);
      const currentMakeEndIndex = currentMakeStartIndex + currentMakeCars.length - 1;
      const positionInMake = selectedCarIndex - currentMakeStartIndex;
      const currentRow = Math.floor(positionInMake / itemsPerRowLocal);
      const positionInRow = positionInMake % itemsPerRowLocal;
      const scroller = document.getElementById("scroller");
      const scrollDistance = scroller ? scroller.scrollHeight * 0.04 : 0;

      if (focusedZone !== FOCUS_ZONES.QUICK_MENU) {
        switch (key) {
          case "ArrowRight": {
            // Only move right if there's another car in the same make
            if (selectedCarIndex < currentMakeEndIndex) {
              const nextIndex = selectedCarIndex + 1;
              setSelectedCarIndex(nextIndex);
              setFocusedCar(cars[nextIndex]);
              if (soundEffectsOn || soundEffectsOnQuickSettings) {
                playSwitchSound();
              }
            }
            break;
          }
          case "ArrowLeft": {
            // Only move left if we're not at the start of the make
            if (selectedCarIndex > currentMakeStartIndex) {
              const prevIndex = selectedCarIndex - 1;
              setSelectedCarIndex(prevIndex);
              setFocusedCar(cars[prevIndex]);
              if (soundEffectsOn || soundEffectsOnQuickSettings) {
                playSwitchSound();
              }
            }
            break;
          }
          case "ArrowDown": {
            const nextRowStartIndex = currentMakeStartIndex + (currentRow + 1) * itemsPerRowLocal;
            
            // If next row exists in current make
            if (nextRowStartIndex <= currentMakeEndIndex) {
              const nextIndex = Math.min(nextRowStartIndex, currentMakeEndIndex);
              setSelectedCarIndex(nextIndex);
              setFocusedCar(cars[nextIndex]);
            } else {
              // Move to next make if it exists
              const currentMakeIndex = makes.indexOf(currentMake);
              if (currentMakeIndex < makes.length - 1) {
                const nextMake = makes[currentMakeIndex + 1];
                const nextMakeStartIndex = cars.indexOf(carsByMake[nextMake][0]);
                setSelectedCarIndex(nextMakeStartIndex);
                setFocusedCar(cars[nextMakeStartIndex]);
              }
            }
            
            if (soundEffectsOn || soundEffectsOnQuickSettings) {
              playSwitchSound();
            }
            if (scroller) {
              scroller.scrollBy({
                top: scrollDistance,
                behavior: "smooth"
              });
            }
            break;
          }
          case "ArrowUp": {
            // If in first row of first make, go to header
            if (currentMake === makes[0] && currentRow === 0) {
              dispatch(setFocusedZone(FOCUS_ZONES.HEADER));
              dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU));
              return;
            }

            const prevRowStartIndex = currentMakeStartIndex + (currentRow - 1) * itemsPerRowLocal;
            
            // If previous row exists in current make
            if (currentRow > 0) {
              setSelectedCarIndex(prevRowStartIndex);
              setFocusedCar(cars[prevRowStartIndex]);
            } else {
              // Move to previous make if it exists
              const currentMakeIndex = makes.indexOf(currentMake);
              if (currentMakeIndex > 0) {
                const prevMake = makes[currentMakeIndex - 1];
                const prevMakeCars = carsByMake[prevMake];
                const prevMakeStartIndex = cars.indexOf(prevMakeCars[0]);
                const lastRowIndex = Math.floor((prevMakeCars.length - 1) / itemsPerRowLocal);
                const targetIndex = prevMakeStartIndex + lastRowIndex * itemsPerRowLocal;
                setSelectedCarIndex(targetIndex);
                setFocusedCar(cars[targetIndex]);
              }
            }
            
            if (soundEffectsOn || soundEffectsOnQuickSettings) {
              playSwitchSound();
            }
            if (scroller) {
              scroller.scrollBy({
                top: -scrollDistance,
                behavior: "smooth"
              });
            }
            break;
          }
          case "Enter": {
            if (selectedCarIndex !== null) {
              setSelectedCar(cars[selectedCarIndex]);
              showCarDetailsModal();
              if (soundEffectsOn || soundEffectsOnQuickSettings) {
                playOpeningSound();
              }
            }
            break;
          }
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    carDetailsVisible,
    cars,
    dispatch,
    focusedZone,
    selectedCarIndex,
    showCarDetailsModal,
    soundEffectsOn,
    soundEffectsOnQuickSettings
  ]);

  const buyCar = async (car) => {
    if (loadingBuy) return;
    setLoadingBuy(true);

    try {
      if (money < car.price) {
        message.error("Not enough money!");
        setCreditWarningModalvisible(true);
        return;
      }

      // Update user's money in Redux
      const newMoney = money - car.price;
      dispatch(updateMoney(newMoney));

      // Update statistics
      dispatch(updateStatistics({
        moneySpent: car.price
      }));

      // Add car to user's cars in Redux
      dispatch(addCar({
        ...car,
        purchaseDate: new Date().toISOString(),
      }));

      // Close the modal
      setCarDetailsVisible(false);
      setSelectedCar(null);

      message.success("Car purchased successfully!");

      // Play sound effect if enabled
      if (soundEffectsOn && soundEffectsOnQuickSettings) {
        playOpeningSound();
      }
    } catch (error) {
      console.error("Error buying car:", error);
      message.error("Failed to purchase car");
    } finally {
      setLoadingBuy(false);
    }
  };

  const handleCancel = () => {
    if (soundEffectsOn || soundEffectsOnQuickSettings) {
      playClosingSound();
    }
    setVisible(false);
  };

  const handleCarDetailsCancel = () => {
    if (soundEffectsOn) {
      playClosingSound();
    }
    setCarDetailsVisible(false);
  };

  const createNewCar = async (values) => {
    const newCar = {
      make: values.make,
      model: values.model,
      year: parseInt(values.year),
      price: parseInt(values.price),
      type: values.type
    };
    await client.graphql({
      query: mutations.createCar,
      variables: { input: newCar }
    });
    await fetchCars();
    setVisible(false);
    form.resetFields();
    message.success("Car created successfully!");
  };

  const getImageSource = (make, model) => {
    const imageName = `${make} ${model}.png`;
    return require(`../../assets/images/cars/${imageName}`);
  };

  return (
    <div className="cars">
      {carsLoading ? (
        <Spin size="large" />
      ) : (
        <div className="cars__container" id="scroller">
          {Object.entries(groupCarsByMake(cars)).map(([make, makeCars]) => {
            const sortedMakeCars = makeCars.sort((a, b) => {
              const nameA = `${a.make || ""} ${a.model || ""}`.trim();
              const nameB = `${b.make || ""} ${b.model || ""}`.trim();
              return nameA.localeCompare(nameB);
            });
            return (
              <div key={make} className="make-section">
                <h2 className="make-name">{make}</h2>
                <section className="make-section-container">
                  <div className="make-cars">
                    {sortedMakeCars.map((car) => {
                      const absoluteIndex = cars.indexOf(car);
                      return (
                        <CarCard
                          key={car.id}
                          focusedCar={focusedCar}
                          selectedCar={absoluteIndex === selectedCarIndex ? car : null}
                          setSelectedCar={(selectedCar) => {
                            setSelectedCar(selectedCar);
                            setSelectedCarIndex(absoluteIndex);
                            showCarDetailsModal();
                          }}
                          showCarDetailsModal={showCarDetailsModal}
                          car={car}
                          getImageSource={getImageSource}
                          showPrice={true}
                        />
                      );
                    })}
                  </div>
                </section>
              </div>
            );
          })}
        </div>
      )}
      <Modal
        visible={visible}
        title="Create a New Car"
        okText="Create"
        cancelText="Cancel"
        onCancel={handleCancel}
        onOk={() => {
          form.validateFields().then((values) => {
            createNewCar(values);
          });
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={(values) => createNewCar(values)}
        >
          <Form.Item
            name="make"
            label="Make"
            rules={[{ required: true, message: "Please enter the make!" }]}
          >
            <Input autoFocus />
          </Form.Item>
          <Form.Item
            name="model"
            label="Model"
            rules={[{ required: true, message: "Please enter the model!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="year"
            label="Year"
            rules={[{ required: true, message: "Please enter the year!" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: "Please enter the price!" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: "Please select the type!" }]}
          >
            <Select>
              <Option value="regular">Regular</Option>
              <Option value="epic">Epic</Option>
              <Option value="legendary">Legendary</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <CarDetailsModal
        visible={carDetailsVisible && selectedCar !== null}
        handleCancel={handleCarDetailsCancel}
        selectedCar={selectedCar}
        buyCar={buyCar}
        loadingBuy={loadingBuy}
      />
      <CreditWarningModal
        isModalVisible={creditWarningModalvisible}
        setIsModalVisible={setCreditWarningModalvisible}
      />
    </div>
  );
};

export default CarsStore;