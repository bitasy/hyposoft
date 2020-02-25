import React from "react";
import Axios from "axios";

let myData = [];

function CreateLogData() {

    console.log("in CreateLogData");

    const [datasource, setDatasource] = React.useState([]);

    React.useEffect(() => {
        createLogArray().then(setDatasource);
    }, []);

    // props to be passed to LogManagementPage
    // myData = datasource;
    // return myData;
    return datasource;

}

// a public function
function getDatasource() {
    return myData;
}

function fetchLog() {
    return Axios.get("log").then(getData);  //returns a list
}

function getData(res) {
    return res.status < 300 ? res.data : Promise.reject(res.data);
}

// a function to create an array of data from a JSON list object
async function createLogArray() {
    const logList = await fetchLog();
    console.log("log as list", logList);

    const logLength = Object.keys(logList).length;
    console.log("# log entries", logLength);

    const logArray = [];

    for (let i = 0; i < logLength; i++) {
        const obj = logList[i];

        logArray.push({
            key: i+1,
            id: obj.id,
            action: obj.action,
            username: obj.username,
            display_name: obj.display_name,
            model: obj.model,
            instance_id: obj.instance_id,
            field_change: obj.field_changes,
            old_value: obj.old_value,
            new_value: obj.new_value,
            timestamp: obj.timestamp,
        });
    }

    console.log("as array", logArray);

    return logArray;
}

export default CreateLogData;