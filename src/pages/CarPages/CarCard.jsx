import { Flex } from 'antd'
import React from 'react'
import "./carsPage.css";
import { getCarTypeColor, playOpeningSound } from '../../functions';
import { useDispatch } from 'react-redux';
import { FOCUS_ZONES, setCurrentFocusedElement, setFocusedZone } from '../../redux/slices/focusSlice';

export default function CarCard({ focusedCar, selectedCar, setSelectedCar, showCarDetailsModal, car, getImageSource, showPrice, cars, setFocusPosition, setFocusedCar, column, row }) {
  const dispatch = useDispatch();

  const handleClick = () => {
    console.log("row:", row)
    console.log("column:", column)
    playOpeningSound();
    setSelectedCar(car);
    setFocusedCar(car);
    showCarDetailsModal();
    dispatch(setFocusedZone(FOCUS_ZONES.PAGE));
    setFocusPosition({ row, column });
  };

  return (
    <div
      onClick={handleClick}
      data-car-id={car.id}
      className={focusedCar?.id === car.id ? "carsPage__item carsPage__item_selected" : "carsPage__item"}
    >
      <div className="carsPage__header">
        <div className="carsPage__title">
          <div className="carsPage__subtitle">
            <span className="carsPage__model">{car.model}</span>
            <span className="carsPage__year">{car.year}</span>
          </div>
        </div>
      </div>
      <div className="carsPage__image-container">
        <img
          src={getImageSource(car.make, car.model)}
          alt={`${car.make} ${car.model}`}
          className='carsPage__item__image'
        />
      </div>
      <div className={`carsPage__type ${car.type.toLowerCase()}`}>
          {car.type === 'COMMON' && 'B'}
          {car.type === 'RARE' && 'A'}
          {car.type === 'EPIC' && 'S'}
          {car.type === 'LEGENDARY' && 'S1'}
          <span className="carsPage__rating">{car.type}</span>
        </div>
    </div>
  )
}
