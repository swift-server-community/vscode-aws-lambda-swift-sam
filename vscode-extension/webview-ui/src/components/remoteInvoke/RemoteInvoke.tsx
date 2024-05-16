//===----------------------------------------------------------------------===//
//
// This source file is part of the AWS Lambda Swift
// VSCode extension open source project.
//
// Copyright (c) 2024, the VSCode AWS Lambda Swift extension project authors.
// Licensed under Apache License v2.0.
//
// See LICENSE.txt for license information
// See CONTRIBUTORS.txt for the list of VSCode AWS Lambda Swift project authors
//
// SPDX-License-Identifier: Apache-2.0
//
//===----------------------------------------------------------------------===//

import { vscode } from "../../utilities/vscode";
import React, { useContext, useState } from "react";
import {
  VSCodeButton,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";
import Tooltip from "../tooltip/Tooltip";
import { ConfigurationContext } from "../../context/ConfigurationProvider";
import EventsDropdown from "../EventsDropdown";
import FunctionsDropdown from "../FunctionsDropdown";
import { useTranslation } from "react-i18next";
import { useError } from "../../context/ErrorProvider";

/**
 * Props for the RemoteInvoke component.
 */
interface RemoteInvokeProps {
  onComplete: () => void;
  // eslint-disable-next-line no-unused-vars
  setLoading: (isLoading: boolean) => void;
}

/**
 * Represents the component for invoking functions remotely.
 * @param {object} props - The component props.
 * @param {Function} props.onComplete - Function to call upon completion.
 * @param {Function} props.setLoading - Function to set loading state.
 * @returns {JSX.Element} - The rendered RemoteInvoke component.
 */
const RemoteInvoke: React.FC<RemoteInvokeProps> = ({
  onComplete,
  setLoading,
}) => {
  // Error handling hook
  const { setError } = useError();

  // Translation hook
  const { t } = useTranslation("global");

  // Configuration context hooks
  const { configuration, setConfiguration } = useContext(ConfigurationContext);

  // State for selected event and function
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("");

  // Function to handle remote function invocation
  const handleRemoteInvoke = () => {
    setLoading(true);
    vscode.postMessage({
      command: "remoteInvoke",
      data: {
        path: configuration.projectFolder + "/" + configuration.projectName,
        eventPath: selectedEvent,
        functionName: selectedFunction,
        stackName: configuration.stackName,
        region: configuration.region,
      },
    });
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "remoteInvoke" && message.data.success) {
        onComplete();
        setLoading(false);
      } else {
        if (message.command === "remoteInvoke" && !message.data.success) {
          setError(message.data.error);
          setLoading(false);
          console.debug("Error invoking function remotely");
        }
      }
    });
  };

  return (
    <div className="init-container">
      {/* Dropdown for selecting functions */}
      <FunctionsDropdown
        selectedFunction={selectedFunction}
        setSelectedFunction={setSelectedFunction}
      />

      {/* Dropdown for selecting events */}
      <EventsDropdown
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
      />

      {/* Input field for specifying stack name */}
      <div className="label-input">
        <label htmlFor="stackName">
          {t("remoteInvoke.form.stackName.label")}
        </label>
        <VSCodeTextField
          id="stackName"
          value={configuration.stackName}
          onInput={(e: any) => {
            setConfiguration((prevConfig) => ({
              ...prevConfig,
              stackName: e.target.value,
            }));
          }}
          placeholder={t("remoteInvoke.form.stackName.placeholder")}
        />
      </div>

      {/* Button for initiating remote invocation */}
      <div className="button-container">
        <VSCodeButton onClick={handleRemoteInvoke}>
          {t("remoteInvoke.button")}
        </VSCodeButton>
      </div>

      {/* Tooltip for providing information */}
      <Tooltip text={t("remoteInvoke.info.message")} />
    </div>
  );
};

export default RemoteInvoke;
