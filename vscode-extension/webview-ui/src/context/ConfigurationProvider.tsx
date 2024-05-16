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

/* eslint-disable indent */
import React, { createContext, useState, useEffect } from "react";
import { vscode } from "../utilities/vscode";

/**
 * Interface representing the configuration of the application.
 */
interface Configuration {
  projectName: string;
  region: string;
  projectFolder: string;
  templates: Array<{ name: string; path: string }> | [];
  stackName: string;
  regionList: string[];
  eventsList: string[];
  functionsList: string[];
  locale: string;
  isLoading: boolean;
  theme: string;
}

/**
 * Context providing access to the application configuration and a function to update it.
 */
export const ConfigurationContext = createContext<{
  configuration: Configuration;
  setConfiguration: React.Dispatch<React.SetStateAction<Configuration>>;
}>({
  configuration: {
    projectName: "",
    region: "",
    projectFolder: "",
    templates: [],
    stackName: "",
    regionList: [],
    eventsList: [],
    functionsList: [],
    locale: "",
    isLoading: true,
    theme: "",
  },
  setConfiguration: () => {},
});

/**
 * Provider component for the ConfigurationContext.
 * Manages the application configuration state and provides it to the context.
 * @param children The child components wrapped by the provider.
 */
export const ConfigurationProvider: React.FC = ({ children }) => {
  // Initial configuration state
  const initialConfig: Configuration = {
    projectName: "",
    region: "",
    projectFolder: "",
    templates: [],
    stackName: "",
    regionList: [],
    eventsList: [],
    functionsList: [],
    locale: "",
    isLoading: true,
    theme: "",
  };

  // State to manage the configuration
  const [configuration, setConfiguration] =
    useState<Configuration>(initialConfig);

  // Effect to initialize configuration and listen for updates
  useEffect(() => {
    // Notify VSCode that the webview is ready to receive initial configuration
    vscode.postMessage({ command: "ready" });

    // Listen for messages from VSCode and update configuration accordingly
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "ready") {
        setConfiguration((prevConfig) => ({
          ...prevConfig,
          templates: message.data.templates.list,
          projectFolder: message.data.path,
          region: message.data.regions.default,
          regionList: message.data.regions.list,
          locale: message.data.locale,
          isLoading: false,
          theme: getTheme(message.data.theme),
        }));
      }
    });

    // Cleanup: remove event listener
    return () => {
      window.removeEventListener("message", () => {});
    };
  }, []);

  // Effect to listen for theme change messages from VSCode
  useEffect(() => {
    // Listen for messages from VSCode and update configuration accordingly
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "themeChange") {
        setConfiguration((prevConfig) => ({
          ...prevConfig,
          theme: getTheme(message.data.theme),
        }));
      }
    });

    // Cleanup: remove event listener
    return () => {
      window.removeEventListener("message", () => {});
    };
  }, []);

  /**
   * Function to get the theme based on the theme enum value.
   * @param enumValue The enum value representing the theme.
   * @returns The theme string.
   */
  function getTheme(enumValue: number): string {
    switch (enumValue) {
      case 1:
      case 4:
        return "light";
      case 2:
      case 3:
        return "dark";
      default:
        return "dark";
    }
  }

  return (
    <ConfigurationContext.Provider value={{ configuration, setConfiguration }}>
      {children}
    </ConfigurationContext.Provider>
  );
};
