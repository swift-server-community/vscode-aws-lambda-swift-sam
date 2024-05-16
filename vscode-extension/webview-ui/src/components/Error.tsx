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
import { useError } from "../context/ErrorProvider";
import { VscClose, VscBracketError } from "react-icons/vsc";
import "./Error.css";

/**
 * Represents a component for displaying error messages.
 * @returns {JSX.Element} - The rendered Error component.
 */
const Error = () => {
  // Accessing error state and setError function from ErrorProvider context
  const { error, setError } = useError();

  // Function to clear the error message
  const clearError = () => {
    setError(null);
  };

  return (
    <>
      {/* Rendering error message if error state exists */}
      {error && (
        <div className="error-container">
          {/* Close icon to clear the error */}
          <div className="close-icon" onClick={clearError}>
            <VscClose size={15} />
          </div>
          {/* Error content */}
          <div className="error-content">
            {/* Error type */}
            <div className="error-type">TYPE: {error.name}</div>
            {/* Error message */}
            <div className="error-message">MESSAGE: {error.message}</div>
          </div>
          {/* Error icon */}
          <div className="error-icon">
            <VscBracketError size={60} />
          </div>
        </div>
      )}
    </>
  );
};

export default Error;
