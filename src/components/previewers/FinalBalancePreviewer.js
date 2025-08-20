import React from 'react';
import './TradeBalancePreviewer.css';

const FinalBalancePreviewer = ({ leftValue, rightValue, leftTrader, rightTrader }) => {
  const balance = leftValue - rightValue;
  let cashFlow = 0;
  let cashDirection = 'none';
  
  if (balance > 0) {
    // 左侧价值更高，需要向右侧支付现金
    cashFlow = Math.min(balance, rightTrader.cash);
    cashDirection = 'right';
  } else if (balance < 0) {
    // 右侧价值更高，需要向左侧支付现金
    cashFlow = Math.min(Math.abs(balance), leftTrader.cash);
    cashDirection = 'left';
  }

  const finalBalance = balance - (cashDirection === 'right' ? cashFlow : -cashFlow);
  
  let finalBalanceColor = '#077bcd'; // 默认淡蓝色
  // let finalBalanceColor = '#077bcd'; // 默认淡蓝色
  let finalBalanceText = '0';
  
  if (finalBalance > 0) {
    finalBalanceColor = leftTrader.color;
    finalBalanceText = `+${finalBalance}`;
  } else if (finalBalance < 0) {
    finalBalanceColor = rightTrader.color;
    finalBalanceText = `${finalBalance}`;
  }

  return (
    <div className="trade-balance-previewer">
      <div 
        className="trade-balance-amount"
        style={{ backgroundColor: finalBalanceColor }}
      >
        {finalBalanceText}
      </div>
    </div>
  );
};

export default FinalBalancePreviewer;
