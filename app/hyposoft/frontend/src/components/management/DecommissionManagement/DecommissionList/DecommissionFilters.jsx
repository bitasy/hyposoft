import React from "react";
import { Formik, Field } from "formik";
import { Form, Collapse, Row, Col, Calendar } from "antd";
import VSpace from "../../../utility/VSpace";
import RangeSlider from "../../../utility/formik/RangeSlider";
import ItemWithLabel from "../../../utility/formik/ItemWithLabel";
import Input from "../../../utility/formik/Input";
import FormDebugger from "../../../utility/formik/FormDebugger";

// Props
/*
  initialFilterValues: {
    search: string,
    time_from: string,
    time_to: string,
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
                <ItemWithLabel name="search" label="Search Owners">
                  <Input name="search" />
                </ItemWithLabel>

                <VSpace height="8px" />

                <ItemWithLabel name="timestamp_from" label="Time from:">
                  <Field>
                    {({ form }) => (
                      <Calendar
                        fullscreen={false}
                        onSelect={m => {
                          form.setFieldValue("timestamp_from", m.toISOString());
                        }}
                      />
                    )}
                  </Field>
                </ItemWithLabel>

                <VSpace height="8px" />

                <ItemWithLabel name="timestamp_to" label="Time to:">
                  <Field>
                    {({ form }) => (
                      <Calendar
                        fullscreen={false}
                        onSelect={m => {
                          form.setFieldValue("timestamp_to", m.toISOString());
                        }}
                      />
                    )}
                  </Field>
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
