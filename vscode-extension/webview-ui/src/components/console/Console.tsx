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

import { vscode } from "./../../utilities/vscode";
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./Console.css";

/**
 * Component for displaying console messages.
 * @returns The rendered Console component.
 */
const Console = () => {
  // Hooks for translation and state management
  const { t } = useTranslation("global");
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to the bottom of the console on message update
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleMessages]);

  // Effect to listen for console messages from VSCode
  useEffect(() => {
    vscode.postMessage({ command: "console" });
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  /**
   * Handles incoming console messages.
   * @param event The event containing the console message.
   */
  const handleMessage = (event: MessageEvent<any>) => {
    const message = event.data;
    if (message.command === "console") {
      setConsoleMessages((prev) => [...prev, message.data]);
    }
  };

  return (
    <div className="console-container">
      {/* Console title */}
      <p>{t("console.title")}</p>
      {/* Console output */}
      <div className="console-output" ref={consoleRef}>
        {consoleMessages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
    </div>
  );
};

export default Console;
