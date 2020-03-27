import React, { useState } from "react";
import { Formik } from "formik";
import { Form, Button, Typography, Row, Col } from "antd";
import ItemWithLabel from "../../../utility/formik/ItemWithLabel";
import SubmitButton from "../../../utility/formik/SubmitButton";
import InputNumber from "../../../utility/formik/InputNumber";
import Input from "../../../utility/formik/Input";
import TextArea from "../../../utility/formik/TextArea";
import { DisableContext, AuthContext } from "../../../../contexts/Contexts";
import VSpace from "../../../utility/VSpace";
import Select from "../../../utility/formik/Select";
import { getModel, getModelPicklist } from "../../../../api/model";
import { getDatacenters } from "../../../../api/datacenter";
import { getUserList } from "../../../../api/auth";
import { getRackList } from "../../../../api/rack";
import {
  networkPortList,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../../../../api/asset";
import PowerPortSelect from "./PowerPOrtSelect";
import { schema } from "./AssetSchema";
import ModelSelect from "./ModelSelect";
import DatacenterSelect from "./DatacenterSelect";
import RackSelect from "./RackSelect";
import NetworkGraph from "./NetworkGraph";
import NetworkPortSelect from "./NetworkPortSelect";
import { powerPortList } from "../../../../api/power";
import FormDebugger from "../../../utility/formik/FormDebugger";
import { useHistory } from "react-router-dom";

function AssetForm({ id }) {
  const history = useHistory();

  const { user } = React.useContext(AuthContext);
  const isAdmin = user?.is_staff;

  const [asset, setAsset] = useState(null);
  const [modelPickList, setModelPickList] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [dcList, setDCList] = useState([]);
  const [rackList, setRackList] = useState([]);
  const [powerPorts, setPowerPorts] = useState([]);
  const [networkPorts, setNetworkPorts] = useState([]);
  const [users, setUsers] = useState([]);

  React.useEffect(() => {
    (async () => {
      await Promise.all([
        getModelPicklist().then(setModelPickList),
        getDatacenters().then(setDCList),
        getUserList().then(setUsers),
      ]);

      if (id) {
        getAsset(id).then(setAsset);
      } else {
        setAsset(schema.default());
      }
    })();
  }, []);

  React.useEffect(() => {
    if (asset?.itmodel) handleModelSelect(asset.itmodel);
    if (asset?.datacenter) handleDCSelect(asset.datacenter);
    if (asset?.rack) handleRackSelect(asset.rack);
  }, [asset]);

  function handleModelSelect(id) {
    return getModel(id).then(setSelectedModel);
  }

  function handleDCSelect(id) {
    const dcName = dcList.find(dc => dc.id == id)?.abbr;
    if (dcName) {
      return Promise.all([
        getRackList(dcName).then(setRackList),
        networkPortList(dcName).then(setNetworkPorts),
      ]);
    } else {
      return Promise.resolve();
    }
  }

  function handleRackSelect(id) {
    return powerPortList(id).then(setPowerPorts);
  }

  // submit

  async function handleCreate(fields) {
    await createAsset(fields);
    history.push("/assets");
  }

  function handleUpdate(fields) {
    updateAsset(id, fields);
  }

  async function handleDelete() {
    await deleteAsset(id);
    history.push("/models");
  }

  return asset ? (
    <DisableContext.Provider value={!isAdmin}>
      <div>
        <Row>
          <Col md={8}>
            <Formik
              validationSchema={schema}
              initialValues={asset}
              onSubmit={id ? handleUpdate : handleCreate}
            >
              <Form>
                <ItemWithLabel name="asset_number" label="Asset #">
                  <InputNumber name="asset_number" min={100000} max={999999} />
                </ItemWithLabel>

                <ItemWithLabel name="hostname" label="Hostname">
                  <Input name="hostname" />
                </ItemWithLabel>

                <ItemWithLabel name="itmodel" label="Model">
                  <ModelSelect
                    modelPickList={modelPickList}
                    handleModelSelect={handleModelSelect}
                  />
                </ItemWithLabel>

                <ItemWithLabel name="datacenter" label="Datacenter">
                  <DatacenterSelect
                    dcList={dcList}
                    handleDCSelect={handleDCSelect}
                  />
                </ItemWithLabel>

                <ItemWithLabel name="rack" label="Rack">
                  <RackSelect
                    rackList={rackList}
                    handleRackSelect={handleRackSelect}
                  />
                </ItemWithLabel>

                <ItemWithLabel name="rack_position" label="Rack Position">
                  <InputNumber name="rack_position" min={1} max={42} />
                </ItemWithLabel>

                <ItemWithLabel
                  name="power_connections"
                  label="Power connections"
                >
                  <PowerPortSelect powerPorts={powerPorts} />
                </ItemWithLabel>

                <ItemWithLabel name="network_ports" label="Network ports">
                  <NetworkPortSelect
                    selectedModel={selectedModel}
                    networkPorts={networkPorts}
                  />
                </ItemWithLabel>

                <ItemWithLabel name="owner" label="Owner">
                  <Select
                    name="owner"
                    options={users.map(({ id, username }) => {
                      return { value: id, text: username };
                    })}
                  />
                </ItemWithLabel>

                <ItemWithLabel name="comment" label="Comment">
                  <TextArea name="comment" rows={5} />
                </ItemWithLabel>

                <SubmitButton ghost type="primary" block>
                  {id ? "Update" : "Create"}
                </SubmitButton>

                {id && (
                  <>
                    <VSpace height="16px" />
                    <Button ghost type="danger" onClick={handleDelete} block>
                      Delete
                    </Button>
                  </>
                )}
                <FormDebugger />
              </Form>
            </Formik>
          </Col>
        </Row>

        {id && (
          <div>
            <VSpace height="32px" />
            <Typography.Title level={4}>Network graph</Typography.Title>
            <NetworkGraph assetID={id} networkGraph={asset.network_graph} />
          </div>
        )}
      </div>
    </DisableContext.Provider>
  ) : null;
}

export default AssetForm;
