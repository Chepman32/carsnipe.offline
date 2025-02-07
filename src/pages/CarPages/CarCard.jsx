import { Flex } from 'antd'
import React from 'react'
import "./carsPage.css";
import { getCarTypeColor, playOpeningSound } from '../../functions';

export default function CarCard({ focusedCar, selectedCar, setSelectedCar, showCarDetailsModal, car, getImageSource, showPrice }) {
  return (
    <div
      onClick={() => {
        playOpeningSound()
        setSelectedCar(car);
        showCarDetailsModal();
      }}
      data-car-id={car.id}
      className={focusedCar?.id === car.id ? "carsPage__item carsPage__item_selected" : "carsPage__item"}
    >
      <div className="carsPage__header">
        <div className="carsPage__title">
          <h2 className="carsPage__make">{car.make}</h2>
          <div className="carsPage__subtitle">
            <span className="carsPage__model">{car.model}</span>
            <span className="carsPage__year">{car.year}</span>
          </div>
        </div>
        <div className={`carsPage__type ${car.type.toLowerCase()}`}>
          {car.type === 'COMMON' && 'B'}
          {car.type === 'RARE' && 'A'}
          {car.type === 'EPIC' && 'S'}
          {car.type === 'LEGENDARY' && 'S1'}
          <span className="carsPage__rating">{car.price}</span>
        </div>
      </div>
      <div className="carsPage__image-container">
        <img
          src={getImageSource(car.make, car.model)}
          alt={`${car.make} ${car.model}`}
          className='carsPage__item__image'
        />
      </div>
      {car.recommended && (
        <div className="carsPage__recommended">RECOMMENDED</div>
      )}
    </div>
  )
}
