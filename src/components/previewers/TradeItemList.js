import React from 'react';
import './TradeItemList.css';

const TradeItemList = ({ tradeItems, traderColor }) => {
  if (tradeItems.length === 0) {
    return null; // 不显示任何内容
  }

  return (
    <div className="trade-item-list">
      <div className="trade-items-container" style={{borderColor: traderColor}}>
        {tradeItems.map((item) => (
          <div 
            key={item.id} 
            className="trade-item-preview"
            style={{ borderColor: item.originalOwner?.color || traderColor }}
          >
            <img 
              src={item.image} 
              alt={item.name}
              title={`${item.name} - 价格: ${item.price}`}
            />
            {item.count > 1 && (
              <div className="trade-item-count">{item.count}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeItemList;
