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
import {
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import React, { useEffect, useState, useContext, useCallback } from "react";
import { ConfigurationContext } from "../../context/ConfigurationProvider";
import Tooltip from "../tooltip/Tooltip";
import { useTranslation } from "react-i18next";
import { useError } from "../../context/ErrorProvider";
import ReactMarkdown from "react-markdown";
import { fetchMarkdownFile } from "../../api/markdownApi";
import "./Initialize.css";

/**
 * Props for the Initialize component.
 */
interface InitializeProps {
  onComplete: () => void;
  // eslint-disable-next-line no-unused-vars
  setLoading: (isLoading: boolean) => void;
}

/**
 * Component for initializing a project.
 * @param onComplete Callback function to execute upon completion of initialization.
 * @param setLoading Function to set loading state during initialization.
 * @returns The rendered Initialize component.
 */
const Initialize: React.FC<InitializeProps> = ({ onComplete, setLoading }) => {
  // Hooks for error handling, translation, and configuration context
  const { setError } = useError();
  const { t } = useTranslation("global");
  const { configuration, setConfiguration } = useContext(ConfigurationContext);
  // State for selected template and template info
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateInfo, setTemplateInfo] = useState("");

  // State for selected branch
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  // State for loading templates
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);

  // Effect to set default selected template when templates are loaded
  useEffect(() => {
    if (configuration.templates.length > 0) {
      setSelectedTemplate(configuration.templates[0].name);
    }
  }, [configuration.templates]);

  // Effect to set default selected branch when branches are loaded
  useEffect(() => {
    if (configuration.branches.length > 0) {
      setSelectedBranch(configuration.branches[0]);
    }
  }, [configuration.branches]);

  // Effect to fetch and set template info when selected template changes
  useEffect(() => {
    if (
      selectedTemplate &&
      configuration.templates.length > 0 &&
      loadingTemplates === false
    ) {
      fetchMarkdownFile(
        configuration.templates.find((e) => e.name === selectedTemplate)
          ?.path ?? "",
        selectedBranch,
      )
        .then((data) => {
          setTemplateInfo(data);
        })
        .catch((error) => {
          console.error("Error fetching template info:", error);
        });
    }
  }, [
    selectedTemplate,
    configuration.templates,
    selectedBranch,
    loadingTemplates,
  ]);

  /**
   * Handles project initialization.
   */
  const handleInitialize = () => {
    setLoading(true);
    vscode.postMessage({
      command: "initializeProject",
      data: {
        name: configuration.projectName,
        template: selectedTemplate,
        path: configuration.projectFolder,
        branch: selectedBranch,
      },
    });
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "initializeProject" && message.data.success) {
        onComplete();
        setLoading(false);
        refreshEventsAndFunctions();
      } else {
        if (message.command === "initializeProject" && !message.data.success) {
          setError(message.data.error);
          setLoading(false);
          console.debug("Error initializing project");
        }
      }
    });
  };

  /**
   * Function to refresh events and functions list.
   */
  const refreshEventsAndFunctions = useCallback(() => {
    vscode.postMessage({
      command: "events",
      data: {
        path: configuration.projectFolder + "/" + configuration.projectName,
      },
    });
    vscode.postMessage({
      command: "functions",
      data: {
        path: configuration.projectFolder + "/" + configuration.projectName,
      },
    });
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "events" && message.data.success) {
        setConfiguration((prevConfig) => ({
          ...prevConfig,
          eventsList: message.data.events,
        }));
      }
      if (message.command === "functions" && message.data.success) {
        setConfiguration((prevConfig) => ({
          ...prevConfig,
          functionsList: message.data.functions,
        }));
      }
    });
  }, [
    configuration.projectFolder,
    configuration.projectName,
    setConfiguration,
  ]);

  /**
   * Function to change the selected branch.
   * @param branch The branch to change to.
   */
  const changeBranch = (branch: string) => {
    setLoadingTemplates(true);
    setSelectedBranch(branch);

    vscode.postMessage({
      command: "templates",
      data: {
        branch: branch,
      },
    });

    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "templates" && message.data.success) {
        setConfiguration((prevConfig) => ({
          ...prevConfig,
          templates: message.data.templates.list,
        }));
        setSelectedTemplate(message.data.templates.list[0].name);
        setLoadingTemplates(false);
      } else {
        if (message.command === "templates" && !message.data.success) {
          setError(message.data.error);
          console.debug("Error fetching templates");
          setLoadingTemplates(false);
        }
      }
    });
  };

  return (
    <div className="init-container initialize-container">
      {/* Dropdown for selecting template */}
      <div className="label-input">
        <label htmlFor="template">
          {t("initializeProject.form.template.label")}
        </label>
        <VSCodeDropdown
          id="template"
          value={selectedTemplate}
          onChange={(e: any) => setSelectedTemplate(e.target.value)}
          disabled={loadingTemplates}
        >
          {configuration.templates.map((template) => (
            <VSCodeOption key={template.name} value={template.name}>
              {template.name}
            </VSCodeOption>
          ))}
        </VSCodeDropdown>
      </div>

      {/* Dropdown for selecting branch */}
      <div className="label-input">
        <label htmlFor="branch">
          {t("initializeProject.form.branch.label")}
        </label>
        <VSCodeDropdown
          id="branch"
          value={selectedBranch}
          onChange={(e: any) => changeBranch(e.target.value)}
          disabled={loadingTemplates}
        >
          {configuration.branches.map((branch) => (
            <VSCodeOption key={branch} value={branch}>
              {branch}
            </VSCodeOption>
          ))}
        </VSCodeDropdown>
      </div>

      {/* Progress ring for loading templates */}
      {loadingTemplates && (
        <div className="loading-ring-container">
          <VSCodeProgressRing className="loading-ring" />
        </div>
      )}

      {/* Visual representation of the selected template */}
      <div className="visual-representation-container">
        <p>{t("initializeProject.form.visualRepresentation.label")}</p>
        <div className="visual-representation">
          {selectedTemplate && (
            <img
              src={`https://raw.githubusercontent.com/swift-server-community/aws-lambda-swift-sam-template/${selectedBranch}/${
                configuration.templates.find((e) => e.name === selectedTemplate)
                  ?.path
              }/doc/${configuration.theme}.webp`}
              alt="Visual representation"
            />
          )}
        </div>
      </div>

      {/* Markdown content for template information */}
      <div className="markdown-container">
        <p>{t("initializeProject.form.info.label")}</p>
        <div className="markdown">
          <ReactMarkdown>{templateInfo}</ReactMarkdown>
        </div>
      </div>

      {/* Button to initialize the project */}
      <div className="button-container">
        <VSCodeButton onClick={handleInitialize}>
          {t("initializeProject.button")}
        </VSCodeButton>
      </div>

      {/* Tooltip for initialization information */}
      <Tooltip text={t("initializeProject.info.message")} />
    </div>
  );
};

export default Initialize;
