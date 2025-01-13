// CarsStore.js

import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal, Form, Input, message, Select, Spin } from "antd";
import { generateClient } from "aws-amplify/api";
import { listCars as listCarsQuery } from "../../graphql/queries";
import * as mutations from "../../graphql/mutations";
import "./carsPage.css";
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

const { Option } = Select;
const client = generateClient();

const CarsStore = ({ playerInfo, setMoney, money }) => {
  const [cars, setCars] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [focusedCar, setFocusedCar] = useState(null);
  const [form] = Form.useForm();
  const [carDetailsVisible, setCarDetailsVisible] = useState(false);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  const [creditWarningModalvisible, setCreditWarningModalvisible] = useState(false);
  const [carsLoading, setCarsLoading] = useState(true);

  const soundEffectsOnQuickSettings = useSelector((state) => state.quickSettings.soundEffectsOn);
  const soundEffectsOn = useSelector((state) => state.mainSettings.soundEffectsOn);
  const { focusedZone, currentFocusedElement } = useSelector((state) => state.focus);

  const dispatch = useDispatch();

  useEffect(() => {
    // Mark isTopCar true if our currently "focused" car is index 0 in the entire array
    if (cars[0]?.id === focusedCar?.id) {
      dispatch(setIsTopCar(true));
    } else {
      dispatch(setIsTopCar(false));
    }
  }, [selectedCar, cars, focusedCar, dispatch]);

  useEffect(() => {
    if (focusedZone === FOCUS_ZONES.PAGE && !focusedCar) {
      setFocusedCar(cars[0]);
      setSelectedCarIndex(0);
    }
    else if(focusedZone === FOCUS_ZONES.HEADER && focusedCar) {
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
    return cars.reduce((groups, car) => {
      const make = car.make ? car.make.trim().toUpperCase() : "UNKNOWN";
      if (!groups[make]) {
        groups[make] = [];
      }
      groups[make].push(car);
      return groups;
    }, {});
  };

  useEffect(() => {
    dispatch(setFocusedZone(FOCUS_ZONES.PAGE));
    if (focusedZone !== FOCUS_ZONES.HEADER) {
      dispatch(setCurrentFocusedElement(TOP_CAR));
    }
  }, [dispatch]);

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

      const getItemsPerRow = () => {
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
      };

      const itemsPerRow = getItemsPerRow();
      const carsByMake = groupCarsByMake(cars);
      const makes = Object.keys(carsByMake);

      const currentMake = makes.find((make) => {
        const makeStartIndex = cars.indexOf(carsByMake[make][0]);
        const makeEndIndex = makeStartIndex + carsByMake[make].length - 1;
        return selectedCarIndex >= makeStartIndex && selectedCarIndex <= makeEndIndex;
      });

      const currentMakeCars = carsByMake[currentMake] || [];
      const currentMakeStartIndex = cars.indexOf(currentMakeCars[0]);
      const positionInMake = selectedCarIndex - currentMakeStartIndex;
      const currentRow = Math.floor(positionInMake / itemsPerRow);
      const positionInRow = positionInMake % itemsPerRow;

      const scroller = document.getElementById("scroller");
      const scrollDistance = scroller ? scroller.scrollHeight * 0.04 : 0;
      if (focusedZone !== FOCUS_ZONES.QUICK_MENU) {
        switch (key) {
          case "ArrowRight": {
            if (positionInRow < itemsPerRow - 1 && positionInMake < currentMakeCars.length - 1) {
              setSelectedCarIndex((prevIndex) => prevIndex + 1);
              setFocusedCar(cars[selectedCarIndex + 1]);
              if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            }
            break;
          }
          case "ArrowLeft": {
            if (positionInRow > 0) {
              setSelectedCarIndex((prevIndex) => prevIndex - 1);
              setFocusedCar(cars[selectedCarIndex - 1]);
              if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            }
            break;
          }
          case "ArrowDown": {
            if (focusedZone === FOCUS_ZONES.HEADER) {
              break;
            }
            dispatch(setFocusedZone(FOCUS_ZONES.PAGE));
            const nextRowStartIndex = currentMakeStartIndex + (currentRow + 1) * itemsPerRow;
            if (currentRow < Math.floor((currentMakeCars.length - 1) / itemsPerRow)) {
              const nextIndex = Math.min(
                nextRowStartIndex + positionInRow,
                currentMakeStartIndex + currentMakeCars.length - 1
              );
              setSelectedCarIndex(nextIndex);
              setFocusedCar(cars[nextIndex]);
              if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
            } else {
              const currentMakeIndex = makes.indexOf(currentMake);
              if (currentMakeIndex < makes.length - 1) {
                const nextMake = makes[currentMakeIndex + 1];
                const nextMakeStartIndex = cars.indexOf(carsByMake[nextMake][0]);
                setSelectedCarIndex(nextMakeStartIndex);
                setFocusedCar(cars[nextMakeStartIndex]);
                if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
              }
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
            // Only jump to header if we're at index 0 in the global list
            // Otherwise, move up a row (or to the previous make if needed)
            if (selectedCarIndex === 0) {
              dispatch(setFocusedZone(FOCUS_ZONES.HEADER));
              dispatch(setCurrentFocusedElement(HEADER_MAIN_MENU));
            } else {
              const prevRowStartIndex = currentMakeStartIndex + (currentRow - 1) * itemsPerRow;
              if (currentRow > 0) {
                const prevIndex = Math.min(
                  prevRowStartIndex + positionInRow,
                  currentMakeStartIndex + currentMakeCars.length - 1
                );
                setSelectedCarIndex(prevIndex);
                setFocusedCar(cars[prevIndex]);
                if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
              } else {
                const currentMakeIndex = makes.indexOf(currentMake);
                if (currentMakeIndex > 0) {
                  const prevMake = makes[currentMakeIndex - 1];
                  const prevMakeCars = carsByMake[prevMake];
                  const prevMakeStartIndex = cars.indexOf(prevMakeCars[0]);
                  const lastRowIndex = Math.floor((prevMakeCars.length - 1) / itemsPerRow);
                  const lastRowStartIndex = prevMakeStartIndex + lastRowIndex * itemsPerRow;
                  const targetIndex = Math.min(
                    lastRowStartIndex + positionInRow,
                    prevMakeStartIndex + prevMakeCars.length - 1
                  );
                  setSelectedCarIndex(targetIndex);
                  setFocusedCar(cars[targetIndex]);
                  if (soundEffectsOn || soundEffectsOnQuickSettings) playSwitchSound();
                }
              }
              if (scroller) {
                scroller.scrollBy({
                  top: -scrollDistance,
                  behavior: "smooth"
                });
              }
            }
            break;
          }
          case "Enter": {
            setSelectedCar(cars[selectedCarIndex]);
            if (soundEffectsOn || soundEffectsOnQuickSettings) playOpeningSound();
            showCarDetailsModal();
            break;
          }
          default:
            break;
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    cars,
    selectedCarIndex,
    carDetailsVisible,
    showCarDetailsModal,
    soundEffectsOn,
    soundEffectsOnQuickSettings,
    focusedZone,
    dispatch,
    selectedCar,
    focusedCar
  ]);

  const buyCar = async (car) => {
    if (playerInfo && playerInfo.id && money >= car.price) {
      if (soundEffectsOn) playSwitchSound();
      setMoney((prevMoney) => prevMoney - car.price);
      try {
        setLoadingBuy(true);
        await client.graphql({
          query: mutations.updateUser,
          variables: {
            input: {
              id: playerInfo.id,
              money: money - car.price,
              totalSpent: (playerInfo.totalSpent || 0) + car.price
            }
          }
        });
        createNewUserCar(playerInfo.id, car.id);
        message.success("Car successfully bought!");
      } catch (err) {
        console.log(err);
        message.error("Error buying car");
      } finally {
        setLoadingBuy(false);
        setSelectedCar(null);
      }
    } else if (playerInfo && money < car.price) {
      setCreditWarningModalvisible(true);
      handleCarDetailsCancel();
      return;
    }
    await checkAndUpdateAchievements(playerInfo);
  };

  const handleCancel = () => {
    if (soundEffectsOn || soundEffectsOnQuickSettings) playClosingSound();
    setVisible(false);
  };

  const handleCarDetailsCancel = () => {
    if (soundEffectsOn) playClosingSound();
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
        <Spin size="large" fullscreen />
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