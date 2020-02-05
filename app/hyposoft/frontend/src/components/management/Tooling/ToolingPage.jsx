import React from "react";
import { Typography } from "antd";
import CreateTable from "./CreateTable";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchRacks,
  fetchInstances,
  fetchModels,
  fetchUsers
} from "../../../redux/actions";
import { modelToString } from "../ModelManagement/ModelSchema";

function ToolingPage() {
  const dispatch = useDispatch();

  const users = useSelector(s => Object.values(s.users));
  const models = useSelector(s => Object.values(s.models));
  const racks = useSelector(s => Object.values(s.racks));
  const instances = useSelector(s => Object.values(s.instances));

  React.useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchModels());
    dispatch(fetchRacks());
    dispatch(fetchInstances());
  }, []);

  let rackSpace = racks.length * 42; //total rack space, type: number

  return rackSpace != null ? (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Reports</Typography.Title>
      <div>
        <Typography.Title level={4}>Total Rack Usage</Typography.Title>
        <CreateTable rackUsage={RackUsage(rackSpace, instances)} />
      </div>
      <div>
        <Typography.Title level={4}>Rack Usage by Model</Typography.Title>
        <CreateTable
          rackUsage={RackUsageByModel(rackSpace, instances, models)}
        />
      </div>
      <div>
        <Typography.Title level={4}>Rack Usage by Owner</Typography.Title>
        <CreateTable
          rackUsage={RackUsageByOwner(rackSpace, instances, users)}
        />
      </div>
      <div>
        <Typography.Title level={4}>Rack Usage by Vendor</Typography.Title>
        <CreateTable
          rackUsage={RackUsageByVendor(rackSpace, instances, models)}
        />
      </div>
    </div>
  ) : (
    <Typography.Title level={4}>There's nothing to report!</Typography.Title>
  );
}

//works
function RackUsage(rackSpace, instances) {
  let usedSpace = 0;

  //sum model heights
  for (let i = 0; i < instances.length; i++) {
    usedSpace += instances[i].model.height;
  }

  //calculate rack usage percentages
  let percentUsed = Number.parseFloat(
    (100 * usedSpace) / rackSpace
  ).toPrecision(2);
  let percentFree = 100 - percentUsed;

  //add row data to array, props passed to CreateTable.jsx
  return [
    {
      category: "All racks",
      used: percentUsed,
      free: percentFree
    }
  ];
}

function RackUsageByModel(rackSpace, instances, models) {
  const instanceModels = [];

  //get all owner instances
  for (let i = 0; i < instances.length; i++) {
    instanceModels.push(instances[i].model);
  }

  let modelUsedSpace = new Array(models.length).fill(0);

  //sum model heights by owner
  for (let i = 0; i < models.length; i++) {
    for (let j = 0; j < instanceModels.length; j++) {
      if (models[i].id === instanceModels[j].id) {
        modelUsedSpace[i] += models[i].height;
      }
    }
  }

  let percentUsed = [];
  let percentFree = 100;

  //calculate rack usage percentages by model
  for (let i = 0; i < models.length; i++) {
    percentUsed.push(((100 * modelUsedSpace[i]) / rackSpace).toPrecision(2));
    percentFree = percentFree - percentUsed[i];
  }

  let modelUsage = [];

  //add row data to array
  for (let i = 0; i < models.length; i++) {
    modelUsage.push({
      category: modelToString(models[i]),
      used: percentUsed[i],
      free: percentFree
    });
  }

  //props passed to CreateTable.jsx
  return modelUsage;
}

function RackUsageByOwner(rackSpace, instances, users) {
  let owners = [];

  //get all owner instances
  for (let i = 0; i < instances.length; i++) {
    owners.push(instances[i].owner);
  }

  let uniqueOwners = users;
  let ownerUsedSpace = new Array(uniqueOwners.length).fill(0);

  //sum model heights by owner
  for (let i = 0; i < uniqueOwners.length; i++) {
    for (let j = 0; j < owners.length; j++) {
      if (uniqueOwners[i].id === owners[j].id) {
        ownerUsedSpace[i] += instances[j].model.height;
      }
    }
  }

  let percentUsed = [];
  let percentFree = 100;

  //calculate rack usage percentages by owner
  for (let i = 0; i < uniqueOwners.length; i++) {
    percentUsed[i] = ((100 * ownerUsedSpace[i]) / rackSpace).toPrecision(2);
    percentFree = percentFree - percentUsed[i];
  }

  let ownerUsage = [];

  //add row data to array
  for (let i = 0; i < uniqueOwners.length; i++) {
    ownerUsage[i] = {
      category: uniqueOwners[i].username,
      used: percentUsed[i],
      free: percentFree
    };
  }

  //props passed to CreateTable.jsx
  return ownerUsage;
}

function RackUsageByVendor(rackSpace, instances, models) {
  let vendors = [];

  //get all vendors instances
  for (let i = 0; i < instances.length; i++) {
    vendors.push(instances[i].model.vendor);
  }

  let uniqueVendors = Array.from(new Set(models.map(m => m.vendor)));
  let vendorUsedSpace = new Array(uniqueVendors.length).fill(0);

  //sum model heights by vendor
  for (let i = 0; i < uniqueVendors.length; i++) {
    for (let j = 0; j < vendors.length; j++) {
      if (uniqueVendors[i].localeCompare(vendors[j]) == 0) {
        vendorUsedSpace[i] += instances[j].model.height;
      }
    }
  }

  let percentUsed = [];
  let percentFree = 100;

  //calculate rack usage percentages by vendor
  for (let i = 0; i < uniqueVendors.length; i++) {
    percentUsed[i] = ((100 * vendorUsedSpace[i]) / rackSpace).toPrecision(2);
    percentFree = percentFree - percentUsed[i];
  }

  let vendorUsage = [];

  //add row data to array
  for (let i = 0; i < uniqueVendors.length; i++) {
    vendorUsage[i] = {
      category: uniqueVendors[i],
      used: percentUsed[i],
      free: percentFree
    };
  }

  //props passed to CreateTable.jsx
  return vendorUsage;
}

// //for testing
// function RackUsageByVendor(rackSpace, instances) { //testing
//     console.log("rackSpace", rackSpace);
//    // console.log("instances", instances);
//     let title = "Rack Usage by Vendor";
//     let instancesDotVendor = ["Dell", "Lenovo", "Dell", "Lenovo", "HP", "HP", "HP"]; //testing
//     let uniqueVendorsSet = new Set(instancesDotVendor);
//
//     let uniqueVendors = [...uniqueVendorsSet];
//     console.log("uniqueVendors", uniqueVendors);
//     //let vendorUsedSpace = [{String, Number}]; //may be needed if set does not keep same order
//     let instancesDotModelDotHeight = [1, 2, 1, 2, 3, 3, 3]; //testing
//
//     // calculate used space by vendor and add to array
//     let vendorUsedSpace = new Array(uniqueVendors.length).fill(0);
//     for (let i = 0; i < uniqueVendors.length; i++) {
//         //for (let j = 0; j < instances.length; j++) {
//         for (let j = 0; j < instancesDotVendor.length; j++) { //testing
//             //if (instances[i].vendor.equals(uniqueVendors[i])) { //comparing vendors
//             console.log("i", i);
//             console.log("j", j);
//             if (uniqueVendors[i].localeCompare(instancesDotVendor[j]) == 0) { //testing
//
//                 //vendorUsedSpace[i[0]] = uniqueVendors[i];  //first elem in nested array is vendor
//                 //vendorUsedSpace[i[1]] += instances[i].model.height; //second elem in nested array is rackspace
//                 //vendorUsedSpace[i] += instances[i].model.height;
//                 console.log("uniqueVendor", uniqueVendors[i]);
//                 console.log("vendor", instancesDotVendor[j]);
//                 console.log("height", instancesDotModelDotHeight[j]);
//                 console.log("height type", typeof instancesDotModelDotHeight[j]);
//                 console.log(" type", typeof vendorUsedSpace[i]);
//                 vendorUsedSpace[i] += instancesDotModelDotHeight[j]; //testing
//                 console.log("vendorUsedSpace", vendorUsedSpace[i]);
//             }
//         }
//     }
//     console.log("vendorUsedSpace", vendorUsedSpace);
//     let percentUsed = [];
//     let percentFree = 100;
//     for (let i = 0; i < uniqueVendors.length; i++) {
//         percentUsed[i] = Number.parseFloat(100 * vendorUsedSpace[i] / rackSpace).toPrecision(2);
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
