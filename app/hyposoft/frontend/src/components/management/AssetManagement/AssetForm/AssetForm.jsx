import React, { useState } from "react";
import { Formik } from "formik";
import { Form, Button, Typography, Row, Col } from "antd";
import ItemWithLabel from "../../../utility/formik/ItemWithLabel";
import SubmitButton from "../../../utility/formik/SubmitButton";
import InputNumber from "../../../utility/formik/InputNumber";
import Input from "../../../utility/formik/Input";
import TextArea from "../../../utility/formik/TextArea";
import VSpace from "../../../utility/VSpace";
import Select from "../../../utility/formik/Select";
import { getModel, getModelPicklist } from "../../../../api/model";
import { getSites } from "../../../../api/site";
import { getUserList } from "../../../../api/auth";
import { getRackList } from "../../../../api/rack";
import {
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  decommissionAsset,
} from "../../../../api/asset";
import PowerPortSelect from "./PowerPortSelect";
import { schema } from "./AssetSchema";
import ModelSelect from "./ModelSelect";
import SiteSelect from "./SiteSelect";
import RackSelect from "./RackSelect";
import NetworkGraph from "./NetworkGraph";
import NetworkPortSelect from "./NetworkPortSelect";
import LocationSelect from "./LocationSelect";
import { powerPortList } from "../../../../api/power";
import { useHistory, useLocation } from "react-router-dom";
import NetworkPowerActionButtons from "../NetworkPowerActionButtons";
import useRedirectOnCPChange from "../../../utility/useRedirectOnCPChange";

function AssetForm({ id }) {
  const history = useHistory();
  const query = Object.fromEntries(
    new URLSearchParams(useLocation().search).entries(),
  );

  const [asset, setAsset] = useState(null);
  const [modelPickList, setModelPickList] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [siteList, setSiteList] = useState([]);
  const [rackList, setRackList] = useState([]);
  const [powerPorts, setPowerPorts] = useState([]);
  const [users, setUsers] = useState([]);

  useRedirectOnCPChange("/assets");

  React.useEffect(() => {
    (async () => {
      await Promise.all([
        getModelPicklist().then(setModelPickList),
        getSites().then(setSiteList),
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
    if (asset?.location?.site) handleSiteSelect(asset.location.site);
    if (asset?.rack) handleRackSelect(asset.rack);
  }, [asset]);

  async function handleModelSelect(id) {
    const model = await getModel(id);
    setSelectedModel(model);
    return model;
  }

  function handleSiteSelect(id) {
    if (id) {
      return getRackList(id).then(setRackList);
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

  async function handleUpdate(fields) {
    const { id: newID } = await updateAsset(id, fields);
    window.location.href = `/#/assets/${newID}`;
  }

  async function handleDelete() {
    await deleteAsset(id);
    history.push("/assets");
  }

  async function handleDecommission() {
    await decommissionAsset(id);
    history.push("/assets");
  }

  return asset ? (
    <div>
      {asset.power_state != null && (
        <div>
          <NetworkPowerActionButtons assetID={asset.id} displayState />
          <VSpace height="16px" />
        </div>
      )}
      <Row>
        <Col md={8}>
          <Formik
            validationSchema={schema}
            initialValues={asset}
            initialErrors={query}
            initialTouched={query}
            onSubmit={id ? handleUpdate : handleCreate}
          >
            {props => (
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
                  {selectedModel?.id && (
                    <a href={`/#/models/${selectedModel.id}`}>
                      View model details
                    </a>
                  )}
                </ItemWithLabel>

                <ItemWithLabel name="location.tag" label="Location">
                  <LocationSelect name="location.tag" />
                </ItemWithLabel>

                {props.values.location.tag === "rack-mount" ? (
                  <div>
                    <ItemWithLabel name="site" label="Site">
                      <SiteSelect
                        siteList={siteList}
                        handleSiteSelect={handleSiteSelect}
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
                  </div>
                ) : props.values.location.tag === "chassis-mount" ? (
                  <div>
                    <ItemWithLabel name="location.site" label="Site">
                      <SiteSelect
                        siteList={siteList}
                        handleSiteSelect={handleSiteSelect}
                      />
                    </ItemWithLabel>
                  </div>
                ) : props.values.location.tag === "offline" ? (
                  <div>
                    <ItemWithLabel name="location.site" label="Site">
                      <SiteSelect
                        siteList={siteList}
                        handleSiteSelect={handleSiteSelect}
                      />
                    </ItemWithLabel>
                  </div>
                ) : null}

                <ItemWithLabel
                  name="power_connections"
                  label="Power connections"
                >
                  <PowerPortSelect powerPorts={powerPorts} />
                </ItemWithLabel>

                <ItemWithLabel name="network_ports" label="Network ports" flip>
                  <NetworkPortSelect selectedModel={selectedModel} />
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
                  <VSpace height="16px" />
                </SubmitButton>

                {id && (
                  <>
                    <VSpace height="16px" />
                    <Button ghost type="danger" onClick={handleDelete} block>
                      Delete
                    </Button>
                    <VSpace height="16px" />
                    <Button
                      ghost
                      type="primary"
                      onClick={() => {
                        if (confirm("You sure?")) {
                          handleDecommission();
                        }
                      }}
                      block
                    >
                      Decommission
                    </Button>
                  </>
                )}
              </Form>
            )}
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
  ) : null;
}

export default AssetForm;
