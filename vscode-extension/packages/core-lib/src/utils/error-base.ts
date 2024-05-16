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

/**
 * Base class for all custom errors
 * @class
 * @extends Error
 * @template T
 * @param {T} name The name of the error
 * @param {string} message The error message
 * @param {Error | string | undefined} cause The cause of the error
 * @example
 * throw new CustomError("INVALID_COMMAND", "The command is invalid");
 */
export class ErrorBase<T extends string> extends Error {
  name: T;
  message: string;
  cause: Error | string | undefined;

  constructor(name: T, message: string, cause: Error | string | undefined) {
    super();
    this.name = name;
    this.message = message;
    this.cause = cause;
  }
}
