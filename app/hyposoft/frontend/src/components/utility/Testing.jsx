import React from "react";
import Diff from "./Diff";

// diff: {
//   before: string[]
//   after: string[]
//   warning: string | null
//   error: string | null
// }[]
function Testing() {
  const headers = ["First name", "Last name"];
  const diff = [
    {
      before: ["Inchan", "Hwang"],
      after: ["Inc", "Hang\nJo\nMulti"],
      warning: "Hmmmm",
      error: null,
    },
    {
      before: ["John", "Doe"],
      after: null,
      warning: null,
      error: null,
      action: {
        name: "bam",
        onClick: () => console.log("bam"),
      },
    },
    {
      before: null,
      after: ["Ar", "Dur"],
      warning: null,
      error: "Conflict!",
    },
  ];

  return <Diff headers={headers} diff={diff} />;
}

export default Testing;
