import React from 'react';
import "./carsPage.css";

export default function CarDetailsModalRow({handler, text, selected, disabled}) {
  return (
    <div 
      className={`carDetailsModal__row ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`} 
      onClick={disabled ? undefined : handler} 
      tabIndex={disabled ? -1 : 0}
      style={{ cursor: disabled ? 'not-allowed' : handler ? 'pointer' : 'default' }}
    >
      {text}
    </div>
  );
}
