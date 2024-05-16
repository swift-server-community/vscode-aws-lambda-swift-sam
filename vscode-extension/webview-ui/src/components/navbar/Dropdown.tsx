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

import React from "react";
import { VscQuestion, VscTrash } from "react-icons/vsc";
import { useTranslation } from "react-i18next";

/**
 * Props for the Dropdown component.
 */
interface DropdownProps {
  togglePrerequisitesModal: () => void;
  toggleDeleteConfirmationModal: () => void;
}

/**
 * Component representing a dropdown menu with options.
 * @param togglePrerequisitesModal Function to toggle the prerequisites modal.
 * @param toggleDeleteConfirmationModal Function to toggle the delete confirmation modal.
 * @returns The rendered Dropdown component.
 */
const Dropdown: React.FC<DropdownProps> = ({
  togglePrerequisitesModal,
  toggleDeleteConfirmationModal,
}) => {
  // Hook for translation
  const { t } = useTranslation("global");

  return (
    <div className="dropdown-menu">
      {/* Option for toggling prerequisites modal */}
      <div onClick={togglePrerequisitesModal} className="dropdown-item">
        <span className="dropdown-text">
          {t("dropdown.prerequisites.title")}
        </span>
        <div className="dropdown-icon-container questionmark dropdown-icon">
          <VscQuestion size={25} />
        </div>
      </div>

      {/* Option for toggling delete confirmation modal */}
      <div onClick={toggleDeleteConfirmationModal} className="dropdown-item">
        <div className="dropdown-text error">
          <p>{t("dropdown.delete.title")}</p>
        </div>
        <div className="dropdown-icon-container trash dropdown-icon">
          <VscTrash size={25} />
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
