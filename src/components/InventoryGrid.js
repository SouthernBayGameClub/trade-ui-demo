import React, { useRef, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import ItemDisplay from './ItemDisplay';
import './InventoryGrid.css';
import { ITEM_SIZES } from '../types';

const CELL_SIZE_PX = 60; // 轨道尺寸（与gridTemplate设置一致），仅作兜底

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const InventoryGrid = ({ 
  inventory, 
  onItemDrop, 
  onItemClick,
  highlightTradeItems = false 
}) => {
  const gridRef = useRef(null);
  const [hoverPos, setHoverPos] = useState(null); // { row, col, width, height }

  // 从DOM计算真实的cell宽高与gap、边框、内边距，保证算法与视觉一致
  const getLayoutMetrics = () => {
    const el = gridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);

    const borderLeft = parseFloat(cs.borderLeftWidth) || 0;
    const borderRight = parseFloat(cs.borderRightWidth) || 0;
    const borderTop = parseFloat(cs.borderTopWidth) || 0;
    const borderBottom = parseFloat(cs.borderBottomWidth) || 0;

    const paddingLeft = parseFloat(cs.paddingLeft) || 0;
    const paddingRight = parseFloat(cs.paddingRight) || 0;
    const paddingTop = parseFloat(cs.paddingTop) || 0;
    const paddingBottom = parseFloat(cs.paddingBottom) || 0;

    // gap 兼容写法
    const columnGap = parseFloat(cs.columnGap || cs.gap) || 0;
    const rowGap = parseFloat(cs.rowGap || cs.gap) || 0;

    // 内容区域尺寸（去掉边框与内边距）
    const contentWidth = rect.width - borderLeft - borderRight - paddingLeft - paddingRight;
    const contentHeight = rect.height - borderTop - borderBottom - paddingTop - paddingBottom;

    // 根据轨道与gap推回计算单元尺寸（更稳妥，避免缩放取整误差）
    const cellWidth = (contentWidth - (inventory.cols - 1) * columnGap) / inventory.cols || CELL_SIZE_PX;
    const cellHeight = (contentHeight - (inventory.rows - 1) * rowGap) / inventory.rows || CELL_SIZE_PX;
    return { rect, borderLeft, borderTop, paddingLeft, paddingTop, columnGap, rowGap, cellWidth, cellHeight };
  };

  const calcAnchorFromPoint = (clientX, clientY, itemSize) => {
    const m = getLayoutMetrics();
    if (!m) return null;

    // 转到内容坐标系
    const x = clientX - m.rect.left - m.borderLeft - m.paddingLeft;
    const y = clientY - m.rect.top - m.borderTop - m.paddingTop;

    const trackW = m.cellWidth + m.columnGap;
    const trackH = m.cellHeight + m.rowGap;

    let col = Math.floor(x / trackW);
    let row = Math.floor(y / trackH);

    // 钳制锚点，保证物品完全在网格内
    col = clamp(col, 0, Math.max(0, inventory.cols - itemSize.width));
    row = clamp(row, 0, Math.max(0, inventory.rows - itemSize.height));


    return { row, col, width: itemSize.width, height: itemSize.height };
  };

  const [{ isOver }, drop] = useDrop({
    accept: 'ITEM',

    hover: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset) return;
      const size = ITEM_SIZES[item.size] || { width: 1, height: 1 };
      const next = calcAnchorFromPoint(offset.x, offset.y, size);
      if (!next) return;
      if (
        !hoverPos ||
        hoverPos.row !== next.row ||
        hoverPos.col !== next.col ||
        hoverPos.width !== next.width ||
        hoverPos.height !== next.height
      ) {
        setHoverPos(next);
      }
    },

    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset) return;
      const size = ITEM_SIZES[item.size] || { width: 1, height: 1 };
      const anchor = calcAnchorFromPoint(offset.x, offset.y, size);
      if (anchor) {
        onItemDrop(item, anchor.row, anchor.col);
      }
      setHoverPos(null);
    },

    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  useEffect(() => {
    if (!isOver && hoverPos) setHoverPos(null);
  }, [isOver]);

  const isHighlighted = (r, c) => {
    if (!hoverPos) return false;
    return (
      r >= hoverPos.row && r < hoverPos.row + hoverPos.height &&
      c >= hoverPos.col && c < hoverPos.col + hoverPos.width
    );
  };

  const renderGrid = () => {
    const baseCells = [];
    const anchorCells = [];

    for (let row = 0; row < inventory.rows; row++) {
      for (let col = 0; col < inventory.cols; col++) {
        const itemId = inventory.grid[row][col];
        const item = itemId ? inventory.items.get(itemId) : null;

        const highlightClass = isHighlighted(row, col) ? ' highlight-cell' : '';
        // 基础单元显式定位，保持栅格稳定
        baseCells.push(
          <div
            key={`cell-${row}-${col}`}
            className={`grid-cell${highlightClass}`}
            style={{ gridRowStart: row + 1, gridColumnStart: col + 1 }}
          />
        );

        // 仅在锚点单元渲染ItemDisplay，并让该.grid-cell跨行列
        if (itemId && item) {
          const hasSameAbove = row > 0 && inventory.grid[row - 1][col] === itemId;
          const hasSameLeft = col > 0 && inventory.grid[row][col - 1] === itemId;
          const isAnchorCell = !hasSameAbove && !hasSameLeft;
          if (isAnchorCell) {
            const size = ITEM_SIZES[item.size] || { width: 1, height: 1 };
            const highlightColor = highlightTradeItems && item.isTradeItem 
              ? item.originalOwner?.color || '#ff9800'
              : null;
            anchorCells.push(
              <div
                key={`anchor-${itemId}-${row}-${col}`}
                className={`grid-cell anchor-cell`}
                style={{
                  gridRowStart: row + 1,
                  gridColumnStart: col + 1,
                  gridRowEnd: `span ${size.height}`,
                  gridColumnEnd: `span ${size.width}`,
                }}
              >
                <ItemDisplay
                  item={item}
                  position={{ row, col }}
                  highlightColor={highlightColor}
                  showPrice={item.isTradeItem}
                  onItemClick={onItemClick}
                />
              </div>
            );
          }
        }
      }
    }

    // 先渲染基础单元，再渲染带Item的锚点单元，使内容覆盖基础单元
    return [...baseCells, ...anchorCells];
  };

  return (
    <div
      ref={(node) => { gridRef.current = node; drop(node); }}
      className={`inventory-grid ${isOver ? 'drag-over' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${inventory.cols}, ${CELL_SIZE_PX}px)`,
        gridTemplateRows: `repeat(${inventory.rows}, ${CELL_SIZE_PX}px)`
      }}
    >
      {renderGrid()}
    </div>
  );
};

export default InventoryGrid;
