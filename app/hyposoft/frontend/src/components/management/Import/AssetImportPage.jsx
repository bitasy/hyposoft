import React from "react";
import { importAssets } from "../../../api/bulk";
import ImportPage from "./ImportPage";

function AssetImportPage() {
  return <ImportPage name="Assets" importFn={importAssets} />;
}

export default AssetImportPage;
