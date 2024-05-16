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
 * Interface representing the result of a command execution.
 * Contains information about the command's exit code and output.
 * @interface
 * @member exitCode - The exit code returned by the command process.
 * @member output - An object containing the standard output (stdout) and standard error (stderr) of the command.
 */
export interface CommandResult {
  exitCode: number;
  output: {
    stdout: string;
    stderr: string;
  };
}

/**
 * Interface representing the result of a CLI check.
 * Contains information about the success of the check, exit code, and output.
 * @interface
 * @member success - Indicates whether the CLI check was successful or not.
 * @member AWSCLI - Indicates whether the AWS CLI is installed.
 * @member Docker - Indicates whether Docker is installed.
 * @member SAMCLI - Indicates whether the SAM CLI is installed.
 * @member exitCode - The exit code returned by the CLI check process.
 * @member output - An object containing the standard output (stdout) and standard error (stderr) of the CLI check.
 */
export interface CLICheckResult {
  success: boolean;
  prerequisites?: Array<{ name: string; url: string; success: boolean }>;
  exitCode: number;
  output: {
    stdout: string;
    stderr: string;
  };
}

/**
 * interface representing the result of all the regions
 * @interface
 * @member default - The default region.
 * @member regions - An array containing all the regions.
 */
export interface RegionsResult {
  default: string;
  list: Array<string>;
}

/**
 * interface representing the result of all the templates
 * @interface
 * @member list - An array containing all the templates.
 */
export interface TemplatesResult {
  list: Array<{ name: string; path: string }>;
}
