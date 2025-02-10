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



const CarsStore = () => {
  const dispatch = useDispatch();
  const { money } = useSelector((state) => state.user);
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
  const [allTopRowCars, setAllTopRowCars] = useState([]);
  const [allBottomRowCars, setAllBottomRowCars] = useState([]);

  const soundEffectsOnQuickSettings = useSelector((state) => state.quickSettings.soundEffectsOn);
  const soundEffectsOn = useSelector((state) => state.mainSettings.soundEffectsOn);
  const { focusedZone } = useSelector((state) => state.focus);

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
    const indexInFirstMake = firstMakeCars.findIndex((car) => car.id === focusedCar.id);
    if (indexInFirstMake === 0) {
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
      // Update the car lists
      const topRowCars = [];
      const bottomRowCars = [];
      Object.entries(groupCarsByMake(cars)).forEach(([make, makeCars]) => {
        const sortedMakeCars = makeCars.sort((a, b) => {
          const nameA = `${a.make || ""} ${a.model || ""}`.trim();
          const nameB = `${b.make || ""} ${b.model || ""}`.trim();
          return nameA.localeCompare(nameB);
        });
        sortedMakeCars.forEach((car, index) => {
          if (index % 2 === 0) {
            topRowCars.push(car);
          } else {
            bottomRowCars.push(car);
          }
        });
      });
      setAllTopRowCars(topRowCars);
      setAllBottomRowCars(bottomRowCars);

      // Set initial focused car
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
    if (focusedZone === FOCUS_ZONES.HEADER) {
      setSelectedCarIndex(null);
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

  // Add horizontal scrolling with vertical wheel
  useEffect(() => {
    const carsContainer = document.querySelector('.cars');
    if (carsContainer) {
      const handleWheel = (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          carsContainer.scrollLeft += e.deltaY * 3; // Increased scroll speed by 3x
        }
      };
      carsContainer.addEventListener('wheel', handleWheel, { passive: false });
      
      // Cleanup
      return () => {
        carsContainer.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

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
      if (carDetailsVisible || focusedZone === FOCUS_ZONES.HEADER || focusedZone === FOCUS_ZONES.QUICK_MENU) return;
      
      const carsByMake = groupCarsByMake(cars);
      const makes = Object.keys(carsByMake);
      
      if (!focusedCar && cars.length > 0) {
        setSelectedCarIndex(0);
        setFocusedCar(cars[0]);
        return;
      }
    
      
      switch (key) {
        case "ArrowRight": {
          event.preventDefault();
          if (!focusedCar) return;
          
          const isInTopRow = allTopRowCars.includes(focusedCar);
          const currentArray = isInTopRow ? allTopRowCars : allBottomRowCars;
          const currentIndex = currentArray.indexOf(focusedCar);
          
          if (currentIndex < currentArray.length - 1) {
            const nextCar = currentArray[currentIndex + 1];
            setFocusedCar(nextCar);
            if (soundEffectsOn || soundEffectsOnQuickSettings) {
              playSwitchSound();
            }
          }
          break;
        }
        
        case "ArrowLeft": {
          event.preventDefault();
          if (!focusedCar) return;
          
          const isInTopRow = allTopRowCars.includes(focusedCar);
          const currentArray = isInTopRow ? allTopRowCars : allBottomRowCars;
          const currentIndex = currentArray.indexOf(focusedCar);
          
          if (currentIndex > 0) {
            const prevCar = currentArray[currentIndex - 1];
            setFocusedCar(prevCar);
            if (soundEffectsOn || soundEffectsOnQuickSettings) {
              playSwitchSound();
            }
          }
          break;
        }
        
        case "ArrowDown": {
          event.preventDefault();
          if (!focusedCar) return;
          
          const carsByMake = groupCarsByMake(cars);
          const currentMake = focusedCar.make?.trim().toUpperCase() || "UNKNOWN";
          const makeCars = carsByMake[currentMake] || [];
          
          // Sort make's cars and split into rows
          const sortedMakeCars = makeCars.sort((a, b) => 
            `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
          const makeTopRow = sortedMakeCars.filter((_, i) => i % 2 === 0);
          const makeBottomRow = sortedMakeCars.filter((_, i) => i % 2 === 1);

          // Find position in make's top row
          const topRowIndex = makeTopRow.findIndex(c => c.id === focusedCar.id);
          
          if (topRowIndex !== -1 && topRowIndex < makeBottomRow.length) {
            const nextCar = makeBottomRow[topRowIndex];
            setFocusedCar(nextCar);
            if (soundEffectsOn || soundEffectsOnQuickSettings) {
              playSwitchSound();
            }
          }
          break;
        }
        
        case "ArrowUp": {
          event.preventDefault();
          if (!focusedCar) return;
          
          const carsByMake = groupCarsByMake(cars);
          const currentMake = focusedCar.make?.trim().toUpperCase() || "UNKNOWN";
          const makeCars = carsByMake[currentMake] || [];
          
          const sortedMakeCars = makeCars.sort((a, b) => 
            `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
          const makeTopRow = sortedMakeCars.filter((_, i) => i % 2 === 0);
          const makeBottomRow = sortedMakeCars.filter((_, i) => i % 2 === 1);

          // Find position in make's bottom row
          const bottomRowIndex = makeBottomRow.findIndex(c => c.id === focusedCar.id);
          
          if (bottomRowIndex !== -1 && bottomRowIndex < makeTopRow.length) {
            const prevCar = makeTopRow[bottomRowIndex];
            setFocusedCar(prevCar);
            if (soundEffectsOn || soundEffectsOnQuickSettings) {
              playSwitchSound();
            }
          }
          break;
        }
        
        case "Enter": {
          if (focusedCar) {
            setSelectedCar(focusedCar);
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
    soundEffectsOnQuickSettings,
    focusedCar,
    allTopRowCars,
    allBottomRowCars,
    playSwitchSound,
    playOpeningSound
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
        <div className="cars__container">
          {(() => {
            // Lists are now managed by the useEffect
            
            return Object.entries(groupCarsByMake(cars)).map(([make, makeCars], makeIndex) => {
              const sortedMakeCars = makeCars.sort((a, b) => {
                const nameA = `${a.make || ""} ${a.model || ""}`.trim();
                const nameB = `${b.make || ""} ${b.model || ""}`.trim();
                return nameA.localeCompare(nameB);
              });
              // Split cars into two rows
              const topRowCars = [];
              const bottomRowCars = [];
              sortedMakeCars.forEach((car, index) => {
                if (index % 2 === 0) {
                  topRowCars.push(car);
                } else {
                  bottomRowCars.push(car);
                }
              });

              return (
                <div key={make} className="make-section" data-make-index={makeIndex}>
                  <h2 className="make-name" data-make={make}>{make}</h2>
                  <div className="make-grid">
                    <div className="make-row">
                      {topRowCars.map((car) => {
                        return (
                          <CarCard
                            key={car.id}
                            focusedCar={focusedCar}
                            selectedCar={cars.indexOf(car) === selectedCarIndex ? car : null}
                            setSelectedCar={(selectedCar) => {
                              setSelectedCar(selectedCar);
                              setSelectedCarIndex(cars.indexOf(car));
                              showCarDetailsModal();
                            }}
                            showCarDetailsModal={showCarDetailsModal}
                            car={car}
                            getImageSource={getImageSource}
                            showPrice={true}
                            setFocusedCar={setFocusedCar}
                            cars={cars}
                            setFocusPosition={() => { }}
                            column={allTopRowCars.indexOf(car)}
                            row={2}
                          />
                        );
                      })}
                    </div>
                    <div className="make-row">
                      {bottomRowCars.map((car) => {
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
                            setFocusedCar={setFocusedCar}
                            cars={cars}
                            setFocusPosition={() => { }}
                            column={allBottomRowCars.indexOf(car)}
                            row={3}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
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