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

//function to create one label
//TODO: make assetID show up below next to Hyposoft, something with props?
function CreateBarcodeLabel( {assetID} ) {
    return (
        <div>
            <Barcode
                value={assetID}
                format={"CODE128C"}
                displayValue={false}
            >
            </Barcode>
            <div>
                Hyposoft {assetID}
            </div>
        </div>
    );
}

//
// function BarcodeView( {r} ) {
//
//     const BarcodeViewWithRef = React.forwardRef((props, ref) => (
//         <BarcodeView {...props} r={ref} />
//     ));
//
//     return (
//         <div style={{ padding: 16 }}>
//             <Typography.Title>Printable Barcode View</Typography.Title>
//             <ReactToPrint
//                 trigger={() => (
//                     <Button style={{ margin: 16 }}>
//                         <PrinterOutlined />
//                     </Button>
//                 )}
//                 //content={() => componentRef.current}
//             />
//             <BarcodeViewWithRef ref={componentRef} />
//             <div>
//                 <CreateBarcodeLabel value={100000} >
//                 </CreateBarcodeLabel>
//
//             </div>
//         </div>
//     );
// }
//
// export default BarcodeView;

//function to add multiple barcodes in a page to a page
function BarcodeView({ r }) {
    const idsStr = new URLSearchParams(useLocation().search).get("ids");

    const history = useHistory();

    //const assetIDs = idsStr.split(",").map(s => parseInt(s));
    const testAssetIDs = ["100000", "100001", "100002", "100003", "100004"];
    console.log(testAssetIDs);

    //const barcodeSplit = partition(assetIDs, BARCODES_IN_ROW);
    const barcodeSplit = partition(testAssetIDs, BARCODES_IN_ROW);
    let counter = 0;

    return (
        <div ref={r}>
            {counter = counter + 1}
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
                           {/*<CreateBarcodeLabel assetID={assetIDs[r]} />*/}
                           <CreateBarcodeLabel assetID={testAssetIDs[counter]} />
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
