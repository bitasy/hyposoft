import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Typography, Button, Divider, Input } from "antd";
import {
  executeChangePlan,
  updateChangePlan,
  getChangePlanDetail,
} from "../../../api/changeplan";
import moment from "moment";
import Diff from "../../utility/Diff";
import Diff0 from "../../utility/Diff";
import { ChangePlanContext } from "../../../contexts/contexts";

const ASSET_HEADERS = [
  {
    name: "asset #",
    toText: ad => ad.asset_number,
  },
  {
    name: "hostname",
    toText: ad => ad.hostname ?? "",
  },
  {
    name: "model",
    toText: ad =>
      (({ vendor, model_number }) => `${model_number} by ${vendor}`)(
        ad.itmodel,
      ),
  },
  {
    name: "location",
    toText: ad =>
      `${ad.datacenter.abbr}: Rack ${ad.rack.rack}U${ad.rack_position}`,
  },
  {
    name: "power conn.",
    toText: ad =>
      ad.power_connections
        .map(({ label }) => label)
        .sort()
        .join("\n"),
  },
  {
    name: "network conn.",
    toText: ad =>
      ad.network_ports
        .map(
          ({ label, connection_str }) =>
            `${label} -> ${connection_str ?? "(Nothing)"}`,
        )
        .join("\n"),
  },
  {
    name: "comment",
    toText: ad => ad.comment ?? "",
  },
  {
    name: "owner",
    toText: ad => ad.owner?.username ?? "",
  },
];

function ChangePlanDetail() {
  const { id } = useParams();

  const history = useHistory();

  const { setChangePlan: setGlobalChangePlan } = React.useContext(
    ChangePlanContext,
  );

  const [changePlan, setChangePlan] = React.useState(null);

  React.useEffect(() => {
    getChangePlanDetail(id).then(setChangePlan);
  }, [id]);

  if (!changePlan) return null;

  function openWorkOrder() {
    window.open("/#/changeplan/workorder?cp_id=" + id);
  }

  async function onUpdate(newName) {
    await updateChangePlan(id, newName);
    setChangePlan({
      ...changePlan,
      name: newName,
    });
  }

  async function execute() {
    await executeChangePlan(id);
    history.push("/changeplan");
  }

  const summaryHeaders = ASSET_HEADERS.map(({ name }) => name);

  const summaryDiff0 = function() {
    let diffList = [];
    let diffType;
    for (diffType in changePlan.diffs) {
      let diff;
      for (diff in changePlan.diffs[diffType]) {
        diffList.push({
          diffType: diffType,
          message: changePlan.diffs[diffType][diff]["message"],
        });
      }
    }

    return diffList;
  };

  const summaryDiff = changePlan.diffs.map(({ live, cp, conflicts }) => {
    const before =
      live != null ? ASSET_HEADERS.map(({ toText }) => toText(live)) : null;

    const after =
      cp != null ? ASSET_HEADERS.map(({ toText }) => toText(cp)) : null;

    const error =
      conflicts.length == 0
        ? null
        : conflicts
            .map(({ field, message }) => `${field}: ${message}`)
            .join("\n");

    const action =
      conflicts.length == 0
        ? null
        : {
            name: "Fix it",
            onClick: () => {
              const id = before.id && after.id;
              setGlobalChangePlan({ id: changePlan.id, name: changePlan.name });
              history.push(
                `/assets/${id}?${conflicts.map({ field, message }).join("&")}`,
              );
            },
          };

    return {
      before,
      after,
      error,
      warning: null,
      action,
    };
  });

  return (
    <div>
      <Typography.Title level={3}>Change Plan Details</Typography.Title>

      <Divider />

      <Typography.Title level={4}>Basic Info!</Typography.Title>
      <Typography.Text>Name: </Typography.Text>
      <Typography.Text editable={{ onChange: onUpdate }}>
        {changePlan?.name ?? ""}
      </Typography.Text>
      {changePlan?.executed_at && (
        <Typography.Paragraph style={{ color: "blue" }}>
          Executed on {changePlan?.executed_at}
        </Typography.Paragraph>
      )}

      <Divider />

      <Typography.Title level={4}>Change Summary</Typography.Title>

      {/*<Diff0 messages={summaryDiff0()} />*/}

      <Diff
        headers={summaryHeaders}
        diff={summaryDiff}
        beforeText="Live"
        afterText="Plan"
      />

      <Divider />

      <Button
        type="primary"
        onClick={execute}
        disabled={changePlan?.executed_at}
      >
        Execute
      </Button>
      <Button onClick={openWorkOrder}>Work Order</Button>
    </div>
  );
}

export default ChangePlanDetail;
