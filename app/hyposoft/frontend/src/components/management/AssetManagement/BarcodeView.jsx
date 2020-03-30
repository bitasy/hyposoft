import React from "react";
import Barcode from "react-barcode";
import { useLocation, useHistory } from "react-router-dom";
import { Row, Col, Button, Icon, Typography } from "antd";
import ReactToPrint from "react-to-print";
import { PrinterOutlined } from "@ant-design/icons";

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
function CreateBarcodeLabel( {assetNumber} ) {
    return (
        <div>
            <Barcode
                value={assetNumber}
                format={"CODE128C"}
                displayValue={false}
            >
            </Barcode>
            <div>
                Hyposoft {assetNumber}
            </div>
        </div>
    );
}

//function to add multiple barcodes to a page
function BarcodeView({ r }) {
    const numbersStr = new URLSearchParams(useLocation().search).get("asset_numbers");

    const history = useHistory();

    const assetNumbers = numbersStr.split(",").map(s => parseInt(s));
    //const testAssetNumbers = ["100000", "100001", "100002", "100003", "100004"]; //working
    console.log(assetNumbers);

    const barcodeSplit = partition(assetNumbers, BARCODES_IN_ROW);
    //const barcodeSplit = partition(testAssetNumbers, BARCODES_IN_ROW);

    let counter = 0;

    return (
        <div ref={r}>
            {barcodeSplit.map((row, rIdx) => (
                <Row
                    key={rIdx}
                    type="flex"
                    justify="left"
                    gutter={16}
                    style={{
                        pageBreakAfter: "always",
                        paddingTop: 16,
                        paddingBottom: 16,
                        height: "100%",
                    }}
                >
                    {row.map((asset, idx) => (
                        <Col
                            key={idx}
                            style={{
                                marginTop: "auto",
                                marginBottom: "auto",
                            }}
                        >
                           {/*<CreateBarcodeLabel assetNumber={assetNumbers[counter++]} />*/}
                           {/*<CreateBarcodeLabel assetNumber={testAssetNumbers[counter++]} />*/}
                            <CreateBarcodeLabel assetID={assetNumber} />
                        </Col>
                    ))}
                </Row>
            ))}
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
