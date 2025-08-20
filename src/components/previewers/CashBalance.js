import React from 'react';
import './CashBalance.css';

const CashBalance = ({ setCashflow, leftValue, rightValue, leftTrader, rightTrader }) => {
  const balance = leftValue - rightValue;
  let cashFlow = 0;
  let cashDirection = 'none';
  let cashAmount = 0;
  
  if (balance > 0) {
    // 左侧价值更高，需要向右侧支付现金
    cashFlow = -Math.min(balance, rightTrader.cash);
    cashDirection = 'right';
    cashAmount = -cashFlow;
    setCashflow(cashFlow);
  } else if (balance < 0) {
    // 右侧价值更高，需要向左侧支付现金
    cashFlow = Math.min(Math.abs(balance), leftTrader.cash);
    cashDirection = 'left';
    cashAmount = cashFlow;
    setCashflow(cashFlow);
  }


  return (
    <div className="cash-balance">
      <div className="cash-flow-container">
        <div className="cash-amount">
          {cashAmount}
        </div>
        <span className="cash-flow">
          <div className={"cash-account"}>
            <p>{leftTrader.cash-cashFlow}</p>
            <p className={"cash-after-flow"}>({leftTrader.cash})</p>
          </div>
          <div className={"long-arrow " + (balance > 0 ? 'left' : balance < 0 ? 'right' : '')}/>
          <div className={"cash-account"}>
            <p>{rightTrader.cash+cashFlow}</p>
            <p className={"cash-after-flow"}>({rightTrader.cash})</p>
          </div>
        </span>
      </div>
    </div>
  );
};

export default CashBalance;
