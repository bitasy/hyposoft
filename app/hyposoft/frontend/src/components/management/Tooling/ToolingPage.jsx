import React from "react";
import { Typography } from "antd";
import CreateTable from "./CreateTable";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchRacks,
  fetchAssets,
  fetchModels,
  fetchUsers
} from "../../../redux/actions";
import { modelToString } from "../ModelManagement/ModelSchema";

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

  let rackSpace = racks.length * 42; //total rack space, type: number

  return rackSpace != null ? (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Reports</Typography.Title>
      <div>
        <Typography.Title level={4}>Total Rack Usage</Typography.Title>
        <CreateTable rackUsage={RackUsage(rackSpace, assets)} />
      </div>
      <div>
        <Typography.Title level={4}>Rack Usage by Model</Typography.Title>
        <CreateTable rackUsage={RackUsageByModel(rackSpace, assets, models)} />
      </div>
      <div>
        <Typography.Title level={4}>Rack Usage by Owner</Typography.Title>
        <CreateTable rackUsage={RackUsageByOwner(rackSpace, assets, users)} />
      </div>
      <div>
        <Typography.Title level={4}>Rack Usage by Vendor</Typography.Title>
        <CreateTable rackUsage={RackUsageByVendor(rackSpace, assets, models)} />
      </div>
    </div>
  ) : (
    <Typography.Title level={4}>There's nothing to report!</Typography.Title>
  );
}

//works
function RackUsage(rackSpace, assets) {
  let usedSpace = 0;

  //sum model heights
  for (let i = 0; i < assets.length; i++) {
    usedSpace += assets[i].model.height;
  }

  //calculate rack usage percentages
  let percentUsed = Number.parseFloat((100 * usedSpace) / rackSpace);
  let percentFree = 100 - percentUsed;

  //add row data to array, props passed to CreateTable.jsx
  return [
    {
      category: "All racks",
      used: percentUsed.toFixed(2),
      free: percentFree.toFixed(2)
    }
  ];
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
      category: modelToString(models[i]),
      used: percentUsed[i],
      free: percentFree.toFixed(2)
    });
  }

  //props passed to CreateTable.jsx
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
  for (let i = 0; i < uniqueOwners.length; i++) {
    ownerUsage[i] = {
      category: uniqueOwners[i].username,
      used: percentUsed[i],
      free: percentFree.toFixed(2)
    };
  }

  //props passed to CreateTable.jsx
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
      category: uniqueVendors[i],
      used: percentUsed[i],
      free: percentFree.toFixed(2)
    };
  }

  //props passed to CreateTable.jsx
  return vendorUsage;
}

// //for testing
// function RackUsageByVendor(rackSpace, assets) { //testing
//     console.log("rackSpace", rackSpace);
//    // console.log("assets", assets);
//     let title = "Rack Usage by Vendor";
//     let assetsDotVendor = ["Dell", "Lenovo", "Dell", "Lenovo", "HP", "HP", "HP"]; //testing
//     let uniqueVendorsSet = new Set(assetsDotVendor);
//
//     let uniqueVendors = [...uniqueVendorsSet];
//     console.log("uniqueVendors", uniqueVendors);
//     //let vendorUsedSpace = [{String, Number}]; //may be needed if set does not keep same order
//     let assetsDotModelDotHeight = [1, 2, 1, 2, 3, 3, 3]; //testing
//
//     // calculate used space by vendor and add to array
//     let vendorUsedSpace = new Array(uniqueVendors.length).fill(0);
//     for (let i = 0; i < uniqueVendors.length; i++) {
//         //for (let j = 0; j < assets.length; j++) {
//         for (let j = 0; j < assetsDotVendor.length; j++) { //testing
//             //if (assets[i].vendor.equals(uniqueVendors[i])) { //comparing vendors
//             console.log("i", i);
//             console.log("j", j);
//             if (uniqueVendors[i].localeCompare(assetsDotVendor[j]) == 0) { //testing
//
//                 //vendorUsedSpace[i[0]] = uniqueVendors[i];  //first elem in nested array is vendor
//                 //vendorUsedSpace[i[1]] += assets[i].model.height; //second elem in nested array is rackspace
//                 //vendorUsedSpace[i] += assets[i].model.height;
//                 console.log("uniqueVendor", uniqueVendors[i]);
//                 console.log("vendor", assetsDotVendor[j]);
//                 console.log("height", assetsDotModelDotHeight[j]);
//                 console.log("height type", typeof assetsDotModelDotHeight[j]);
//                 console.log(" type", typeof vendorUsedSpace[i]);
//                 vendorUsedSpace[i] += assetsDotModelDotHeight[j]; //testing
//                 console.log("vendorUsedSpace", vendorUsedSpace[i]);
//             }
//         }
//     }
//     console.log("vendorUsedSpace", vendorUsedSpace);
//     let percentUsed = [];
//     let percentFree = 100;
//     for (let i = 0; i < uniqueVendors.length; i++) {
//         percentUsed[i] = Number.parseFloat(100 * vendorUsedSpace[i] / rackSpace).toFixed(2);
//         percentFree = percentFree - percentUsed[i];
//     }
//     console.log("percentUsed", percentUsed);
//     console.log("percentFree", percentFree);
//     let id = [...Array(uniqueVendors.length + 1).keys()].slice(1);
//     console.log("id", id);
//     let vendorUsage = [];
//     for (let i = 0; i < uniqueVendors.length; i++) {
//         vendorUsage[i] = {id: id[i], category: uniqueVendors[i], used: percentUsed[i], free: percentFree};
//     }
//     console.log("vendorUsage", vendorUsage);
//     return (
//         vendorUsage
//     );
// }

export default ToolingPage;
