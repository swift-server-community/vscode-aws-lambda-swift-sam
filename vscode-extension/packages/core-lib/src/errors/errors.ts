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

import { ErrorBase } from "../utils/error-base";

/**
 * Custom error types
 * @typedef {string} CustomErrorType
 * @type {string}
 * @property {string} INVALID_COMMAND The command is invalid
 * @property {string} CLEANUP_ERROR An error occurred during cleanup
 * @property {string} GIT_CLONE_FAILED Failed to clone the template repository
 * @property {string} SAM_INIT_FAILED Failed to initialize SAM project
 * @property {string} PROJECT_BUILD_FAILED Failed to build project
 * @property {string} PROJECT_DEPLOY_FAILED Failed to deploy project
 * @property {string} LOCAL_INVOKE_FAILED Failed to invoke project locally
 * @property {string} REMOTE_INVOKE_FAILED Failed to invoke project remotely
 * @property {string} STACK_DELETION_FAILED Failed to delete the stack
 * @property {string} TEMPLATE_FETCH_FAILED Failed to fetch the template
 */
type CustomErrorType =
  | "INVALID_COMMAND"
  | "CLEANUP_ERROR"
  | "GIT_CLONE_FAILED"
  | "SAM_INIT_FAILED"
  | "PROJECT_BUILD_FAILED"
  | "PROJECT_DEPLOY_FAILED"
  | "LOCAL_INVOKE_FAILED"
  | "REMOTE_INVOKE_FAILED"
  | "STACK_DELETION_FAILED"
  | "TEMPLATE_FETCH_FAILED"
  | "GET_REGIONS_FAILED"
  | "GET_EVENTS_FAILED"
  | "GET_FUNCTIONS_FAILED"
  | "COMMAND_FAILED"
  | "DOCKER_ERROR";

/**
 * Custom error class
 * @class
 * @extends ErrorBase
 * @param {CustomErrorType} name The name of the error
 * @param {string} message The error message
 * @param {Error | string | undefined} cause The cause of the error
 * @example
 * throw new CustomError("INVALID_COMMAND", "The command is invalid");
 */
export class CustomError extends ErrorBase<CustomErrorType> {
  constructor(
    name: CustomErrorType,
    message: string,
    cause?: Error | string | undefined,
  ) {
    super(name, message, cause);
  }
}

/**
 * Command failed error
 * @class
 * @extends CustomError
 * @param {string} message The error message
 * @param {number} exitCode The exit code of the command
 * @param {Error | string | undefined} cause The cause of the error
 * @example
 * throw new CommandFailedError("The command failed", 1);
 */
export class CommandFailedError extends CustomError {
  exitCode: number;
  constructor(
    message: string,
    exitCode: number,
    cause?: Error | string | undefined,
  ) {
    super("COMMAND_FAILED", message, cause);
    this.exitCode = exitCode;
  }
}

/**
 * Invalid command error
 * @class
 * @extends CustomError
 * @param {string} message The error message
 * @param {Error | string | undefined} cause The cause of the error
 * @example
 * throw new InvalidCommandError("The command is invalid");
 */
export class InvalidCommandError extends CustomError {
  constructor(message: string, cause?: Error | string | undefined) {
    super("INVALID_COMMAND", message, cause);
  }
}

/**
 * Cleanup error
 * @class
 * @extends CustomError
 * @param {string} message The error message
 * @param {Error | string | undefined} cause The cause of the error
 * @param {string} code The error code
 * @example
 * throw new CleanupError("An error occurred during cleanup");
 */
export class CleanupError extends CustomError {
  code?: string;

  constructor(
    message: string,
    cause?: Error | string | undefined,
    code?: string,
  ) {
    super("CLEANUP_ERROR", message, cause);
    this.code = code;
  }
}

/**
 * Git clone failed error
 * @class
 * @extends CustomError
 * @param {string} message The error message
 * @param {Error | string | undefined} cause The cause of the error
 * @example
 * throw new GitCloneFailedError("Failed to clone the template repository");
 */
export class GitCloneFailedError extends CustomError {
  constructor(message: string, cause?: Error | string | undefined) {
    super("GIT_CLONE_FAILED", message, cause);
  }
}

/**
 * SAM init failed error
 * @class
 * @extends CustomError
 * @param {string} message The error message
 * @param {Error | string | undefined} cause The cause of the error
 * @example
 * throw new SamInitFailedError("Failed to initialize SAM project");
 */
export class SamInitFailedError extends CustomError {
  constructor(message: string, cause?: Error | string | undefined) {
    super("SAM_INIT_FAILED", message, cause);
  }
}

/**
 * Project build failed error
 * @class
 * @extends CustomError
 * @param {string} message The error message
 * @param {Error | string | undefined} cause The cause of the error
 * @example
 * throw new ProjectBuildFailedError("Failed to build project");
 */
export class TemplateFetchError extends CustomError {
  constructor(message: string, cause?: Error | string) {
    super("TEMPLATE_FETCH_FAILED", message, cause);
  }
}
