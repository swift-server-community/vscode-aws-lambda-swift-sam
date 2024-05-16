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
import React, { useContext, useState, useEffect } from "react";
import { ConfigurationContext } from "../../context/ConfigurationProvider";
import {
  VSCodeTextField,
  VSCodeButton,
} from "@vscode/webview-ui-toolkit/react";
import Tooltip from "../tooltip/Tooltip";
import { useTranslation } from "react-i18next";
import { useError } from "../../context/ErrorProvider";

/**
 * Props for the BuildProject component.
 */
interface BuildProps {
  onComplete: () => void;
  // eslint-disable-next-line no-unused-vars
  setLoading: (isLoading: boolean) => void;
}

/**
 * Component for building the project.
 * @param onComplete Callback function to execute upon completion.
 * @param setLoading Function to set loading state.
 * @returns The rendered BuildProject component.
 */
const BuildProject: React.FC<BuildProps> = ({ onComplete, setLoading }) => {
  // Context hooks
  const { setError } = useError();
  const { t } = useTranslation("global");
  const { configuration } = useContext(ConfigurationContext);

  // State for build folder path
  const [buildFolder, setBuildFolder] = useState(
    configuration.projectFolder + "/" + configuration.projectName,
  );

  // Effect to update build folder path when configuration changes
  useEffect(() => {
    setBuildFolder(
      configuration.projectFolder + "/" + configuration.projectName,
    );
  }, [configuration.projectName, configuration.projectFolder]);

  /**
   * Handles building the project.
   */
  const handleBuild = () => {
    setLoading(true);
    // Send build project command to VSCode
    vscode.postMessage({
      command: "buildProject",
      data: {
        path: buildFolder,
      },
    });
    // Listen for response from VSCode
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "buildProject" && message.data.success) {
        onComplete(); // Callback on successful build
        setLoading(false);
      } else {
        if (message.command === "buildProject" && !message.data.success) {
          setError(message.data.error); // Set error message on build failure
          console.debug("Error building project");
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="init-container">
      {/* Build folder input */}
      <div className="label-input">
        <label htmlFor="buildFolder">
          {t("buildProject.form.buildFolder.label")}
        </label>
        <VSCodeTextField
          id="buildFolder"
          value={buildFolder}
          onInput={(e: any) => {
            setBuildFolder(e.target.value);
          }}
          placeholder={t("buildProject.form.buildFolder.placeholder")}
        />
      </div>

      {/* Build button */}
      <div className="button-container">
        <VSCodeButton onClick={handleBuild}>
          {t("buildProject.button")}
        </VSCodeButton>
      </div>

      {/* Tooltip for build project information */}
      <Tooltip text={t("buildProject.info.message")} />
    </div>
  );
};

export default BuildProject;
