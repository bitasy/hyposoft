import React from "react";
import { Typography, List, Card, Input, Button, Icon } from "antd";
import { useSelector, useDispatch } from "react-redux";
import {
  updateDatacenter,
  removeDatacenter,
  createDatacenter,
  switchDatacenter
} from "../../../redux/datacenters/actions";
import { GLOBAL_ABBR } from "../../../api/API";

function DatacenterCard({ dc, onUpdate, onRemove, disabled }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(null);

  React.useEffect(() => {
    setDraft({ ...dc });
  }, [dc.id, dc.name, dc.abbr]);

  function confirmUpdate() {
    onUpdate(draft);
    setIsEditing(false);
  }

  const Actions = isEditing
    ? [<Button onClick={confirmUpdate}>Confirm</Button>]
    : [];

  const ExtraButtons = (
    <>
      <Button
        size="small"
        shape="circle"
        onClick={() => setIsEditing(!isEditing)}
        disabled={disabled}
      >
        {isEditing ? <Icon type="close" /> : <Icon type="edit" />}
      </Button>
      <Button
        style={{ marginLeft: 4 }}
        size="small"
        shape="circle"
        type="danger"
        disabled={disabled}
        onClick={() => {
          if (confirm("You sure?")) {
            onRemove(dc.id, dc.abbr);
          }
        }}
      >
        <Icon type="delete" />
      </Button>
    </>
  );

  if (!draft) return null;

  return (
    <Card title={dc.abbr} extra={ExtraButtons} actions={Actions}>
      {isEditing ? (
        <>
          <h4>Name</h4>
          <Input
            size="small"
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
            onPressEnter={confirmUpdate}
          />
          <h4>Abbreviated Name</h4>
          <Input
            size="small"
            value={draft.abbr}
            onChange={e => setDraft({ ...draft, abbr: e.target.value })}
            onPressEnter={confirmUpdate}
          />
        </>
      ) : (
        <>
          <h4>Name</h4>
          <p>{dc.name}</p>
          <h4>Abbreviated Name</h4>
          <p>{dc.abbr}</p>
        </>
      )}
    </Card>
  );
}

function AddCard({ onCreate, disabled }) {
  return (
    <Card
      style={{ padding: 0, height: "100px" }}
      bodyStyle={{ padding: 0, width: "100%", height: "100%" }}
    >
      <Button
        style={{ width: "100%", height: "100%" }}
        onClick={onCreate}
        disabled={disabled}
      >
        <Icon type="plus" />
        Add Datacenter
      </Button>
    </Card>
  );
}

function GhostCard({ onCreate, onCancel }) {
  const [draft, setDraft] = React.useState({ name: "", abbr: "" });

  function confirmCreate() {
    onCreate(draft);
  }

  const Actions = [<Button onClick={confirmCreate}>Confirm</Button>];

  const ExtraButtons = (
    <Button
      style={{ marginLeft: 4 }}
      size="small"
      shape="circle"
      onClick={onCancel}
    >
      <Icon type="close" />
    </Button>
  );

  return (
    <Card title={draft.abbr} extra={ExtraButtons} actions={Actions}>
      <h4>Name</h4>
      <Input
        size="small"
        value={draft.name}
        onChange={e => setDraft({ ...draft, name: e.target.value })}
        onPressEnter={confirmCreate}
      />
      <h4>Abbreviated Name</h4>
      <Input
        size="small"
        value={draft.abbr}
        onChange={e => setDraft({ ...draft, abbr: e.target.value })}
        onPressEnter={confirmCreate}
      />
    </Card>
  );
}

function DatacenterManagementPage() {
  const [isAdding, setIsAdding] = React.useState(false);
  const showGhostCard = () => setIsAdding(true);
  const showAddCard = () => setIsAdding(false);

  const isAdmin = useSelector(s => s.currentUser.is_staff);

  const datacenters = useSelector(s => Object.values(s.datacenters));
  const dcName = useSelector(s => s.appState.dcName);
  const dispatch = useDispatch();

  function handleUpdate({ id, name, abbr }) {
    dispatch(updateDatacenter(id, { name, abbr }));
  }

  function handleDelete(id, abbr) {
    dispatch(
      removeDatacenter(id, () => {
        if (dcName === abbr) {
          dispatch(switchDatacenter(GLOBAL_ABBR));
        }
      })
    );
  }

  function handleCreate(fields) {
    dispatch(createDatacenter(fields, showAddCard));
  }

  function createGhost() {
    showGhostCard();
  }

  const dataSource = [...datacenters, isAdding ? "ghost" : "add"]; // the last one for +

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Datacenters</Typography.Title>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 6, xxl: 3 }}
        dataSource={dataSource}
        renderItem={dc => {
          switch (dc) {
            case "add":
              return (
                <List.Item>
                  <AddCard onCreate={createGhost} disabled={!isAdmin} />
                </List.Item>
              );
            case "ghost":
              return (
                <List.Item>
                  <GhostCard onCreate={handleCreate} onCancel={showAddCard} />
                </List.Item>
              );
            default:
              return (
                <List.Item>
                  <DatacenterCard
                    dc={dc}
                    onUpdate={handleUpdate}
                    onRemove={handleDelete}
                    disabled={!isAdmin}
                  />
                </List.Item>
              );
          }
        }}
      />
    </div>
  );
}

export default DatacenterManagementPage;
