# 交易界面 (Trade UI)

这是一个基于React的交易界面应用，实现了完整的物品交易系统，包括拖拽功能、交易平衡计算和现金平衡功能。

## 功能特性

### 核心功能
- **双交易者系统**: 支持两个交易者之间的物品交易
- **拖拽操作**: 物品可以在库存网格内和跨库存拖拽
- **交易物品标记**: 拖拽到其他库存的物品自动标记为交易物品
- **实时平衡计算**: 实时显示交易双方的物品价值平衡
- **现金平衡**: 自动计算现金流动方向和金额
- **最终平衡预览**: 考虑现金流动后的最终交易平衡

### 界面组件
- **物品显示 (ItemDisplay)**: 支持不同尺寸的物品显示，可显示价格和数量
- **库存网格 (InventoryGrid)**: 可拖拽的网格系统，支持物品放置
- **交易物品列表 (TradeItemList)**: 显示当前交易的所有物品
- **交易价值预览器 (TradeValuePreviewer)**: 显示交易物品的总价值
- **交易平衡预览器 (TradeBalancePreviewer)**: 显示交易双方的平衡情况
- **现金平衡 (CashBalance)**: 显示现金流动方向和金额
- **最终平衡预览器 (FinalBalancePreviewer)**: 显示考虑现金后的最终平衡

## 技术栈

- **React 18**: 前端框架
- **React DnD**: 拖拽功能实现
- **CSS3**: 样式和动画效果
- **ES6+**: 现代JavaScript特性

## 安装和运行

### 前置要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```

应用将在 `http://localhost:3000` 启动

### 构建生产版本
```bash
npm run build
```

## 数据结构

### Trader (交易者)
```javascript
{
  name: string,      // 交易者名称
  color: string,     // 交易者标识颜色
  cash: number       // 现金数量
}
```

### Item (物品)
```javascript
{
  id: string,        // 唯一标识
  name: string,      // 物品名称
  image: string,     // 物品图标
  price: number,     // 物品价格
  size: string,      // 物品尺寸 (1x1, 1x2, 2x1, 2x2)
  count: number,     // 物品数量
  isTradeItem: boolean,      // 是否为交易物品
  originalOwner: Trader      // 原始拥有者
}
```

### Inventory (库存)
```javascript
{
  trader: Trader,    // 所属交易者
  rows: number,      // 网格行数
  cols: number,      // 网格列数
  grid: Array,       // 网格数据
  items: Map         // 物品映射
}
```

## 使用方法

1. **启动应用**: 运行 `npm start` 启动开发服务器
2. **查看库存**: 左侧和右侧分别显示两个交易者的库存
3. **拖拽物品**: 点击并拖拽物品到其他位置或其他库存
4. **查看交易**: 拖拽到其他库存的物品会自动标记为交易物品
5. **平衡计算**: 系统自动计算交易平衡和现金流动
6. **完成交易**: 点击"成交"按钮完成交易

## 自定义配置

### 修改交易者
在 `TradePage.js` 中修改交易者的名称、颜色和现金数量：

```javascript
const [leftTrader] = useState(new Trader('左侧交易者', '#4caf50', 1000));
const [rightTrader] = useState(new Trader('右侧交易者', '#f44336', 800));
```

### 修改库存尺寸
在 `TradePage.js` 中修改库存的网格尺寸：

```javascript
const [leftInventory] = useState(new Inventory(leftTrader, 4, 3));  // 4行3列
const [rightInventory] = useState(new Inventory(rightTrader, 4, 5)); // 4行5列
```

### 添加新物品
在 `initializeItems()` 函数中添加新的物品：

```javascript
const newItem = new Item('新物品', '🆕', 100, '1x1', 1);
```

## 项目结构

```
src/
├── components/           # React组件
│   ├── ItemDisplay.js           # 物品显示组件
│   ├── InventoryGrid.js         # 库存网格组件
│   ├── TradeItemList.js         # 交易物品列表组件
│   ├── TradeValuePreviewer.js   # 交易价值预览器
│   ├── TradeBalancePreviewer.js # 交易平衡预览器
│   ├── CashBalance.js           # 现金平衡组件
│   ├── FinalBalancePreviewer.js # 最终平衡预览器
│   └── TradePage.js             # 主交易页面
├── types/               # 类型定义
│   └── index.js                # 数据模型定义
├── index.js             # 应用入口
└── index.css            # 全局样式
```

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目！
