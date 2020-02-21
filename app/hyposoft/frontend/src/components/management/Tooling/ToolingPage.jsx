import React from "react";
import { Typography } from "antd";
import { Table } from 'antd';
import { useSelector, useDispatch } from "react-redux";
import { modelToString } from "../ModelManagement/ModelSchema";
import { fetchUsers } from "../../../redux/users/actions";
import { fetchModels } from "../../../redux/models/actions";
import { fetchRacks } from "../../../redux/racks/actions";
import { fetchAssets } from "../../../redux/assets/actions";


function ToolingPage() {
  const dispatch = useDispatch();

  const users = useSelector(s => Object.values(s.users));
  const models = useSelector(s => Object.values(s.models));
  const racks = useSelector(s => Object.values(s.racks));
  const assets = useSelector(s => Object.values(s.assets));

  React.useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchModels());
    dispatch(fetchRacks());
    dispatch(fetchAssets());
  }, []);

  const rackSpace = racks.length * 42; //total rack space, type: number
  const columns = [
      {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
      },
      {
        title: '% Used',
        dataIndex: 'used',
        key: 'used',
      },
      {
        title: "% Free",
        dataIndex: 'free',
        key: 'free',
      }
  ]

  console.log("assets", assets);
  console.log("assets size", assets.length);

  return rackSpace != null ? (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Reports</Typography.Title>
      <div>
        <Typography.Title level={4}>Total Rack Usage</Typography.Title>
        <Table dataSource={RackUsage(rackSpace, assets)} columns={columns} />;
      </div>
      <div>
        <Typography.Title level={4}>Rack Usage by Model</Typography.Title>
        <Table dataSource={RackUsageByModel(rackSpace, assets, models)} columns={columns} />;
      </div>
      <div>
        <Typography.Title level={4}>Rack Usage by Owner</Typography.Title>
        <Table dataSource={RackUsageByOwner(rackSpace, assets, users)} columns={columns} />;
      </div>
      <div>
        <Typography.Title level={4}>Rack Usage by Vendor</Typography.Title>
        <Table dataSource={RackUsageByModel(rackSpace, assets, models)} columns={columns} />;
      </div>
    </div>
  ) : (
    <Typography.Title level={4}>There's nothing to report!</Typography.Title>
  );
}

function RackUsage(rackSpace, assets) {
  let usedSpace = 0;

  //sum model heights
  for (let i = 0; i < assets.length; i++) {
    usedSpace += assets[i].model.height;
  }

  //calculate rack usage percentages
  let percentUsed = Number.parseFloat((100 * usedSpace) / rackSpace).toFixed(2);
  let percentFree = 100 - percentUsed;
  const rackUsage = [];

  if (assets.length != 0) {
    rackUsage.push({
      key: '1',
      category: "All racks",
      used: percentUsed,
      free: percentFree,
    });
  }

  return rackUsage;
}

function RackUsageByModel(rackSpace, assets, models) {
  const assetModels = [];

  //get all owner assets
  for (let i = 0; i < assets.length; i++) {
    assetModels.push(assets[i].model);
  }

  let modelUsedSpace = new Array(models.length).fill(0);

  //sum model heights by owner
  for (let i = 0; i < models.length; i++) {
    for (let j = 0; j < assetModels.length; j++) {
      if (models[i].id === assetModels[j].id) {
        modelUsedSpace[i] += models[i].height;
      }
    }
  }

  let percentUsed = [];
  let percentFree = 100;

  //calculate rack usage percentages by model
  for (let i = 0; i < models.length; i++) {
    percentUsed.push(((100 * modelUsedSpace[i]) / rackSpace).toFixed(2));
    percentFree = percentFree - percentUsed[i];
  }

  let modelUsage = [];

  //add row data to array
  for (let i = 0; i < models.length; i++) {
    modelUsage.push({
      key: i+1,
      category: modelToString(models[i]),
      used: percentUsed[i],
      free: percentFree
    });
  }

  return modelUsage;
}

function RackUsageByOwner(rackSpace, assets, users) {
  let owners = [];

  //get all owner assets
  for (let i = 0; i < assets.length; i++) {
    owners.push(assets[i].owner);
  }

  let uniqueOwners = users;
  let ownerUsedSpace = new Array(uniqueOwners.length).fill(0);

  //sum model heights by owner
  for (let i = 0; i < uniqueOwners.length; i++) {
    for (let j = 0; j < owners.length; j++) {
      if (uniqueOwners[i].id === owners[j].id) {
        ownerUsedSpace[i] += assets[j].model.height;
      }
    }
  }

  let percentUsed = [];
  let percentFree = 100;

  //calculate rack usage percentages by owner
  for (let i = 0; i < uniqueOwners.length; i++) {
    percentUsed[i] = ((100 * ownerUsedSpace[i]) / rackSpace).toFixed(2);
    percentFree = percentFree - percentUsed[i];
  }

  let ownerUsage = [];

  //add row data to array
  if (assets.length != 0) {
    for (let i = 0; i < uniqueOwners.length; i++) {
      ownerUsage[i] = {
        key: i + 1,
        category: uniqueOwners[i].username,
        used: percentUsed[i],
        free: percentFree
      };
    }
  }

  return ownerUsage;
}

function RackUsageByVendor(rackSpace, assets, models) {
  let vendors = [];

  //get all vendors assets
  for (let i = 0; i < assets.length; i++) {
    vendors.push(assets[i].model.vendor);
  }

  let uniqueVendors = Array.from(new Set(models.map(m => m.vendor)));
  let vendorUsedSpace = new Array(uniqueVendors.length).fill(0);

  //sum model heights by vendor
  for (let i = 0; i < uniqueVendors.length; i++) {
    for (let j = 0; j < vendors.length; j++) {
      if (uniqueVendors[i].localeCompare(vendors[j]) == 0) {
        vendorUsedSpace[i] += assets[j].model.height;
      }
    }
  }

  let percentUsed = [];
  let percentFree = 100;

  //calculate rack usage percentages by vendor
  for (let i = 0; i < uniqueVendors.length; i++) {
    percentUsed[i] = ((100 * vendorUsedSpace[i]) / rackSpace).toFixed(2);
    percentFree = percentFree - percentUsed[i];
  }

  let vendorUsage = [];

  //add row data to array
  for (let i = 0; i < uniqueVendors.length; i++) {
    vendorUsage[i] = {
      key: i + 1,
      category: uniqueVendors[i],
      used: percentUsed[i],
      free: percentFree
    };
  }

  return vendorUsage;
}

export default ToolingPage;
