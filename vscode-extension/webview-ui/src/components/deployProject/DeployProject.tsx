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
import React, { useContext } from "react";
import {
  VSCodeTextField,
  VSCodeButton,
} from "@vscode/webview-ui-toolkit/react";
import Tooltip from "../tooltip/Tooltip";
import { ConfigurationContext } from "../../context/ConfigurationProvider";
import { useTranslation } from "react-i18next";
import { useError } from "../../context/ErrorProvider";

/**
 * Props for the DeployProject component.
 */
interface DeployProjectProps {
  onComplete: () => void;
  // eslint-disable-next-line no-unused-vars
  setLoading: (isLoading: boolean) => void;
}

/**
 * Component for deploying a project.
 * @param onComplete Callback function to execute upon completion of deployment.
 * @param setLoading Function to set loading state during deployment.
 * @returns The rendered DeployProject component.
 */
const DeployProject: React.FC<DeployProjectProps> = ({
  onComplete,
  setLoading,
}) => {
  // Hooks for error handling, translation, and configuration context
  const { setError } = useError();
  const { t } = useTranslation("global");
  const { configuration, setConfiguration } = useContext(ConfigurationContext);

  /**
   * Handles project deployment.
   */
  const handleDeployProject = () => {
    setLoading(true);
    vscode.postMessage({
      command: "deployProject",
      data: {
        path: configuration.projectFolder + "/" + configuration.projectName,
        stackName: configuration.stackName,
        region: configuration.region,
      },
    });
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "deployProject" && message.data.success) {
        onComplete();
        setLoading(false);
      } else {
        if (message.command === "deployProject" && !message.data.success) {
          setError(message.data.error);
          setLoading(false);
          console.debug("Error deploying project");
        }
      }
    });
  };

  return (
    <div className="init-container">
      {/* Stack name input */}
      <div className="label-input">
        <label htmlFor="stackName">
          {t("deployProject.form.stackName.label")}
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
          placeholder={t("deployProject.form.stackName.placeholder")}
        />
      </div>

      {/* Deploy button */}
      <div className="button-container">
        <VSCodeButton onClick={handleDeployProject}>
          {t("deployProject.button")}
        </VSCodeButton>
      </div>

      {/* Tooltip for deployment information */}
      <Tooltip text={t("deployProject.info.message")} />
    </div>
  );
};

export default DeployProject;
