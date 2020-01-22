import React from "react";
import { Slider, Select, Checkbox, Input } from "antd";

function NullableRangeFilter({ filterDef, onChange, data }) {
  const defaultValue = filterDef.extractDefaultValue(data);

  const [filterValue, setFilterValue] = React.useState(defaultValue);
  React.useEffect(() => {
    setFilterValue(defaultValue);
  }, [data]);

  const [range, includeNull] = filterValue;

  return (
    <div>
      <Slider
        key={range}
        range
        {...filterDef}
        defaultValue={range}
        onAfterChange={v => {
          setFilterValue([v, includeNull]);
          onChange({ [filterDef.fieldName]: [v, includeNull] });
        }}
      />
      <span style={{ marginRight: 5 }}>Include Null?</span>
      <Checkbox
        defaultChecked={includeNull}
        onChange={e => {
          setFilterValue([range, e.target.checked]);
          onChange({ [filterDef.fieldName]: [range, e.target.checked] });
        }}
      />
    </div>
  );
}

function RangeFilter({ filterDef, onChange, data }) {
  return (
    <Slider
      key={data}
      range
      {...filterDef}
      defaultValue={filterDef.extractDefaultValue(data)}
      onAfterChange={v => onChange({ [filterDef.fieldName]: v })}
    />
  );
}

function SelectFilter({ filterDef, onChange, data }) {
  return (
    <Select
      key={data}
      mode="multiple"
      style={{ width: "100%" }}
      onChange={v => onChange({ [filterDef.fieldName]: v })}
      defaultValue={filterDef.extractDefaultValue(data)}
    >
      {filterDef.extractOptions(data).map(option => (
        <Select.Option key={option} value={option}>
          {option}
        </Select.Option>
      ))}
    </Select>
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
  ) : null;
}

export default Filter;
