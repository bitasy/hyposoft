import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import Rack from "../shared/Rack";
import API from "../../../api/API";
import { Row, Col, Button, Icon, Typography } from "antd";
import ReactToPrint from "react-to-print";
import style from "./RackView.module.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchRacks, fetchInstances } from "../../../redux/actions";

function groupByID(racks) {
  return racks.reduce(
    (acc, rack) => Object.assign(acc, { [rack.id]: rack }),
    {}
  );
}

const RACKS_IN_ROW = 4;

function partition(arr, nPerArr) {
  const acc = [];
  let cur = [];
  for (let i = 0; i < arr.length; i++) {
    if (cur.length < nPerArr) {
      cur.push(arr[i]);
    } else {
      acc.push(cur);
      cur = [arr[i]];
    }
  }
  acc.push(cur);
  return acc;
}

function RackView({ r }) {
  const idsStr = new URLSearchParams(useLocation().search).get("ids");

  const history = useHistory();

  const rackIDs = idsStr.split(",").map(s => parseInt(s));

  const dispatch = useDispatch();

  const rackVMs = useSelector(s => {
    const racksByID = s.racks;
    const instancesForRack = rackIDs.map(rackID =>
      Object.values(s.instances).filter(inst => inst.rack.id === rackID)
    );

    return instancesForRack
      .map((instances, idx) => {
        const id = rackIDs[idx];
        return racksByID[id]
          ? {
              name: racksByID[id].row + racksByID[id].number,
              height: 42,
              instances: instances
            }
          : null;
      })
      .filter(o => !!o);
  });

  const rackVMSplit = partition(rackVMs, RACKS_IN_ROW);

  React.useEffect(() => {
    dispatch(fetchRacks());
    dispatch(fetchInstances());
  }, []);

  return (
    <div ref={r}>
      {rackVMSplit.map((row, rIdx) => (
        <Row
          key={rIdx}
          type="flex"
          justify="center"
          gutter={16}
          style={{ height: "27.9cm", padding: 24 }}
        >
          {row.map((rackVM, idx) => (
            <Col key={idx} span={5}>
              <Rack
                rack={rackVM}
                onSelect={instance => {
                  if (instance) {
                    history.push(`/instances/${instance.id}`);
                  }
                }}
              />
            </Col>
          ))}
        </Row>
      ))}
    </div>
  );
}

const RackViewWithRef = React.forwardRef((props, ref) => (
  <RackView {...props} r={ref} />
));

function PrintableRackView() {
  const componentRef = React.useRef();
  return (
    <div style={{ padding: 16 }}>
      <Typography.Title>Printable Rack View</Typography.Title>
      <ReactToPrint
        trigger={() => (
          <Button style={{ margin: 16 }}>
            <Icon type="printer" />
          </Button>
        )}
        content={() => componentRef.current}
      />
      <RackViewWithRef ref={componentRef} />
    </div>
  );
}

export default PrintableRackView;
