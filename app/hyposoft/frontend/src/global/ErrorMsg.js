import { message } from "antd";

export function displayInfo(msg) {
  message.info(msg);
}

export function displayWarning(msg) {
  message.warning(msg);
}

export function displayError(msg) {
  if (typeof msg === "object") {
    message.error(msg.message);
  } else {
    message.error(msg);
  }
}
