import React, { useEffect, useState } from "react";
import { Modal, Spin, Tooltip } from "antd";
import "./carsPage.css";
import CarDetailsModalRow from "./CarDetailsModalRow";
import { getImageSource, playSwitchSound } from "../../functions";
import { isMobile } from "react-device-detect";
import { useDispatch } from "react-redux";
import { removeCar } from "../../redux/slices/userSlice";

const CarDetailsModal = ({
  visible,
  handleCancel,
  selectedCar,
  buyCar,
  loadingNewAuction,
  loadingBuy,
  forAuction,
  showNewAuction,
}) => {
  const totalRows = 5
  const [focusedRow, setFocusedRow] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const displatch = useDispatch()

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;

      if (visible) {
        if (key === "ArrowUp") {
          playSwitchSound()
          setFocusedRow((prevRow) => (prevRow === 0 ? totalRows - 1 : prevRow - 1)); // Adjust the logic for ArrowUp key
        } else if (key === "ArrowDown") {
          playSwitchSound()
          setFocusedRow((prevRow) => (prevRow === totalRows - 1 ? 0 : prevRow + 1)); // Adjust the logic for ArrowDown key
        } else if (key === "Enter") {
          switch (focusedRow) {
            case 0:
              if (forAuction) {
                showNewAuction();
              }
              if (!forAuction) {
                buyCar(selectedCar);
              }
              break;
            case 1:
              break;
            case 2:
              // Row 2 functionality goes here
              break;
            case 3:
              // Row 3 functionality goes here
              break;
            case 4:
              handleCancel();
              displatch(removeCar(selectedCar.id))
              break;
            default:
              break;
          }
        }
      } else {
        // Reset focusedRow when the modal is closed
        setFocusedRow(0);
      }
    };
  
    document.addEventListener("keydown", handleKeyDown);
  
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, focusedRow, selectedCar, buyCar, showNewAuction, forAuction, totalRows]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Modal
      centered
      className="carDetailsModal"
      width={isMobile ? window.innerWidth * 0.8 : window.innerWidth * 0.5}
      open={visible}
      title={visible && selectedCar ? <h3 style={{ textAlign: "center", fontWeight: "700" }}>{selectedCar?.make} {selectedCar?.model}</h3> : "Car Details"}
      onCancel={handleCancel}
      footer={null}
    >
      {
        forAuction && selectedCar && <img
        src={getImageSource(selectedCar.make, selectedCar.model)}
        alt={`${selectedCar.make} ${selectedCar.model}`}
  className='carsPage__modal__image'
      />
      }
      {!forAuction && visible && selectedCar && (
        <>
          <CarDetailsModalRow
            focused={focusedRow === 0}
            title="Buy car"
            handler={() => buyCar(selectedCar)}
            text={loadingBuy ? <Spin /> : "Buy"}
            loading={loadingBuy}
            price={selectedCar.price}
            isOnline={isOnline}
          />
        </>
      )}
      {forAuction && (
        <Tooltip title={!isOnline ? "This feature requires internet connection" : ""}>
          <div style={{ opacity: !isOnline ? 0.5 : 1 }}>
            <CarDetailsModalRow
              handler={isOnline ? showNewAuction : undefined}
              text={loadingNewAuction ? <Spin /> : "Sell on auction"}
              selected={focusedRow === 0}
              disabled={!isOnline}
            />
          </div>
        </Tooltip>
      )}
      <CarDetailsModalRow text="Show car info" selected={focusedRow === 1} />
      <CarDetailsModalRow text="Choose color" selected={focusedRow === 2} />
      <CarDetailsModalRow text="Buy as a gift" selected={focusedRow === 3} />
      {
        forAuction && (
          <CarDetailsModalRow text="Remove the car from garage" selected={focusedRow === 4} />
        )
      }
    </Modal>
  );
};

export default CarDetailsModal;
