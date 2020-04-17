import React from "react";
import { getAsset } from "../../../api/asset";
import { getRackViewData } from "../../../api/report";
import { Typography, Alert } from "antd";
import { useHistory } from "react-router-dom";
import s from "./ChassisView.module.css";

// provide either of these two
function ChassisView({ assetID }) {
  const history = useHistory();

  const [isInOffline, setIsInOffline] = React.useState(false);
  const [chassis, setChassis] = React.useState([]);
  const [blades, setBlades] = React.useState([]);

  React.useEffect(() => {
    if (assetID) {
      (async () => {
        const asset = await getAsset(assetID);
        const rack = asset?.location.rack;
        if (rack) {
          const rackViewData = (await getRackViewData(rack)).assets;

          const chassis = rackViewData.find(
            ({ model, asset: a }) =>
              model.type === "chassis" &&
              (a.id === asset.id || asset.id === asset.location.asset),
          );

          const blades = rackViewData.filter(
            ({ model, asset: a }) =>
              model.type === "blade" && a.location.asset === chassis?.id,
          );

          setChassis(chassis);
          setBlades(blades);
        } else {
          setIsInOffline(!rack);
        }
      })();
    }
  }, [assetID]);

  return (
    <div>
      <Typography.Title level={4}>Chassis View</Typography.Title>
      {isInOffline ? (
        <Alert
          message="This asset is in offline storage"
          type="info"
          showIcon
        />
      ) : chassis ? (
        <table>
          <thead>
            <tr>
              <th
                colSpan={14}
                style={{
                  backgroundColor:
                    chassis.asset.display_color || chassis.model.display_color,
                }}
                className={s.clickable}
                onClick={() => history.push(`/assets/${chassis.asset.id}`)}
              >
                Chassis{" "}
                {`${chassis.asset.id === assetID ? "*" : ""} (${chassis.asset
                  .hostname || chassis.asset.asset_number})`}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {Array(14)
                .fill(null)
                .map((v, idx) => {
                  const blade = blades.find(
                    ({ asset }) => asset.location.slot === idx + 1,
                  );
                  if (blade) {
                    const { model, asset } = blade;
                    return (
                      <td
                        style={{
                          backgroundColor:
                            asset.display_color || model.display_color,
                        }}
                        onClick={() => history.push(`/assets/${asset.id}`)}
                        className={s.clickable}
                      >
                        {asset.id === assetID ? "*" : ""}
                      </td>
                    );
                  } else {
                    return <td />;
                  }
                })}
            </tr>
          </tbody>
        </table>
      ) : (
        <Alert message="This asset is a regular mount" type="info" showIcon />
      )}
    </div>
  );
}

export default ChassisView;
