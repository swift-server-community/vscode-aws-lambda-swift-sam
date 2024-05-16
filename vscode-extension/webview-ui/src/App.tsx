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

import Navbar from "./components/navbar/Navbar";
import Accordion from "./components/accordion/Accordion";
import Console from "./components/console/Console";
import Initialize from "./components/initialize/Initialize";
import React, { useState, useContext, useEffect } from "react";
import Configuration from "./components/configuration/Configuration";
import BuildProject from "./components/buildProject/BuildProject";
import LocalInvoke from "./components/localInvoke/LocalInvoke";
import DeployProject from "./components/deployProject/DeployProject";
import RemoteInvoke from "./components/remoteInvoke/RemoteInvoke";
import { useTranslation } from "react-i18next";
import { ConfigurationContext } from "./context/ConfigurationProvider";
import "./App.css";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import Error from "./components/Error";

/**
 * The main application component responsible for rendering the entire application UI.
 * This component integrates various sub-components to manage the application flow.
 * @returns {JSX.Element} The rendered main application component.
 */
function App() {
  const { t, i18n } = useTranslation("global");
  const { configuration } = useContext(ConfigurationContext);

  /**
   * The list of steps that the user needs to complete to deploy a project.
   * Each step is an object with an id, title, done flag, isLoading flag, and a renderContent function.
   * The renderContent function returns the JSX content of the step.
   * The done flag indicates whether the step has been completed.
   * The isLoading flag indicates whether the step is currently loading.
   * @type {Array<{id: number, title: string, done: boolean, isLoading: boolean, renderContent: () => JSX.Element}>}
   * @param {number} id The unique identifier of the step.
   * @param {string} title The title of the step.
   * @param {boolean} done A flag indicating whether the step has been completed.
   * @param {boolean} isLoading A flag indicating whether the step is currently loading.
   * @param {() => JSX.Element} renderContent A function that returns the JSX content of the step.
   * @param {() => void} onComplete A function that marks the step as completed.
   * @param {(isLoading: boolean) => void} setLoading A function that sets the loading state of the step.
   */
  const [steps, setSteps] = useState([
    {
      id: 0,
      title: t("initializeProject.title"),
      done: false,
      isLoading: false,
      renderContent: () => (
        <Initialize
          onComplete={() => markStepAsDone(0)}
          setLoading={(isLoading: boolean) => setStepLoading(0, isLoading)}
        />
      ),
    },
    {
      id: 1,
      title: t("buildProject.title"),
      done: false,
      isLoading: false,
      renderContent: () => (
        <BuildProject
          onComplete={() => markStepAsDone(1)}
          setLoading={(isLoading: boolean) => setStepLoading(1, isLoading)}
        />
      ),
    },
    {
      id: 2,
      title: t("localInvoke.title"),
      done: false,
      isLoading: false,
      renderContent: () => (
        <LocalInvoke
          onComplete={() => markStepAsDone(2)}
          setLoading={(isLoading: boolean) => setStepLoading(2, isLoading)}
        />
      ),
    },
    {
      id: 3,
      title: t("deployProject.title"),
      done: false,
      isLoading: false,
      renderContent: () => (
        <DeployProject
          onComplete={() => markStepAsDone(3)}
          setLoading={(isLoading: boolean) => setStepLoading(3, isLoading)}
        />
      ),
    },
    {
      id: 4,
      title: t("remoteInvoke.title"),
      done: false,
      isLoading: false,
      renderContent: () => (
        <RemoteInvoke
          onComplete={() => markStepAsDone(4)}
          setLoading={(isLoading: boolean) => setStepLoading(4, isLoading)}
        />
      ),
    },
  ]);

  /**
   * Marks a step as completed.
   * @param {number} stepId - The ID of the step to mark as completed.
   */
  const markStepAsDone = (stepId: number) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, done: true } : step,
      ),
    );
  };

  /**
   * Sets the loading state of a step.
   * @param {number} stepId - The ID of the step.
   * @param {boolean} isLoading - Indicates whether the step is in loading state.
   */
  const setStepLoading = (stepId: number, isLoading: boolean) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, isLoading: isLoading } : step,
      ),
    );
  };

  useEffect(() => {
    // Change the application language based on the selected locale.
    i18n.changeLanguage(configuration.locale);
  }, [configuration.locale, i18n]);

  return (
    <main>
      {/* Display loading indicator if the application configuration is loading */}
      {configuration.isLoading && (
        <div className="app-loading-container">
          <VSCodeProgressRing className="app-loading-ring" />
        </div>
      )}
      {/* Render the Navbar component */}
      <Navbar />
      {/* Render the Error component */}
      <Error />
      {/* Render the Configuration component */}
      <Configuration />
      {/* Render the Accordion component with dynamic steps */}
      <Accordion items={steps} />
      {/* Render the Console component */}
      <Console />
    </main>
  );
}

export default App;
