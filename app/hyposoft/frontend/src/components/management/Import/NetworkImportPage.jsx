import React from "react";
import ImportPage from "./ImportPage";
import { importNetwork } from "../../../api/bulk";

function NetworkImportPage() {
  return <ImportPage title="Import Network" importData={importNetwork} />;
}

export default NetworkImportPage;
