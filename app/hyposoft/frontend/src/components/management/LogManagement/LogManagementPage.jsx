import React from "react";
import Axios from "axios";
import { Typography, Table, Input, Button, Icon } from 'antd';


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

// a class to build a table searchable by column
class LogManagementPage extends React.Component {

    componentDidMount() {
        createLogArray().then(data => this.setState({datasource: data}));
    }

    state = {
        searchText: '',
        searchedColumn: '',
        datasource: [],
    };

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Button
                    type="primary"
                    onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    icon="search"
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                >
                    Search
                </Button>
                <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                    Reset
                </Button>
            </div>
        ),
        filterIcon: filtered => (
            <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
    };

    config;

    render() {
        //table headers
        const columns = [
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                ...this.getColumnSearchProps('id'),
            },
            {
                title: 'Action',
                dataIndex: 'action',
                key: 'action',
                ...this.getColumnSearchProps('action'),
            },
            {
                title: 'Username',
                dataIndex: 'username',
                key: 'username',
                ...this.getColumnSearchProps('username'),
            },
            {
                title: 'Display Name',
                dataIndex: 'display_name',
                key: 'display_name',
                ...this.getColumnSearchProps('display_name'),
            },
            {
                title: 'Model',
                dataIndex: 'model',
                key: 'model',
                ...this.getColumnSearchProps('model'),
            },
            {
                title: 'Instance ID',
                dataIndex: 'instance_id',
                key: 'instance_id',
                ...this.getColumnSearchProps('instance_id'),
            },
            {
                title: 'Field Changed',
                dataIndex: 'field_changed',
                key: 'field_changed',
                ...this.getColumnSearchProps('field_changed'),
            },
            {
                title: 'Old Value',
                dataIndex: 'old_value',
                key: 'old_value',
                ...this.getColumnSearchProps('old_view'),
            },
            {
                title: 'New Value',
                dataIndex: 'new_value',
                key: 'new_value',
                ...this.getColumnSearchProps('new_value'),
            },
            {
                title: 'Timestamp',
                dataIndex: 'timestamp',
                key: 'timestamp',
                ...this.getColumnSearchProps('timestamp'),
            }
        ]

        // https://stackoverflow.com/questions/49206995/pagination-prop-for-antd-table
            this.config = {
                pagination : {
                    pageSizeOptions : ['30', '40'],
                    showSizeChanger : true
                }
            }

        return (
            <div style={{ padding: 16 }}>
                <Typography.Title level={3}>Logs</Typography.Title>
                <div>
                    <Table columns={columns} dataSource={this.state.datasource} />;
                </div>
            </div>
        );
    }
}

export default LogManagementPage;
