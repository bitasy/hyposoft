import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import Rack from "../shared/Rack";
import { Row, Col, Button, Icon, Typography } from "antd";
import ReactToPrint from "react-to-print";
import { useDispatch, useSelector } from "react-redux";
import { fetchRacks } from "../../../redux/racks/actions";
import { fetchAssets } from "../../../redux/assets/actions";

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
    const assetsForRack = rackIDs.map(rackID =>
      Object.values(s.assets).filter(inst => inst.rack.id === rackID)
    );

    return assetsForRack
      .map((assets, idx) => {
        const id = rackIDs[idx];
        return racksByID[id]
          ? {
              name: racksByID[id].rack,
              height: 42,
              assets: assets
            }
          : null;
      })
      .filter(o => !!o);
  });

  const rackVMSplit = partition(rackVMs, RACKS_IN_ROW);

  React.useEffect(() => {
    dispatch(fetchRacks());
    dispatch(fetchAssets());
  }, []);

  return (
    <div ref={r}>
      {rackVMSplit.map((row, rIdx) => (
        <Row
          key={rIdx}
          type="flex"
          justify="center"
          gutter={16}
          style={{
            pageBreakAfter: "always",
            paddingTop: 16,
            paddingBottom: 16,
            height: "100%"
          }}
        >
          {row.map((rackVM, idx) => (
            <Col key={idx} style={{ marginTop: "auto", marginBottom: "auto" }}>
              <Rack
                rack={rackVM}
                onSelect={asset => {
                  if (asset) {
                    history.push(`/assets/${asset.id}`);
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