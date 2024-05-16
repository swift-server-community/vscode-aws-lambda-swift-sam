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

import { vscode } from "../utilities/vscode";
import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  VSCodeDropdown,
  VSCodeOption,
  VSCodeButton,
} from "@vscode/webview-ui-toolkit/react";
import { ConfigurationContext } from "../context/ConfigurationProvider";
import { VscRefresh } from "react-icons/vsc";
import { useTranslation } from "react-i18next";

/**
 * Props for the FunctionsDropdown component.
 */
interface FunctionsDropdownProps {
  selectedFunction: string;
  // eslint-disable-next-line no-unused-vars
  setSelectedFunction: (func: string) => void;
}

/**
 * Represents a dropdown component for selecting functions.
 * @param {Object} FunctionsDropdownProps - Props for the FunctionsDropdown component.
 * @param {string} FunctionsDropdownProps.selectedFunction - The currently selected function.
 * @param {Function} FunctionsDropdownProps.setSelectedFunction - Function to set the selected function.
 * @returns {JSX.Element} - The rendered FunctionsDropdown component.
 */
const FunctionsDropdown: React.FC<FunctionsDropdownProps> = ({
  selectedFunction,
  setSelectedFunction,
}) => {
  // Accessing translation function
  const { t } = useTranslation("global");
  // Accessing configuration state and setConfiguration function from ConfigurationProvider context
  const { configuration, setConfiguration } = useContext(ConfigurationContext);
  // State for loading status
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch functions list
  const refreshFunctions = useCallback(() => {
    setIsLoading(true);
    // Sending message to VS Code extension to fetch functions
    vscode.postMessage({
      command: "functions",
      data: {
        path: configuration.projectFolder + "/" + configuration.projectName,
      },
    });
    // Listening for messages from VS Code extension
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "functions" && message.data.success) {
        // Updating configuration context with fetched functions list
        setConfiguration((prevConfig) => ({
          ...prevConfig,
          functionsList: message.data.functions,
        }));
        // Setting the selected function to the first function in the list
        setSelectedFunction(message.data.functions[0]);
        setIsLoading(false);
      } else {
        if (message.command === "functions" && !message.data.success) {
          // Handling errors by resetting functions list and selected function
          setConfiguration((prevConfig) => ({
            ...prevConfig,
            functionsList: [],
          }));
          setSelectedFunction("");
          setIsLoading(false);
        }
      }
    });
  }, [
    configuration.projectFolder,
    configuration.projectName,
    setConfiguration,
    setSelectedFunction,
  ]);

  // Fetches functions list on mount and whenever projectName changes
  useEffect(() => {
    refreshFunctions();
  }, [configuration.projectName, refreshFunctions]);

  return (
    <div className="label-input">
      {/* Label for the functions dropdown */}
      <label htmlFor="function">{t("localInvoke.form.function.label")}</label>
      <div className="dropdown-container">
        {/* Dropdown component to select functions */}
        <VSCodeDropdown
          id="function"
          value={selectedFunction}
          onChange={(e: any) => {
            setSelectedFunction(e.target.value);
          }}
        >
          {/* Mapping through functions list to render options */}
          {configuration.functionsList.map((func) => (
            <VSCodeOption key={func} value={func}>
              {func}
            </VSCodeOption>
          ))}
        </VSCodeDropdown>
        {/* Button to refresh functions list */}
        <VSCodeButton
          appearance="icon"
          onClick={refreshFunctions}
          disabled={isLoading}
        >
          <VscRefresh />
        </VSCodeButton>
      </div>
    </div>
  );
};

export default FunctionsDropdown;
