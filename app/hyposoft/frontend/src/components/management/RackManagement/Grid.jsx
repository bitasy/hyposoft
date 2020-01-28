import React from "react";
import style from "./Grid.module.css";

const CELL_WIDTH = 20;

// columns: string[]
// rows: string[]
// renderCell: (rowIdx, colIdx) => Node

function Grid({ columns, rows, renderCell }) {
  const headerRow = (
    <thead>
      <tr>
        <th className={style.tableElm}></th>
        {columns.map(column => (
          <th className={style.tableElm} key={column}>
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );

  const body = (
    <tbody>
      {rows.map((row, rowIdx) => (
        <tr key={row + rowIdx}>
          <td className={style.tableElm}>{row}</td>
          {columns.map((col, colIdx) => (
            <td className={style.tableElm} key={col + colIdx}>
              {renderCell(rowIdx, colIdx)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className={style.horizontalScroll}>
      <table
        style={{ width: CELL_WIDTH * (columns.length + 1) }}
        className={style.table}
      >
        {headerRow}
        {body}
      </table>
    </div>
  );
}

export default Grid;
