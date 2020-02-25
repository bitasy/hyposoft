import React from "react";
import Axios from "axios";
import { Typography } from "antd";
import { Table } from "antd";

function LogManagementPage() {
    const [datasource, setDatasource] = React.useState([]);

    React.useEffect(() => {
        createLogArray().then(setDatasource);
    }, []);

    //table headers
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Display Name',
            dataIndex: 'display_name',
            key: 'display_name',
        },
        {
            title: 'Model',
            dataIndex: 'model',
            key: 'model',
        },
        {
            title: 'Instance ID',
            dataIndex: 'instance_id',
            key: 'instance_id',
        },
        {
            title: 'Field Changed',
            dataIndex: 'field_changed',
            key: 'field_changed',
        },
        {
            title: 'Old Value',
            dataIndex: 'old_value',
            key: 'old_value',
        },
        {
            title: 'New Value',
            dataIndex: 'new_value',
            key: 'new_value',
        },
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
        }
    ]

    return (
        <div style={{ padding: 16 }}>
            <Typography.Title level={3}>Logs</Typography.Title>
            <div>
                <Table dataSource={datasource} columns={columns} />;
            </div>
        </div>
    );
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


// For pagination (scrolling)

{/*<InfiniteScroll*/}
{/*    //dataLength={items.length} //This is important field to render the next data*/}
{/*    dataLength={1}*/}
{/*    next={fetchData}*/}
{/*    hasMore={true}*/}
{/*    loader={<h4>Loading...</h4>}*/}
{/*    endMessage={*/}
{/*        <p style={{textAlign: 'center'}}>*/}
{/*            <b>End of log file.</b>*/}
{/*        </p>*/}
{/*    }>*/}
{/*</InfiniteScroll>*/}

//TODO: parse JSON log object for results
function getResults() {
    const jsonData = fetchLog();

}
//TODO: append each page of log results to an array
function appendResults() {

}

export default LogManagementPage