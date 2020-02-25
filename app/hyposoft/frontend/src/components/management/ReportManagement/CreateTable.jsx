import React, { Component } from "react";
import { Typography } from "antd";
import s from "./CreateTable.module.css";

//Old - ReportManagementPage now uses Ant-Design Table component

class CreateTable extends Component {
  constructor(props) {
    super(props);
  }

  renderTableHeader() {
    let header = Object.keys(this.props.rackUsage[0]);
    return header.map((key, index) => {
      return (
        <th className={s.cell} key={index}>
          {key.toUpperCase()}
        </th>
      );
    });
  }

  renderTableData() {
    if (this.props.rackUsage.length == 0) return null;

    return this.props.rackUsage.map((usage, index) => {
      const { category, used, free } = usage; //destructuring
      return (
        <tr key={index}>
          <td className={s.cell}>{category}</td>
          <td className={s.cell}>{used}%</td>
          <td className={s.cell}>{free}%</td>
        </tr>
      );
    });
  }

  render() {
    return this.props.rackUsage.length > 0 ? (
      <div style={{ padding: 16 }}>
        <table id="rack_usage" className={s.cells} cellPadding={4}>
          <thead>
            <tr>{this.renderTableHeader()}</tr>
          </thead>
          <tbody>{this.renderTableData()}</tbody>
        </table>
      </div>
    ) : (
      <Typography.Title>No data</Typography.Title>
    );
  }
}

export default CreateTable;
