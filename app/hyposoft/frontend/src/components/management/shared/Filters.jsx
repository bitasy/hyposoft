import React from "react";
import { Slider, Select, Checkbox, Input } from "antd";
import GridRangeSelector from "../RackManagement/GridRangeSelector";

function NullableRangeFilter({ filterDef, defaultValue, onChange, data }) {
  const [filterValue, setFilterValue] = React.useState(defaultValue);
  React.useEffect(() => {
    setFilterValue(defaultValue);
  }, [data]);

  const [range, includeNull] = filterValue;

  return (
    <div>
      <Slider
        range
        {...filterDef}
        defaultValue={defaultValue[0]}
        onAfterChange={v => {
          setFilterValue([v, includeNull]);
          onChange({ [filterDef.fieldName]: [v, includeNull] });
        }}
      />
      <span style={{ marginRight: 5 }}>Include Null?</span>
      <Checkbox
        defaultChecked={defaultValue[1]}
        onChange={e => {
          setFilterValue([range, e.target.checked]);
          onChange({ [filterDef.fieldName]: [range, e.target.checked] });
        }}
      />
    </div>
  );
}

function RangeFilter({ defaultValue, filterDef, onChange, data }) {
  return (
    <Slider
      key={data}
      range
      {...filterDef}
      defaultValue={defaultValue}
      onAfterChange={v => onChange({ [filterDef.fieldName]: v })}
    />
  );
}

function SelectFilter({ defaultValue, filterDef, onChange, data }) {
  return (
    <Select
      key={data}
      mode="multiple"
      style={{ width: "100%" }}
      onChange={v => onChange({ [filterDef.fieldName]: v })}
      defaultValue={defaultValue}
    >
      {filterDef.extractOptions(data).map(option => (
        <Select.Option key={option} value={option}>
          {option}
        </Select.Option>
      ))}
    </Select>
  );
}

function RackRangeFilter({ defaultValue, filterDef, onChange, data }) {
  return (
    <GridRangeSelector
      initialValue={defaultValue}
      onChange={r => onChange({ [filterDef.fieldName]: r })}
    />
  );
}

function TextFilter({ filterDef, onChange, data }) {
  return (
    <Input
      onChange={e => onChange({ [filterDef.fieldName]: e.target.value })}
    />
  );
}

function Filter(props) {
  const { type } = props.filterDef;
  return type === "range" ? (
    <RangeFilter {...props} />
  ) : type === "select" ? (
    <SelectFilter {...props} />
  ) : type === "nullable-range" ? (
    <NullableRangeFilter {...props} />
  ) : type === "text" ? (
    <TextFilter {...props} />
  ) : type === "rack-range" ? (
    <RackRangeFilter {...props} />
  ) : null;
}

export default Filter;
