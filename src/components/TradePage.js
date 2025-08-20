import React, { useState, useEffect } from 'react';
import InventoryGrid from './InventoryGrid';
import TradeItemList from './previewers/TradeItemList';
import TradeValuePreviewer from './previewers/TradeValuePreviewer';
import TradeBalancePreviewer from './previewers/TradeBalancePreviewer';
import CashBalance from './previewers/CashBalance';
import FinalBalancePreviewer from './previewers/FinalBalancePreviewer';
import { Trader, Item, Inventory } from '../types';
import './TradePage.css';

const TradePage = () => {
  const [cashFlow, setCashFlow] = useState(0);
  // 创建交易者
  const [leftTrader] = useState(new Trader('左侧交易者', '#63ff68', 1000));
  const [rightTrader] = useState(new Trader('右侧交易者', '#ff554a', 800));
  
  // 创建库存
  const [leftInventory] = useState(new Inventory(leftTrader, 5, 4));
  const [rightInventory] = useState(new Inventory(rightTrader, 5, 8));

  // 强制更新状态（用于触发渲染）
  const [, forceUpdate] = useState({});
  
  // 初始化物品数据
  useEffect(() => {
    initializeItems();
    // 初始化后触发一次渲染，使物品显示出来
    forceUpdate({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeItems = () => {
    // 顺序扫描放置：为每个物品找到第一个可用网格位置
    const placeItemsSequentially = (inventory, items) => {
      items.forEach((item) => {
        item.currentInventory = inventory;
        let placed = false;
        for (let r = 0; r < inventory.rows && !placed; r++) {
          for (let c = 0; c < inventory.cols && !placed; c++) {
            if (inventory.canPlaceItem(item, r, c)) {
              inventory.placeItem(item, r, c);
              placed = true;
            }
          }
        }
      });
    };

    // 左侧库存示例物品（包含不同尺寸与数量）
    const leftItems = [
      new Item('dagger', 'items/dagger.png', 20, '1x1', 1),
      new Item('shield', 'items/shield.png', 25, '2x2', 1),
      new Item('motor', 'items/motor.png', 5, '1x1', 3),
    ]
    
    // 右侧库存示例物品（包含不同尺寸与数量）
    const rightItems = [
      new Item('motor', 'items/motor.png', 10, '1x1', 2),
      new Item('dagger', 'items/dagger.png', 20, '1x1', 1),
      new Item('sword', 'items/sword.png', 35, '1x2', 1),
      new Item('helmet', 'items/helmet.png', 28, '1x1', 1),
      new Item('armor', 'items/armor.png', 45, '2x2', 1),
      new Item('dagger', 'items/dagger.png', 20, '1x1', 1),
      new Item('dagger', 'items/dagger.png', 20, '1x1', 1),
      new Item('dagger', 'items/dagger.png', 20, '1x1', 1),
      new Item('shield', 'items/shield.png', 25, '2x2', 1),
      new Item('pistol', 'items/pistol.png', 45, '1x2', 1),
      new Item('dagger', 'items/dagger.png', 20, '1x1', 1),
    ];

    // 放置物品到库存
    placeItemsSequentially(leftInventory, leftItems);
    placeItemsSequentially(rightInventory, rightItems);
  };

  // 处理物品拖拽
  const handleItemDrop = (dragPayload, targetRow, targetCol, targetInventory) => {
    try {
      console.warn("start handle drop")
      console.log(dragPayload)
      console.log(targetCol + ", " + targetRow)
      if (!dragPayload || !targetInventory) {
        console.warn('Invalid drop parameters:', { dragPayload, targetInventory });
        return;
      }

      // 优先使用payload中的源库存，否则在两个库存中查找
      let sourceInventory = dragPayload.sourceInventory || null;
      if (!sourceInventory) {
        if (leftInventory.items.has(dragPayload.id)) sourceInventory = leftInventory;
        if (rightInventory.items.has(dragPayload.id)) sourceInventory = rightInventory;
      }

      // 解析真实的Item对象
      const actualItem = sourceInventory?.items.get(dragPayload.id) 
        || leftInventory.items.get(dragPayload.id) 
        || rightInventory.items.get(dragPayload.id);

      if (!actualItem) {
        console.warn('Dragged item not found in inventories:', dragPayload.id);
        return;
      }

      // 验证目标位置
      if (targetRow < 0 || targetRow >= targetInventory.rows || 
          targetCol < 0 || targetCol >= targetInventory.cols) {
        console.warn('Invalid drop position:', { targetRow, targetCol, inventory: targetInventory });
        return;
      }
      
      // 从源库存移除物品
      if (sourceInventory) {
        sourceInventory.removeItem(actualItem.id);
      }



      
      // 尝试放置到目标位置
      const placementSuccess = targetInventory.placeItem(actualItem, targetRow, targetCol);
      setCashFlow(0)
      if (!placementSuccess) {
        dragPayload.sourceInventory.placeItem(actualItem, dragPayload.sourcePosition.row, dragPayload.sourcePosition.col)
      }
      else {
        // 跨库存逻辑
        if (targetInventory !== sourceInventory) {
          // 如果返回到原主人库存：清除交易标记
          if (actualItem.originalOwner && targetInventory.trader === actualItem.originalOwner) {
            actualItem.isTradeItem = false;
            actualItem.originalOwner = null;
          } else {
            // 非返回：仅在未标记为交易时，设置为交易并锁定originalOwner
            if (!actualItem.isTradeItem) {
              actualItem.isTradeItem = true;
              actualItem.originalOwner = sourceInventory?.trader || null;
            }
            // 注意：如果已是交易物品，则保持其originalOwner，不修改为B
          }
          actualItem.currentInventory = targetInventory;
        } else {
          // 同库存内移动，不改变交易标记
          actualItem.currentInventory = targetInventory;
        }
      }
      
      // 强制重新渲染
      forceUpdate({});
    } catch (error) {
      console.error('Error in handleItemDrop:', error);
      // 安全降级：仅记录日志
    }
  };

  // 返还所有物品
  const returnAllItems = (inventory) => {
    const tradeItems = inventory.getTradeItems();
    tradeItems.forEach(item => {
      let owner = item.originalOwner;
      let inv = owner === leftInventory.trader ? leftInventory : rightInventory;
      // 找到第一个可放置的位置
      outer: for (let r = 0; r < inv.rows; r++) {
        for (let c = 0; c < inv.cols; c++) {
          if (inv.placeItem(item, r, c)) {
            item.isTradeItem = false;
            item.originalOwner = null;
            item.currentInventory = inv;
            inventory.removeItem(item.id);
            break outer;
          }
        }
      }
    });
    forceUpdate({});
  };

  // 完成交易
  const completeTrade = () => {
    // 这里可以添加交易完成的逻辑
    for (let item of rightInventory.items) {
      item.isTradeItem = false;
      item.originalOwner = null;
    }
    for (let item of leftInventory.items) {
      item.isTradeItem = false;
      item.originalOwner = null;
    }
    console.log(leftInventory.items);
    leftTrader.cash -= cashFlow
    rightTrader.cash += cashFlow
    setCashFlow(0)
    forceUpdate({});
  };

  // 获取“给出”的交易数据（位于对方库存，且originalOwner为本方）
  const leftGivenItems = Array.from(rightInventory.items.values()).filter(
    (it) => it.isTradeItem && it.originalOwner === leftTrader
  );
  const rightGivenItems = Array.from(leftInventory.items.values()).filter(
    (it) => it.isTradeItem && it.originalOwner === rightTrader
  );

  const leftGivenValue = leftGivenItems.reduce((sum, it) => sum + it.price, 0);
  const rightGivenValue = rightGivenItems.reduce((sum, it) => sum + it.price, 0);

  return (
    <div className="trade-page">
      {/* 主要交易区域 */}
      <div className="trade-container">
        {/* 左侧库存 */}
        <div className="inventory-section" style={{justifyContent: 'flex-end'}}>
          <InventoryGrid
            inventory={leftInventory}
            onItemDrop={(item, row, col) => handleItemDrop(item, row, col, leftInventory)}
            highlightTradeItems={true}
          />
        </div>

        {/* 中间控制区域 */}
        <div className="trade-controls">
          <button 
            className="control-button return-all-left"
            onClick={() => returnAllItems(rightInventory)}
          >
            <p>返还全部</p>
          </button>
          <button 
            className="control-button return-all-right"
            onClick={() => returnAllItems(leftInventory)}
          >
            <p>返还全部</p>
          </button>
        </div>

        {/* 右侧库存 */}
        <div className="inventory-section" style={{justifyContent: 'flex-start'}}>
          <InventoryGrid
            inventory={rightInventory}
            onItemDrop={(item, row, col) => handleItemDrop(item, row, col, rightInventory)}
            highlightTradeItems={true}
          />
        </div>
      </div>

      {/* 预览行：左列(列表+价值) - 中间平衡 - 右列(列表+价值) */}
      <div className="value-previewer-row">
        <div className="value-side value-side-left">
          <TradeItemList tradeItems={leftGivenItems} traderColor={leftTrader.color} />
          <TradeValuePreviewer value={leftGivenValue} traderColor={leftTrader.color} />
        </div>

        <TradeBalancePreviewer
          leftValue={leftGivenValue}
          rightValue={rightGivenValue}
          leftTraderColor={leftTrader.color}
          rightTraderColor={rightTrader.color}
          mod={0}
        />

        <div className="value-side value-side-right">
          <TradeItemList tradeItems={rightGivenItems} traderColor={rightTrader.color} />
          <TradeValuePreviewer value={rightGivenValue} traderColor={rightTrader.color} />
        </div>
      </div>

      {/* 现金平衡 */}
      <CashBalance
        setCashflow={setCashFlow}
        leftValue={leftGivenValue}
        rightValue={rightGivenValue}
        leftTrader={leftTrader}
        rightTrader={rightTrader}
      />

      {/* 最终平衡预览 */}
      <TradeBalancePreviewer
        leftValue={leftGivenValue}
        rightValue={rightGivenValue}
        leftTrader={leftTrader}
        rightTrader={rightTrader}
        mod={cashFlow}
      />

      {/* 交易按钮 */}
      <button 
        className="deal-button"
        onClick={completeTrade}
        disabled={leftGivenItems.length === 0 && rightGivenItems.length === 0}
      >
        成交
      </button>
    </div>
  );
};

export default TradePage;
