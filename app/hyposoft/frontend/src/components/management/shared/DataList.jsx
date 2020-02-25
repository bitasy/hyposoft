import React from "react";
import { Table, Button, Icon, Collapse } from "antd";
import Filter from "./Filters";
import { useSelector } from "react-redux";
import CreateTooltip from "../../../global/CreateTooltip";

function decorateColumns(columns, currentUser) {
  return columns.map(column => {
    return {
      ...column,
      render: (txt, record, idx) => column.render(record, currentUser)
    };
  });
}

function ListFooter({ onCreate, createDisabled }) {
  return (
    <div>
      <CreateTooltip isVisible={createDisabled} tooltipText={"Only users with admin privileges can create a new item"}>
        <Button onClick={onCreate} disabled={createDisabled}>
          <Icon type="plus"></Icon>
        </Button>
      </CreateTooltip>
    </div>
  );
}

function getDefaults(data, filters) {
  return filters.reduce((acc, filter) => {
    return Object.assign(acc, {
      [filter.fieldName]: filter.extractDefaultValue(data)
    });
  }, {});
}

function DataList({
  columns,
  filters,
  data,
  onSelect,
  onCreate,
  noCreate,
  createDisabled
}) {
  const paginationConfig = {
    position: "top",
    defaultPageSize: 10,
    total: data.length
  };

  const defaults = getDefaults(data, filters);

  const [filterValues, setFilterValues] = React.useState(defaults);

  const currentUser = useSelector(s => s.currentUser);

  React.useEffect(() => {
    setFilterValues(getDefaults(data, filters));
  }, [data]);

  const filteredData = filters.reduce(
    (remaining, filterDef) =>
      remaining.filter(r =>
        filterValues[filterDef.fieldName]
          ? filterDef.shouldInclude(filterValues[filterDef.fieldName], r)
          : remaining
      ),
    data
  );

  return (
    <>
      {filters.length > 0 ? (
        <Collapse>
          <Collapse.Panel header="Filters" key="1">
            {filters.map(filter => (
              <div key={filter.fieldName} style={{ marginTop: 10 }}>
                <p style={{ marginBottom: 2 }}>{filter.title}</p>
                <Filter
                  filterDef={filter}
                  data={data}
                  defaultValue={defaults[filter.fieldName]}
                  onChange={changeSet =>
                    setFilterValues(Object.assign({}, filterValues, changeSet))
                  }
                />
              </div>
            ))}
          </Collapse.Panel>
        </Collapse>
      ) : null}
      <Table
        rowKey={r => r.id}
        columns={decorateColumns(columns, currentUser)}
        dataSource={filteredData}
        onRow={r => {
          return {
            onClick: () => onSelect(r.id)
          };
        }}
        pagination={paginationConfig}
        className="pointer-on-hover"
        footer={() =>
          noCreate ? null : ListFooter({ onCreate, createDisabled })
        }
      />
    </>
  );
}

export default DataList;
