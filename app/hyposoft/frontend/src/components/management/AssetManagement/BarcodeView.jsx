import React from "react";
import Barcode from "react-barcode";
import { useLocation } from "react-router-dom";
import { Row, Col, Button, Typography } from "antd";
import ReactToPrint from "react-to-print";
import { PrinterOutlined } from "@ant-design/icons";
import { getAssetList } from "../../../api/asset";
import VSpace from "../../utility/VSpace";

const BARCODES_IN_ROW = 4;

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

//function to create one barcode label
function CreateBarcodeLabel({ assetNumber }) {
  return (
    <div style={{ textAlign: "center" }}>
      <Barcode
        value={assetNumber.toString()}
        format={"CODE128C"}
        displayValue={false}
      />
      <p>Hyposoft {assetNumber}</p>
    </div>
  );
}

//function to add multiple barcodes to a page
function BarcodeView({ r }) {
  const assetIDsStr = new URLSearchParams(useLocation().search).get(
    "asset_ids",
  );

  const assetIDs = assetIDsStr
    .split(",")
    .map(id => parseInt(id))
    .filter(n => !isNaN(n));

  const [assets, setAssets] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const { results } = await getAssetList({ pageSize: 1000000000 });
      const selectedAssets = assetIDs
        .map(id => results.find(({ id: rid }) => id == rid))
        .filter(b => !!b);
      setAssets(selectedAssets);
    })();
  }, []);

  return (
    <div ref={r}>
      <Row>
        {assets.map((asset, rIdx) => (
          <Col span={6} key={rIdx}>
            <CreateBarcodeLabel assetNumber={asset.asset_number} />
          </Col>
        ))}
      </Row>
    </div>
  );
}

const BarcodeViewWithRef = React.forwardRef((props, ref) => (
  <BarcodeView {...props} r={ref} />
));

function PrintableBarcodeView() {
  const componentRef = React.useRef();
  return (
    <div style={{ padding: 16 }}>
      <Typography.Title>Printable Barcode View</Typography.Title>
      <ReactToPrint
        trigger={() => (
          <Button style={{ margin: 16 }}>
            <PrinterOutlined />
          </Button>
        )}
        content={() => componentRef.current}
      />
      <BarcodeViewWithRef ref={componentRef} />
    </div>
  );
}

export default PrintableBarcodeView;
