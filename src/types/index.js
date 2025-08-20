// 交易者类型
export const TRADER_TYPES = {
  LEFT: 'left',
  RIGHT: 'right'
};

// 物品尺寸类型
export const ITEM_SIZES = {
  '1x1': { width: 1, height: 1 },
  '1x2': { width: 1, height: 2 },
  '2x1': { width: 2, height: 1 },
  '2x2': { width: 2, height: 2 }
};

// 交易者数据结构
export class Trader {
  constructor(name, color, cash = 1000) {
    this.name = name;
    this.color = color;
    this.cash = cash;
  }
}

// 物品数据结构
export class Item {
  constructor(name, image, price, size = '1x1', count = 1) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.name = name;
    this.image = image;
    this.price = price;
    this.size = size;
    this.count = count;
    this.originalOwner = null; // 原始拥有者
    this.isTradeItem = false; // 是否为交易物品
  }
}

// 库存数据结构
export class Inventory {
  constructor(trader, rows = 4, cols = 5) {
    this.trader = trader;
    this.rows = rows;
    this.cols = cols;
    this.grid = this.createEmptyGrid();
    this.items = new Map(); // itemId -> item
  }

  createEmptyGrid() {
    const grid = [];
    for (let i = 0; i < this.rows; i++) {
      grid[i] = [];
      for (let j = 0; j < this.cols; j++) {
        grid[i][j] = null;
      }
    }
    return grid;
  }

  // 检查位置是否可以放置物品
  canPlaceItem(item, row, col) {
    try {
      // 基本验证
      if (!item || typeof row !== 'number' || typeof col !== 'number') {
        return false;
      }

      const size = ITEM_SIZES[item.size];
      if (!size) return false;

      // 检查边界
      if (row < 0 || col < 0 || row + size.height > this.rows || col + size.width > this.cols) {
        return false;
      }

      // 检查目标位置是否被占用
      for (let i = row; i < row + size.height; i++) {
        for (let j = col; j < col + size.width; j++) {
          if (i < this.rows && j < this.cols && this.grid[i][j] !== null) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error in canPlaceItem:', error);
      return false;
    }
  }

  // 放置物品
  placeItem(item, row, col) {
    try {
      // 基本验证
      if (!item || typeof row !== 'number' || typeof col !== 'number') {
        console.warn('Invalid parameters for placeItem:', { item, row, col });
        return false;
      }

      // 边界检查
      if (row < 0 || col < 0 || row >= this.rows || col >= this.cols) {
        console.warn('Position out of bounds:', { row, col, rows: this.rows, cols: this.cols });
        return false;
      }

      if (!this.canPlaceItem(item, row, col)) {
        return false;
      }

      const size = ITEM_SIZES[item.size];
      
      // 标记网格位置
      for (let i = row; i < row + size.height; i++) {
        for (let j = col; j < col + size.width; j++) {
          if (i < this.rows && j < this.cols) {
            this.grid[i][j] = item.id;
          }
        }
      }

      // 存储物品
      this.items.set(item.id, item);
      return true;
    } catch (error) {
      console.error('Error in placeItem:', error);
      return false;
    }
  }

  // 移除物品
  removeItem(itemId) {
    const item = this.items.get(itemId);
    if (!item) return false;

    const size = ITEM_SIZES[item.size];
    
    // 清除网格位置
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (this.grid[i][j] === itemId) {
          this.grid[i][j] = null;
        }
      }
    }

    this.items.delete(itemId);
    return true;
  }

  // 获取交易物品
  getTradeItems() {
    return Array.from(this.items.values()).filter(item => item.isTradeItem);
  }

  // 获取交易物品总价值
  getTradeValue() {
    return this.getTradeItems().reduce((total, item) => total + item.price, 0);
  }

  // 清空交易物品
  clearTradeItems() {
    const tradeItems = this.getTradeItems();
    tradeItems.forEach(item => {
      this.removeItem(item.id);
    });
    return tradeItems;
  }
}
