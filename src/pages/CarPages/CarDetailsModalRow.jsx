import React from 'react';
import { Spin } from 'antd';
import "./carsPage.css";

export default function CarDetailsModalRow({
  handler,
  text,
  selected,
  disabled,
  focused,
  title,
  loading,
  price,
  isOnline,
  characteristics,
  description,
  danger
}) {
  const getContent = () => {
    if (text) return text;
    if (loading) return <Spin />;
    if (characteristics) {
      return (
        <div className="characteristics-container">
          {characteristics.map((char, index) => (
            <div key={index} className="characteristic-item">
              <span className="characteristic-label">{char.label}:</span>
              <span className="characteristic-value">{char.value}</span>
            </div>
          ))}
        </div>
      );
    }
    if (description) return description;
    if (price) return `$${price}`;
    return title;
  };

  return (
    <div 
      className={`carDetailsModal__row 
        ${selected ? 'selected' : ''} 
        ${disabled ? 'disabled' : ''}
        ${focused ? 'focused' : ''}
        ${danger ? 'danger' : ''}`
      } 
      onClick={disabled ? undefined : handler} 
      tabIndex={disabled ? -1 : 0}
      style={{ 
        cursor: disabled ? 'not-allowed' : handler ? 'pointer' : 'default',
        color: danger ? '#ff4d4f' : 'inherit'
      }}
    >
      {getContent()}
    </div>
  );
}
