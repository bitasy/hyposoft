import React from "react";
import { Formik } from "formik";
import { Form, Collapse, Row, Col, Calendar } from "antd";
import VSpace from "../../../utility/VSpace";
import RangeSlider from "../../../utility/formik/RangeSlider";
import ItemWithLabel from "../../../utility/formik/ItemWithLabel";
import Input from "../../../utility/formik/Input";

// Props
/*
  initialFilterValues: {
    search: string,
    rack_from: string,
    rack_to: string,
    rack_position: [number, number],
  }
*/
// onChange: (an object with the same form as the initialFilterValues) => void

function DecommissionFilters({ initialFilterValues, onChange }) {
    return (
        <Collapse>
            <Collapse.Panel header="Filters">
                <Formik
                    initialValues={initialFilterValues}
                    validateOnChange
                    validate={onChange} // sigh
                >
                    <Form>
                        <Row>
                            <Col md={8}>
                                <ItemWithLabel
                                    name="search"
                                    label="Search Owners"
                                >
                                    <Input name="search" />
                                </ItemWithLabel>

                                <VSpace height="8px" />

                                <ItemWithLabel
                                    name="time_from"
                                    label="Time from:"
                                >
                                    <Calendar
                                        //dateFullCellRender={}
                                        fullscreen={false}
                                        //onPanelChange={}
                                        onSelect={}
                                    />
                                    <Input name="time_from" />
                                </ItemWithLabel>

                                <VSpace height="8px" />

                                <ItemWithLabel
                                    name="time_to"
                                    label="Time to:"
                                >
                                    <Calendar
                                        //dateFullCellRender={}
                                        fullscreen={false}
                                        //onPanelChange={}
                                        //onSelect={}
                                    />
                                    <Input name="time_to" />
                                </ItemWithLabel>

                                <VSpace height="8px" />

                            </Col>
                        </Row>
                    </Form>
                </Formik>
            </Collapse.Panel>
        </Collapse>
    );
}

export default DecommissionFilters;
