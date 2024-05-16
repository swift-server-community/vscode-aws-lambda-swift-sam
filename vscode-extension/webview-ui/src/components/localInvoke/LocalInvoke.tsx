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
import { ConfigurationContext } from "../../context/ConfigurationProvider";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import Tooltip from "../tooltip/Tooltip";
import EventsDropdown from "../EventsDropdown";
import FunctionsDropdown from "../FunctionsDropdown";
import { useTranslation } from "react-i18next";
import { useError } from "../../context/ErrorProvider";

/**
 * Props for the LocalInvoke component.
 */
interface BuildProps {
  onComplete: () => void;
  // eslint-disable-next-line no-unused-vars
  setLoading: (isLoading: boolean) => void;
}

/**
 * Component for locally invoking a function.
 * @param onComplete Callback function to execute upon completion of local invocation.
 * @param setLoading Function to set loading state during local invocation.
 * @returns The rendered LocalInvoke component.
 */
const LocalInvoke: React.FC<BuildProps> = ({ onComplete, setLoading }) => {
  // Hooks for error handling, translation, and configuration context
  const { setError } = useError();
  const { t } = useTranslation("global");
  const { configuration } = useContext(ConfigurationContext);
  // State for selected event and function
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("");

  /**
   * Handles local function invocation.
   */
  const handleLocalInvoke = () => {
    setLoading(true);
    vscode.postMessage({
      command: "localInvoke",
      data: {
        path: configuration.projectFolder + "/" + configuration.projectName,
        eventPath: selectedEvent,
        functionName: selectedFunction,
      },
    });
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "localInvoke" && message.data.success) {
        onComplete();
        setLoading(false);
      } else {
        if (message.command === "localInvoke" && !message.data.success) {
          setError(message.data.error);
          setLoading(false);
          console.debug("Error invoking function locally");
        }
      }
    });
  };

  return (
    <div className="init-container">
      {/* Dropdowns for selecting event and function */}
      <FunctionsDropdown
        selectedFunction={selectedFunction}
        setSelectedFunction={setSelectedFunction}
      />
      <EventsDropdown
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
      />

      {/* Button to perform local invocation */}
      <div className="button-container">
        <VSCodeButton onClick={handleLocalInvoke}>
          {t("localInvoke.button")}
        </VSCodeButton>
      </div>

      {/* Tooltip for local invocation information */}
      <Tooltip text={t("localInvoke.info.message")} />
    </div>
  );
};

export default LocalInvoke;
