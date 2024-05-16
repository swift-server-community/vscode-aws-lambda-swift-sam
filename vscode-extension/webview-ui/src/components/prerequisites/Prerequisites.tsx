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
import React, { useState, useEffect, useRef } from "react";
import {
  VSCodeProgressRing,
  VSCodeButton,
  VSCodeDivider,
} from "@vscode/webview-ui-toolkit/react";
import { VscCheck, VscError } from "react-icons/vsc";
import { useTranslation } from "react-i18next";
import "./Prerequisites.css";

/**
 * Props for the Prerequisites component.
 */
interface PrerequisitesProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Interface representing a prerequisite.
 */
interface Prerequisite {
  url: string;
  success: boolean;
  name: string;
}

/**
 * Represents the prerequisites modal component.
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Indicates whether the modal is open.
 * @param {Function} props.onClose - Function to close the modal.
 * @returns {JSX.Element} - The rendered Prerequisites component.
 */
const Prerequisites: React.FC<PrerequisitesProps> = ({ isOpen, onClose }) => {
  // Hooks for translation
  const { t } = useTranslation("global");

  // State for loading status
  const [isLoading, setIsLoading] = useState(true);

  // State for prerequisites data
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([]);

  // Reference for modal element
  const modalRef = useRef<HTMLDivElement>(null);

  // Effect for initializing prerequisites check
  useEffect(() => {
    checkPrerequisites();
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Effect for handling outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Message handler for receiving prerequisites data
  const handleMessage = (event: MessageEvent<any>) => {
    const message = event.data;
    if (message.command === "checkPrerequisites") {
      setPrerequisites(message.data);
      setIsLoading(false);
    }
  };

  // Function to initiate prerequisites check
  const checkPrerequisites = () => {
    setIsLoading(true);
    vscode.postMessage({ command: "checkPrerequisites" });
  };

  return (
    <>
      {isOpen && (
        <div className="modal-overlay">
          <div ref={modalRef} className="modal">
            {/* Modal title */}
            <h2>{t("dropdown.prerequisites.modal.title")}</h2>

            {/* Loading indicator or prerequisites list */}
            {isLoading ? (
              <div className="loading-container">
                <VSCodeProgressRing />
              </div>
            ) : (
              <div className="prerequisites-container">
                {prerequisites.map((prerequisite: any, index: number) => (
                  <div key={index} className="prerequisite">
                    <a href={prerequisite.url}>{prerequisite.name}</a>
                    {prerequisite.success ? (
                      <VscCheck size={20} color="green" />
                    ) : (
                      <VscError size={20} color="red" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Failed prerequisites section */}
            <div className="failed-prerequisites">
              <VSCodeDivider role="presentation" />
              {prerequisites
                .filter((prerequisite) => !prerequisite.success)
                .map((failedPrerequisite, index) => (
                  <div key={index}>
                    <p>
                      <a href={failedPrerequisite.url}>
                        {failedPrerequisite.name}{" "}
                        {t(
                          "dropdown.prerequisites.modal.missingPrerequisiteMessage",
                        )}
                      </a>
                    </p>
                  </div>
                ))}
            </div>

            {/* Button container */}
            <div className="prerequisites-button-container">
              <VSCodeButton appearance="secondary" onClick={checkPrerequisites}>
                {t("dropdown.prerequisites.modal.retryButton")}
              </VSCodeButton>
              <VSCodeButton onClick={onClose}>
                {t("dropdown.prerequisites.modal.closeButton")}
              </VSCodeButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Prerequisites;
