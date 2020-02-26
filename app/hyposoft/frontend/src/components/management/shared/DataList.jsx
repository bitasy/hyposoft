import React from "react";
import { Table, Button, Icon, Collapse, Pagination } from "antd";
import Filter from "./Filters";
import { useSelector } from "react-redux";
import CreateTooltip from "../../../global/CreateTooltip";
import produce from "immer";
import RealAPI from "../../../api/API";

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
      <CreateTooltip
        isVisible={createDisabled}
        tooltipText={"Only users with admin privileges can create a new item"}
      >
        <Button onClick={onCreate} disabled={createDisabled}>
          <Icon type="plus"></Icon>
        </Button>
      </CreateTooltip>
    </div>
  );
}

function getDefaults(filters) {
  return filters.reduce((acc, filter) => {
    return Object.assign(acc, {
      [filter.fieldName]: filter.extractDefaultValue()
    });
  }, {});
}

function DataList({
  columns,
  filters,
  fetchData,
  onSelect,
  onCreate,
  noCreate,
  createDisabled
}) {
  const defaults = getDefaults(filters);
  const [filterValues, setFilterValues] = React.useState(defaults);
  React.useEffect(() => {
    setFilterValues(getDefaults(filters));
  }, []);

  const [total, setTotal] = React.useState(0);
  const [limit, setLimit] = React.useState(10);
  const [offset, setOffset] = React.useState(undefined);
  const [data, setData] = React.useState([]);

  const [orderField, setOrderField] = React.useState(undefined);
  const [isAscending, setIsAscending] = React.useState(true);

  const realm = React.useRef(0);

  const currentUser = useSelector(s => s.currentUser);
  const dcName = useSelector(s => s.appState.dcName);

  React.useEffect(() => {
    realm.current++;
    const t = realm.current;
    fetchData(
      dcName,
      limit,
      offset,
      filterValues,
      orderField,
      isAscending ? "" : "-"
    ).then(r => {
      if (t == realm.current) {
        setData(r.results);
        setTotal(r.count);
      }
    });
  }, [filterValues, offset, limit, isAscending, orderField]);

  const paginationConfig = {
    position: "top",
    defaultPageSize: limit,
    total,
    current: Math.floor(offset / limit) + (offset % limit == 0 ? 0 : 1),
    onChange: (page, pageSize) => {
      const ofs = (page - 1) * pageSize;
      if (ofs != offset) {
        setOffset(ofs);
      }
      if (limit !== pageSize) {
        setLimit(pageSize);
      }
    }
  };

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
                  defaultValue={filterValues[filter.fieldName]}
                  onChange={changeSet =>
                    setFilterValues(
                      produce(filterValues, draft =>
                        Object.assign(draft, changeSet)
                      )
                    )
                  }
                />
              </div>
            ))}
          </Collapse.Panel>
        </Collapse>
      ) : null}
      <Pagination {...paginationConfig} style={{ margin: "8px 0" }} />
      <Table
        rowKey={r => r.id}
        columns={decorateColumns(columns, currentUser)}
        dataSource={data}
        onRow={r => {
          return {
            onClick: () => onSelect(r.id)
          };
        }}
        onChange={(p, f, sorters) => {
          const { column, order } = sorters;
          if (order) {
            setIsAscending(order === "ascend");
            setOrderField(column.api_field);
          } else {
            setOrderField(null);
          }
        }}
        pagination={false}
        className="pointer-on-hover"
        footer={() =>
          noCreate ? null : ListFooter({ onCreate, createDisabled })
        }
      />
    </>
  );
}

export default DataList;
