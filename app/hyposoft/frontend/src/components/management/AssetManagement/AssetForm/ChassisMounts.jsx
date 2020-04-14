import React from "react";
import Select from "../../../utility/formik/Select";
import ItemWithLabel from "../../../utility/formik/ItemWithLabel";
import { getRackList } from "../../../../api/rack";
import { getRackViewData } from "../../../../api/report";
import InputNumber from "../../../utility/formik/InputNumber";

function ChassisMounts({ siteList }) {
  const { values } = useFormikContext();
  const { site, rack } = values.location;

  const [rackList, setRackList] = React.useState([]);
  const [chassisList, setChassisList] = React.useState([]);

  React.useEffect(() => {
    if (site) {
      getRackList(site).then(setRackList);
    }
  }, [site]);

  React.useEffect(() => {
    if (rack) {
      getRackViewData([rack]).then(res =>
        setChassisList(
          res[rack]
            .filter(({ model }) => model.type === "chassis")
            .map(({ asset }) => asset),
        ),
      );
    }
  }, [rack]);

  const siteOptions = siteList
    .filter(({ type }) => type === "datacenter")
    .map(({ id, name }) => {
      return { value: id, text: name };
    });

  const rackOptions = rackList.map(({ id, rack }) => {
    return { value: id, text: rack };
  });

  const chassisOptions = chassisList.map(({ id, hostname, asset_number }) => {
    return { value: id, text: hostname || asset_number.toString() };
  });

  return (
    <div>
      <ItemWithLabel name="location.site" label="Site">
        <Select name="location.site" options={siteOptions} />
      </ItemWithLabel>
      <ItemWithLabel name="location.rack" label="Rack">
        <Select name="location.rack" options={rackOptions} />
      </ItemWithLabel>
      <ItemWithLabel name="location.asset" label="Chassis">
        <Select name="location.asset" options={chassisOptions} />
      </ItemWithLabel>
      <ItemWithLabel name="location.slot" label="Slot">
        <InputNumber name="location.slot" min={1} max={14} />
      </ItemWithLabel>
    </div>
  );
}

export default ChassisMounts;
