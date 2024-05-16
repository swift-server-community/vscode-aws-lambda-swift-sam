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

import React, { useContext, useState, useEffect } from "react";
import { vscode } from "../../utilities/vscode";
import {
  VSCodeTextField,
  VSCodeDropdown,
  VSCodeOption,
} from "@vscode/webview-ui-toolkit/react";
import { ConfigurationContext } from "../../context/ConfigurationProvider";
import "./Configuration.css";
import { useTranslation } from "react-i18next";

/**
 * Component for configuring project settings.
 * @returns The rendered Configuration component.
 */
const Configuration = () => {
  // Hooks for translation and context
  const [t] = useTranslation("global");
  const { configuration, setConfiguration } = useContext(ConfigurationContext);
  const [errorFolder, setErrorFolder] = useState("");
  const [errorName, setErrorName] = useState("");

  const checkExists = (path: string, type: string) => {
    if (path) {
      vscode.postMessage({
        command: "checkExists",
        data: {
          path,
          type,
        },
      });
    } else {
      if (type === "folder") setErrorFolder(t("configuration.error.emptyPath"));
      else if (type === "name")
        setErrorName(t("configuration.error.emptyName"));
    }
  };

  useEffect(() => {
    const listener = (event: any) => {
      if (event.data.command === "checkResult") {
        const { exists, type } = event.data.data;
        if (type === "folder") {
          setErrorFolder(
            exists ? "" : t("configuration.error.folderDoesNotExist"),
          );
        } else if (type === "name") {
          setErrorName(exists ? t("configuration.error.alreadyExists") : "");
        }
      }
    };

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  }, [t]);

  return (
    <div className="configuration-parent">
      <p>{t("configuration.title")}</p>
      <div className="configuration-container">
        <div className="path-input">
          <div className="path-input-path">
            <label htmlFor="path-name">
              {t("configuration.form.projectFolder.label")}
            </label>
            <VSCodeTextField
              id="path"
              value={configuration.projectFolder}
              onInput={(e: any) => {
                setConfiguration({
                  ...configuration,
                  projectFolder: e.target.value,
                });
              }}
              onBlur={(e: any) => {
                checkExists(e.target.value, "folder");
              }}
              placeholder={t("configuration.form.projectFolder.placeholder")}
              className={errorFolder ? "error-textField" : ""}
            />
            {errorFolder && <div className="error-message">{errorFolder}</div>}
            {errorName && <div className="error-message">{errorName}</div>}
          </div>
          <div className="slash-separator">
            <p>/</p>
          </div>
          <div className="path-input-name">
            <label htmlFor="name">
              {t("configuration.form.projectName.label")}
            </label>
            <VSCodeTextField
              id="name"
              value={configuration.projectName}
              onInput={(e: any) => {
                setConfiguration({
                  ...configuration,
                  projectName: e.target.value,
                });
              }}
              onBlur={(e: any) => {
                checkExists(
                  e.target.value
                    ? configuration.projectFolder + "/" + e.target.value
                    : e.target.value,
                  "name",
                );
              }}
              placeholder={t("configuration.form.projectName.placeholder")}
              className={errorName ? "error-textField" : ""}
            />
          </div>
        </div>

        {/* Region */}
        <div className="label-input">
          <label htmlFor="template">
            {t("configuration.form.region.label")}
          </label>
          <VSCodeDropdown
            id="template"
            value={configuration.region}
            onChange={(e: any) => {
              setConfiguration({
                ...configuration,
                region: e.target.value,
              });
            }}
          >
            {configuration.regionList.map((region) => (
              <VSCodeOption key={region} value={region}>
                {region}
              </VSCodeOption>
            ))}
          </VSCodeDropdown>
        </div>
      </div>
    </div>
  );
};

export default Configuration;
