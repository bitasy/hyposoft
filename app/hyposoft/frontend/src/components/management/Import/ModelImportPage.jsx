import React from "react";
import { importModels } from "../../../api/bulk";
import ImportPage from "./ImportPage";

function ModelImportPage() {
  return <ImportPage name="Models" importFn={importModels} />;
}

export default ModelImportPage;
