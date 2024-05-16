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

import React, { useState, useRef, useEffect } from "react";
import { VscGithubInverted, VscEllipsis } from "react-icons/vsc";
import Dropdown from "./Dropdown";
import Prerequisites from "../prerequisites/Prerequisites";
import DeleteConfirmation from "../deleteConfirmation/DeleteConfirmation";
import "./Navbar.css";

/**
 * Component representing the navigation bar.
 * @returns The rendered Navbar component.
 */
const Navbar = () => {
  // State for controlling prerequisites modal visibility
  const [isPrerequisitesModalModalOpen, setIsPrerequisitesModalModalOpen] =
    useState(false);

  // State for controlling delete confirmation modal visibility
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] =
    useState(false);

  // State for controlling dropdown visibility
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Reference to dropdown element
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Toggles the visibility of the dropdown menu.
   */
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  /**
   * Toggles the visibility of the prerequisites modal.
   */
  const togglePrerequisitesModal = () => {
    setIsPrerequisitesModalModalOpen(!isPrerequisitesModalModalOpen);
  };

  /**
   * Toggles the visibility of the delete confirmation modal.
   */
  const toggleDeleteConfirmationModal = () => {
    setIsDeleteConfirmationModalOpen(!isDeleteConfirmationModalOpen);
  };

  // Effect to handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <>
      <div className="navbar-container">
        {/* Navbar items */}
        <div className="navbar-items">
          <h1 className="">vscode-aws-lambda-swift</h1>
          <a
            href="https://github.com/MarwaneKoutar/vscode-aws-lambda-swift"
            className="github-icon"
          >
            <VscGithubInverted size={30} />
          </a>
        </div>

        {/* Dropdown menu */}
        <div className="navbar-dropdown" ref={dropdownRef}>
          <div onClick={toggleDropdown} className="dropdown-icon">
            <VscEllipsis size={30} />
          </div>
          {dropdownOpen && (
            <Dropdown
              togglePrerequisitesModal={togglePrerequisitesModal}
              toggleDeleteConfirmationModal={toggleDeleteConfirmationModal}
            />
          )}
        </div>
      </div>

      {/* Prerequisites modal */}
      <Prerequisites
        isOpen={isPrerequisitesModalModalOpen}
        onClose={togglePrerequisitesModal}
      />

      {/* Delete confirmation modal */}
      <DeleteConfirmation
        isOpen={isDeleteConfirmationModalOpen}
        onClose={toggleDeleteConfirmationModal}
      />
    </>
  );
};

export default Navbar;
