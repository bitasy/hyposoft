import React from "react";
import { Typography } from "antd";
import API from "../../../api/API";
import Graph from "react-graph-vis";

const options = {
  layout: {
    hierarchical: false
  },
  edges: {
    color: "#000000",
    arrows: {
      to: {
        enabled: false
      }
    }
  },
  height: "500px",
  physics: {
    enabled: false
  },
  interaction: {
    hoverConnectedEdges: false,
    selectConnectedEdges: false,
    zoomView: false
  }
};

const MAIN_COLOR = "#e04141";
const OTHER_COLOR = "#7be041";

const events = {
  select: ({ nodes }) => {
    const node = nodes[0];
    if (node) {
      window.location.href = `/#/assets/${node}`;
    }
  }
};

function process(assetID, rawGraph) {
  const { verticies, edges } = rawGraph;
  function mapVertex(v) {
    const isMain = v.id == assetID;

    return {
      id: v.id,
      label: (v.hostname || v.asset_number) + (isMain ? " ☆" : ""),
      color: v.itmodel["display_color"]
    };
  }

  function mapEdge(e) {
    return {
      from: e[0],
      to: e[1]
    };
  }

  return {
    nodes: verticies.map(mapVertex),
    edges: edges.map(mapEdge)
  };
}

function NetworkGraph({ assetID }) {
  const [graph, setGraph] = React.useState(null);
  React.useEffect(() => {
    API.getNetworkGraph(assetID)
      .then(g => process(assetID, g))
      .then(setGraph);
  }, [assetID]);

  return (
    <div>
      <Typography.Title level={4}>Network Graph</Typography.Title>
      {graph ? <Graph options={options} graph={graph} events={events} /> : null}
    </div>
  );
}

export default NetworkGraph;
