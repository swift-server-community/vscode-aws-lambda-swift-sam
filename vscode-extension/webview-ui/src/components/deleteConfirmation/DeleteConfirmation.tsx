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
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import {
  VSCodeButton,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";
import { VscCheck } from "react-icons/vsc";
import { ConfigurationContext } from "../../context/ConfigurationProvider";
import { useTranslation } from "react-i18next";
import { useError } from "../../context/ErrorProvider";
import "./DeleteConfirmation.css";

/**
 * Props for the DeleteConfirmation component.
 */
interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Component for displaying a delete confirmation modal.
 * @param isOpen Indicates if the modal is open.
 * @param onClose Callback function to close the modal.
 * @returns The rendered DeleteConfirmation component.
 */
const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  onClose,
}) => {
  // Hooks for translation, context, and state management
  const { setError } = useError();
  const { t } = useTranslation("global");
  const { configuration, setConfiguration } = useContext(ConfigurationContext);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Function to delete stack
  const deleteStack = useCallback(() => {
    vscode.postMessage({
      command: "deleteStack",
      data: {
        stackName: configuration.stackName,
        region: configuration.region,
      },
    });
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "deleteStack" && message.data.success) {
        setDeleteSuccess(true);
        setTimeout(() => {
          onClose();
          setDeleteSuccess(false);
          setIsDeleting(false);
        }, 2000);
      } else {
        if (message.command === "deleteStack" && !message.data.success) {
          setError(message.data.error);
          onClose();
          setIsDeleting(false);
          console.debug("Error deleting stack");
        }
      }
    });
  }, [configuration.region, configuration.stackName, onClose, setError]);

  // Effect to handle delete operation
  useEffect(() => {
    if (isDeleting) {
      deleteStack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeleting]);

  // Effect to handle clicks outside the modal
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

  // Function to handle delete button click
  const handleDelete = () => {
    setIsDeleting(true);
  };

  // Function to handle cancel button click
  const handleCancel = () => {
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="modal-overlay">
          <div ref={modalRef} className="modal">
            {/* Modal title */}
            <h2>{t("dropdown.delete.modal.title")}</h2>
            {/* Stack name input */}
            <div className="confirmation-container">
              <div className="label-input">
                <label htmlFor="stackNameDelete">
                  {t("dropdown.delete.modal.stackNameLabel")}
                </label>
                <VSCodeTextField
                  id="stackNameDelete"
                  value={configuration.stackName}
                  onInput={(e: any) => {
                    setConfiguration((prevConfig) => ({
                      ...prevConfig,
                      stackName: e.target.value,
                    }));
                  }}
                  placeholder={t("dropdown.delete.modal.stackNamePlaceholder")}
                />
              </div>
            </div>
            {/* Delete and cancel buttons */}
            <div className="button-container">
              <VSCodeButton
                appearance="secondary"
                className="dangerButton"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting
                  ? t("dropdown.delete.modal.deleteButtonIsLoading")
                  : t("dropdown.delete.modal.deleteButton")}
              </VSCodeButton>
              <VSCodeButton
                appearance="secondary"
                onClick={handleCancel}
                disabled={isDeleting}
              >
                {t("dropdown.delete.modal.cancelButton")}
              </VSCodeButton>
            </div>
            {/* Delete success message */}
            {deleteSuccess && (
              <div className="delete-success">
                <VscCheck size={20} color="green" />
                <p>{t("dropdown.delete.modal.successMessage")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteConfirmation;
