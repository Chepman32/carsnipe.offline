import React, { useState } from 'react';
import SlotCounter from 'react-slot-counter';
import { carImages } from '../../constants';
import './slotMachine.css';

const SlotMachine = () => {
  const [value, setValue] = useState(0);

  const spin = () => {
    const newValue = Math.floor(Math.random() * carImages.length);
    setValue(newValue);
  };

  return (
    <div className="slot-machine">
      <div className="slot-reel">
        <SlotCounter
          value={value}
          dummyCharacters={carImages.map((ci, i) => (
            <img key={i} src={ci.image} alt={`Slot item ${i}`} className="slot-item" />
          ))}
          duration={3.0}
          speed={10}
          direction="top-bottom"
          hasInfiniteList
          containerClassName="slot-container"
          charClassName="slot-char"
        />
      </div>
      <button className="spin-button" onClick={spin}>
        Spin
      </button>
    </div>
  );
};

export default SlotMachine;