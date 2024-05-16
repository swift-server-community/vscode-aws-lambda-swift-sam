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

import React, { createContext, useContext, useState, ReactNode } from "react";

/**
 * Interface representing the context value for error management.
 */
interface ErrorContextType {
  error: Error | null;
  // eslint-disable-next-line no-unused-vars
  setError: (errorMessage: Error | null) => void;
}

/**
 * Context for managing error state and providing it to components.
 */
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

/**
 * Provider component for the ErrorContext.
 * Manages the error state and provides it to the context.
 * @param children The child components wrapped by the provider.
 */
export const ErrorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // State to manage the error
  const [error, setError] = useState<Error | null>(null);

  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  );
};

/**
 * Custom hook for accessing the error context.
 * Throws an error if used outside of an ErrorProvider.
 * @returns The error context value.
 */
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};
