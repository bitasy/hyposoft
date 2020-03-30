import React from "react";
import { importNetwork } from "../../../api/bulk";
import ImportPage from "./ImportPage";

function NetworkImportPage() {
  return <ImportPage name="Network" importFn={importNetwork} />;
}

export default NetworkImportPage;
