import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import './ItemDisplay.css';

const ItemDisplay = ({ 
  item, 
  position, 
  highlightColor = null, 
  showPrice = false,
  onItemClick 
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'ITEM',
    item: { 
      id: item.id, 
      size: item.size,
      sourcePosition: position,
      sourceInventory: item.currentInventory 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [imgError, setImgError] = useState(false);

  const borderColor = highlightColor || '#ddd';
  const priceColor = highlightColor || '#333';

  const isUrlLike = typeof item.image === 'string' && /^(https?:\/\/|data:|\/|\.\/?)/.test(item.image);
  const showEmoji = false //!isUrlLike || imgError;

  return (
    <div
      ref={drag}
      className="item-display"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
        ...highlightColor ? {
          border: `3px solid ${borderColor}`,
        } : {
          border: 'none',
        },
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
      onClick={() => onItemClick && onItemClick(item)}
    >
      <div className="item-image" style={{ width: '100%', height: '100%', fontSize: '28px', lineHeight: 1 }}>
        {showEmoji ? (
          <span role="img" aria-label={item.name} style={{ userSelect: 'none' }}>
            {item.image}
          </span>
        ) : (
          <img 
            src={item.image} 
            alt={item.name}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}
      </div>
      
      {showPrice && (
        <div 
          className="item-price"
          style={{ color: priceColor }}
        >
          {item.price}
        </div>
      )}
      
      {item.count > 1 && (
        <div className="item-count">
          {item.count}
        </div>
      )}
    </div>
  );
};

export default ItemDisplay;
