import React from 'react';
import './TradeBalancePreviewer.css';

const TradeBalancePreviewer = ({ mod, leftValue, rightValue, leftTraderColor, rightTraderColor }) => {
  const balance = leftValue - rightValue + mod;
  let balanceColor = '#868e93'; // 默认淡蓝色
  let balanceText = '0';
  
  if (balance > 0) {
    balanceColor = leftTraderColor;
    balanceText = `+${balance}`;
  } else if (balance < 0) {
    balanceColor = rightTraderColor;
    balanceText = `${balance}`;
  }

  return (
    <div className="trade-balance-previewer">
      <div 
        className="balance-amount"
        style={{
          color: balanceColor,
          ...(balance === 0 ? {} : {transform: "translate(-10px, 0)"})
        }}
      >
        {balanceText}
      </div>
    </div>
  );
};

export default TradeBalancePreviewer;
