import React from 'react';
import './TradeValuePreviewer.css';

const TradeValuePreviewer = ({ value, traderColor }) => {
  return (
    <div className="trade-value-previewer">
      <div 
        className="trade-value-amount"
        style={{ color: traderColor }}
      >
        {value}
      </div>
    </div>
  );
};

export default TradeValuePreviewer;
