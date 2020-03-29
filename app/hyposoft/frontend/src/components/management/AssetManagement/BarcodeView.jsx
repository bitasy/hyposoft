import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Row, Col, Button, Icon, Typography } from "antd";
import ReactToPrint from "react-to-print";
//import { getBarcodeViewData } from "../../../api/";
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

function BarcodeView( {r} ) {

    const BarcodeViewWithRef = React.forwardRef((props, ref) => (
    <BarcodeView {...props} r={ref} />
));

    return (
        <div style={{ padding: 16 }}>
            <Typography.Title>Printable Barcode View</Typography.Title>
            <ReactToPrint
                trigger={() => (
                    <Button style={{ margin: 16 }}>
                        <PrinterOutlined />
                    </Button>
                )}
                //content={() => componentRef.current}
            />
            {/*<BarcodeViewWithRef ref={componentRef} />*/}
        </div>
    );
}

export default BarcodeView;

//
// function BarcodeView({ r }) {
//     const idsStr = new URLSearchParams(useLocation().search).get("ids");
//
//     const history = useHistory();
//
//     const rackIDs = idsStr.split(",").map(s => parseInt(s));
//
//     const [rackVMs, setRackVMs] = React.useState([]);
//
//     React.useEffect(() => {
//         getBarcodeViewData(rackIDs).then(data => {
//             setRackVMs(
//                 rackIDs.map(id => {
//                     const { rack, assets } = data[id];
//                     return {
//                         name: rack.rack,
//                         height: 42,
//                         assets,
//                     };
//                 }),
//             );
//         });
//     }, [idsStr]);
//
//     const barcodeVMSplit = partition(rackVMs, BARCODES_IN_ROW);
//
//     return (
//         <div ref={r}>
//             {barcodeVMSplit.map((row, rIdx) => (
//                 <Row
//                     key={rIdx}
//                     type="flex"
//                     justify="center"
//                     gutter={16}
//                     style={{
//                         pageBreakAfter: "always",
//                         paddingTop: 16,
//                         paddingBottom: 16,
//                         height: "100%",
//                     }}
//                 >
//                     {row.map((rackVM, idx) => (
//                         <Col
//                             key={idx}
//                             style={{
//                                 marginTop: "auto",
//                                 marginBottom: "auto",
//                             }}
//                         >
//                             <Rack
//                                 rack={rackVM}
//                                 onSelect={asset => {
//                                     if (asset) {
//                                         history.push(`/assets/${asset.id}`);
//                                     }
//                                 }}
//                             />
//                         </Col>
//                     ))}
//                 </Row>
//             ))}
//         </div>
//     );
// }
//
// const BarcodeViewWithRef = React.forwardRef((props, ref) => (
//     <BarcodeView {...props} r={ref} />
// ));
//
// function PrintableBarcodeView() {
//     const componentRef = React.useRef();
//     return (
//         <div style={{ padding: 16 }}>
//             <Typography.Title>Printable Barcode View</Typography.Title>
//             <ReactToPrint
//                 trigger={() => (
//                     <Button style={{ margin: 16 }}>
//                         <PrinterOutlined />
//                     </Button>
//                 )}
//                 content={() => componentRef.current}
//             />
//             <BarcodeViewWithRef ref={componentRef} />
//         </div>
//     );
// }
//
// export default PrintableBarcodeView;
