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

import { CommandRunner } from "./commandRunner";
import { GitCloneFailedError, SamInitFailedError } from "../errors/errors";
import { config } from "../config/config";
import { CommandResult } from "./types";

const commandRunner = CommandRunner.getInstance();

/**
 * Clones the template repository
 * @async
 * @example
 * await cloneTemplate();
 * @throws {GitCloneFailedError} If the template repository cannot be cloned
 * @returns {Promise<CommandResult>}
 */
export async function cloneTemplate(branch: string): Promise<CommandResult> {
  const cloneArgs: string[] = [
    "clone",
    "--single-branch",
    "--branch",
    branch,
    "--depth",
    "1",
    config.TEMPLATES_REPO_URL,
    config.CLONED_TEMPLATES_DIR,
  ];

  try {
    return await commandRunner.runCommand({ args: cloneArgs, command: "git" });
  } catch (error) {
    throw new GitCloneFailedError(
      "Failed to clone the template repository",
      error as Error,
    );
  }
}

/**
 * Initializes a new SAM project
 * @param {string} name The name of the project
 * @param {string} template The name of the template to use
 * @param {string} path The path to initialize the project in
 * @async
 * @example
 * await initializeSamProject("sqs", "sqs-to-lambda", "/Users/my-user/Documents/my-project");
 * @throws {SamInitFailedError} If the project cannot be initialized
 * @returns {Promise<CommandResult>}
 */
export async function initializeSamProject(
  name: string,
  template: string,
  path: string,
): Promise<CommandResult> {
  const args: string[] = [
    "init",
    "-l",
    `${config.CLONED_TEMPLATES_DIR}/templates/${template}`,
    "--name",
    name,
    "--no-interactive",
    "--no-input",
  ];

  try {
    return await commandRunner.runCommand({ args, command: "sam", cwd: path });
  } catch (error) {
    throw new SamInitFailedError(
      "Failed to initialize SAM project",
      error as Error,
    );
  }
}
