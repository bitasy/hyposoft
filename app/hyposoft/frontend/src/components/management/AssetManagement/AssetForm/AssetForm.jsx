import React, { useState } from "react";
import { Formik } from "formik";
import { Form, Button, Typography, Row, Col, Divider } from "antd";
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
import {
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  decommissionAsset,
} from "../../../../api/asset";
import { schema } from "./AssetSchema";
import NetworkGraph from "./NetworkGraph";
import LocationTypeSelect from "./LocationTypeSelect";
import { useHistory, useLocation } from "react-router-dom";
import NetworkPowerActionButtons from "../NetworkPowerActionButtons";
import useRedirectOnCPChange from "../../../utility/useRedirectOnCPChange";
import RackMounts from "./RackMounts";
import ChassisMounts from "./ChassisMounts";
import Offline from "./Offline";
import ColorPicker from "../../ModelManagement/ModelForm/ColorPicker";

function AssetForm({ id }) {
  const history = useHistory();
  const query = Object.fromEntries(
    new URLSearchParams(useLocation().search).entries(),
  );

  const [asset, setAsset] = useState(null);
  const [modelPickList, setModelPickList] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [siteList, setSiteList] = useState([]);
  const [users, setUsers] = useState([]);

  useRedirectOnCPChange("/assets");

  React.useEffect(() => {
    getModelPicklist().then(setModelPickList);
    getSites().then(setSiteList);
    getUserList().then(setUsers);

    if (id) {
      getAsset(id).then(setAsset);
    } else {
      setAsset(schema.default());
    }
  }, []);

  React.useEffect(() => {
    if (asset?.itmodel) handleModelSelect(asset.itmodel);
  }, [asset?.itmodel]);

  async function handleModelSelect(id) {
    const model = await getModel(id);
    setSelectedModel(model);
    return model;
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
                  <Select
                    name="itmodel"
                    options={modelPickList.map(({ id, str }) => {
                      return { value: id, text: str };
                    })}
                    onChange={handleModelSelect}
                  />
                  {selectedModel?.id && (
                    <a href={`/#/models/${selectedModel.id}`}>
                      View model details
                    </a>
                  )}
                </ItemWithLabel>

                <Divider />

                <p>Model Overrides</p>

                <ItemWithLabel name="display_color" label="Display Color">
                  <ColorPicker name="display_color" nullable />
                </ItemWithLabel>

                <ItemWithLabel name="cpu" label="CPU">
                  <Input name="cpu" />
                </ItemWithLabel>

                <ItemWithLabel name="memory" label="Memory">
                  <InputNumber name="memory" />
                </ItemWithLabel>

                <ItemWithLabel name="storage" label="Storage">
                  <Input name="storage" />
                </ItemWithLabel>

                <Divider />

                <ItemWithLabel name="location.tag" label="Location">
                  <LocationTypeSelect model={selectedModel} />
                </ItemWithLabel>

                {props.values.location.tag === "rack-mount" ? (
                  <RackMounts siteList={siteList} model={selectedModel} />
                ) : props.values.location.tag === "chassis-mount" ? (
                  <ChassisMounts siteList={siteList} />
                ) : props.values.location.tag === "offline" ? (
                  <Offline siteList={siteList} />
                ) : null}

                <Divider />

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
