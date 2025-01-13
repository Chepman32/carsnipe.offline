import { Flex } from 'antd'
import React from 'react'
import "./carsPage.css";
import { getCarTypeColor, playOpeningSound } from '../../functions';

export default function CarCard({ focusedCar, selectedCar, setSelectedCar, showCarDetailsModal, car, getImageSource, showPrice }) {
  return (
    <div
      onClick={() => {
        playOpeningSound()
        setSelectedCar(car); // Set the selected car
        showCarDetailsModal();
    }}
      data-car-id={car.id}
    className={focusedCar?.id === car.id ? "carsPage__item carsPage__item_selected" : "carsPage__item"}>

            <Flex style={{ textAlign: 'center' }} align="center">
              <h3 className="carsPage__model">{car.model} &nbsp;</h3>
              <h3 className="carsPage__year">{car.year}</h3>
            </Flex>
            <p className="carsPage__make">{car.make}</p>
            <img
              src={getImageSource(car.make, car.model)}
              alt={`${car.make} ${car.model}`}
        className='carsPage__item__image'
            />
      {
        showPrice && <p className="carCard__price" >{car.price}</p>
            }
            <div className="carsPage__type" style={{background: getCarTypeColor(car.type)}} >
                <p>{car.type.toUpperCase()}</p>
              </div>
          </div>
  )
}
