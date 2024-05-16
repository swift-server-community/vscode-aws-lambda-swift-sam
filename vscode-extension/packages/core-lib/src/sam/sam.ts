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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommandRunner } from "../utils/commandRunner";
import { cleanupTempDirectory } from "../utils/cleanUp";
import { cloneTemplate, initializeSamProject } from "../utils/initUtils";
import { CommandFailedError, CustomError } from "../errors/errors";
import { CommandResult, CLICheckResult, RegionsResult } from "../utils/types";
import { EC2Client, DescribeRegionsCommand } from "@aws-sdk/client-ec2";
import { loadConfig } from "@smithy/node-config-provider";
import {
  NODE_REGION_CONFIG_FILE_OPTIONS,
  NODE_REGION_CONFIG_OPTIONS,
} from "@smithy/config-resolver";
import fs from "fs";
import { config } from "../config/config";

const commandRunner = CommandRunner.getInstance();

/**
 * Gets all the functions
 * @param path path to the project to get the functions from
 * @async
 * @example
 * const functions = await getFunctions("/Users/my-user/Documents/my-project");
 * console.log("Functions:", functions);
 * @throws {CustomError} If the functions cannot be fetched
 * @returns {Promise<string[]>} A list of functions
 */
export async function getFunctions(path: string): Promise<string[]> {
  try {
    const file = fs.readFileSync(path + config.SWIFT_PACKAGE_FILE, "utf-8");
    const executableProducts: string[] = [];
    const regex = new RegExp(config.SWIFT_PACKAGE_FUNCTIONS_REGEX);
    let match;
    while ((match = regex.exec(file)) !== null) {
      executableProducts.push(match[1]);
    }
    return executableProducts;
  } catch (error) {
    throw new CustomError(
      "GET_FUNCTIONS_FAILED",
      "Failed to get functions",
      error as Error,
    );
  }
}

/**
 * Gets all the events
 * @param {string} path The path to the project to get the events from
 * @async
 * @example
 * const events = await getEvents("/Users/my-user/Documents/my-project");
 * console.log("Events:", events);
 * @throws {CustomError} If the events cannot be fetched
 * @returns {Promise<string[]>} A list of events
 */
export async function getEvents(path: string): Promise<string[]> {
  try {
    const files = fs.readdirSync(path + config.EVENTS_DIR);
    return files.filter((file) => file.endsWith(".json"));
  } catch (error) {
    throw new CustomError(
      "GET_EVENTS_FAILED",
      "Failed to get events",
      error as Error,
    );
  }
}

/**
 * Gets all the regions
 * @async
 * @example
 * await getRegions();
 * @throws {CustomError} If the regions cannot be fetched
 * @returns {Promise<RegionsResult>}
 */
export async function getRegions(): Promise<RegionsResult> {
  try {
    const client = new EC2Client();
    const command = new DescribeRegionsCommand({});
    const regionNames = await client.send(command).then((data) => {
      return data.Regions?.map((region) => region.RegionName) || [];
    });
    const defaultRegion =
      (await loadConfig(
        NODE_REGION_CONFIG_OPTIONS,
        NODE_REGION_CONFIG_FILE_OPTIONS,
      )()) || "us-east-1";

    return {
      default: defaultRegion as string,
      list: regionNames as string[],
    };
  } catch (error) {
    throw new CustomError(
      "GET_REGIONS_FAILED",
      "Failed to get regions",
      error as Error,
    );
  }
}

/**
 * Gets the default path
 * @returns {Promise<string>} The default path
 */
export async function getDefaultPath(): Promise<string> {
  const defaultPath = process.env.HOME + "/Documents/aws-lambda-swift";
  if (!fs.existsSync(defaultPath)) {
    fs.mkdirSync(defaultPath, { recursive: true });
  }
  return defaultPath;
}

/**
 * Checks if a folder exists
 * @param path path to the folder to check
 * @returns {boolean} Whether the folder exists
 */
export async function checkFolderExists(path: string): Promise<boolean> {
  return fs.existsSync(path);
}
/**
 * Initializes a new project
 * @param {string} name name of the project
 * @param {string} template name of the template to use
 * @param {string} path path to initialize the project in
 * @async
 * @example
 * await initializeProject("sqs", "sqs-to-lambda", "/Users/my-user/Documents/my-project");
 * @throws {CustomError} If the project cannot be initialized
 * @returns {Promise<CommandResult>}
 */
export async function runInitializeProject(
  name: string,
  template: string,
  path: string,
): Promise<CommandResult> {
  try {
    if (!name) {
      throw new CustomError(
        "SAM_INIT_FAILED",
        "Failed to initialize project. Please ensure the name is filled",
      );
    }

    if (!template) {
      throw new CustomError(
        "SAM_INIT_FAILED",
        "Failed to initialize project. Please ensure the template is filled",
      );
    }

    if (!path) {
      throw new CustomError(
        "SAM_INIT_FAILED",
        "Failed to initialize project. Please ensure the path is filled",
      );
    }

    const output: { stdout: string; stderr: string } = {
      stdout: "",
      stderr: "",
    };
    const exitCode = 0;

    await cleanupTempDirectory();
    const cloneResult = await cloneTemplate();
    output.stdout += cloneResult.output.stdout;
    output.stderr += cloneResult.output.stderr;
    if (cloneResult.exitCode !== 0) {
      throw new CommandFailedError(
        "Failed to clone the template: " + template,
        cloneResult.exitCode,
      );
    }

    const initResult = await initializeSamProject(name, template, path);
    output.stdout += initResult.output.stdout;
    output.stderr += initResult.output.stderr;
    if (initResult.exitCode !== 0) {
      throw new CommandFailedError(
        `Failed to initialize project '${name}' with template '${template}' in '${path}'`,
        initResult.exitCode,
      );
    }

    await cleanupTempDirectory();
    return { exitCode, output };
  } catch (error: any) {
    throw new CustomError(
      "SAM_INIT_FAILED",
      error.message || "Failed to initialize project",
      error as Error,
    );
  }
}

/**
 * Checks if Docker is running
 * @async
 * @example
 * await isDockerRunning();
 * @throws {CustomError} If Docker is not running
 */
async function isDockerRunning() {
  try {
    const result = await commandRunner.runCommand({
      args: ["info"],
      command: "docker",
    });
    if (result.exitCode !== 0) {
      throw new CommandFailedError(
        "Failed to check if Docker is running",
        result.exitCode,
      );
    }
  } catch (error) {
    throw new CustomError(
      "DOCKER_ERROR",
      "Docker is not running or not installed. Please ensure Docker is running and try again.",
      error as Error,
    );
  }
}

/**
 * Builds a project
 * @param path path to the project to build
 * @async
 * @example
 * await buildProject("/Users/my-user/Documents/my-project");
 * @throws {CustomError} If the project cannot be built
 * @returns {Promise<CommandResult>}
 */
export async function runBuildProject(path: string): Promise<CommandResult> {
  const args = ["build"];

  try {
    if (!path) {
      throw new CustomError(
        "PROJECT_BUILD_FAILED",
        "Failed to build project. Please ensure the path is filled",
      );
    }

    await isDockerRunning();

    const result = await commandRunner.runCommand({
      args,
      command: "sam",
      cwd: path,
    });
    if (result.exitCode !== 0) {
      throw new CommandFailedError(
        `Failed to build project in '${path}'`,
        result.exitCode,
      );
    }
    return result;
  } catch (error: any) {
    throw new CustomError(
      "PROJECT_BUILD_FAILED",
      error.message || `Failed to build project in '${path}'`,
      error as Error,
    );
  }
}

/**
 * Deploys a project
 * @param stackName name of the stack to deploy
 * @param path path to the project to deploy
 * @param region region to deploy the project in
 * @async
 * @example
 * await deployProject("sqs", "/Users/my-user/Documents/my-project", "us-east-1");
 * @throws {CustomError} If the project cannot be deployed
 * @returns {Promise<CommandResult>}
 */
export async function runDeployProject(
  stackName: string,
  path: string,
  region: string,
): Promise<CommandResult> {
  const args = [
    "deploy",
    "--stack-name",
    stackName,
    "--region",
    region,
    "--resolve-s3",
    "--no-confirm-changeset",
  ];

  try {
    if (!stackName) {
      throw new CustomError(
        "PROJECT_DEPLOY_FAILED",
        "Failed to deploy project. Please ensure the stack name is filled",
      );
    }

    if (!path) {
      throw new CustomError(
        "PROJECT_DEPLOY_FAILED",
        "Failed to deploy project. Please ensure the path is filled",
      );
    }

    if (!region) {
      throw new CustomError(
        "PROJECT_DEPLOY_FAILED",
        "Failed to deploy project. Please ensure the region is filled",
      );
    }

    const result = await commandRunner.runCommand({
      args,
      command: "sam",
      cwd: path,
    });
    if (result.exitCode !== 0) {
      throw new CommandFailedError(
        `Failed to deploy project with stackName '${stackName}' in '${path}'`,
        result.exitCode,
      );
    }
    return result;
  } catch (error: any) {
    throw new CustomError(
      "PROJECT_DEPLOY_FAILED",
      error.message ||
        `Failed to deploy project with stackName '${stackName}' in '${path}'`,
      error as Error,
    );
  }
}

/**
 * Invokes a function locally
 * @param functionName name of the lambda function to invoke
 * @param event name of the event file
 * @param path path to the project
 * @async
 * @example
 * await localInvoke("SQSQueueListener", "./events/event.json", "/Users/my-user/Documents/my-project");
 * @throws {CustomError} If the function cannot be invoked
 * @returns {Promise<CommandResult>}
 */
export async function runLocalInvoke(
  functionName: string,
  event: string,
  path: string,
): Promise<CommandResult> {
  const args = [
    "local",
    "invoke",
    functionName,
    "--event",
    `.${config.EVENTS_DIR}/${event}`,
  ];

  try {
    if (!functionName) {
      throw new CustomError(
        "LOCAL_INVOKE_FAILED",
        "Failed to invoke function. Please ensure the function name is filled",
      );
    }

    if (!event) {
      throw new CustomError(
        "LOCAL_INVOKE_FAILED",
        "Failed to invoke function. Please ensure the event is filled",
      );
    }

    if (!path) {
      throw new CustomError(
        "LOCAL_INVOKE_FAILED",
        "Failed to invoke function. Please ensure the path is filled",
      );
    }

    if (!fs.readFileSync(path + config.EVENTS_DIR + "/" + event, "utf-8")) {
      throw new CustomError(
        "LOCAL_INVOKE_FAILED",
        `Event file '${config.EVENTS_DIR}/${event}' is empty. Please provide a valid event file.`,
      );
    }

    await isDockerRunning();

    const result = await commandRunner.runCommand({
      args,
      command: "sam",
      cwd: path,
    });
    if (result.exitCode !== 0) {
      throw new CommandFailedError(
        `Failed to invoke function '${functionName}' with event from '${config.EVENTS_DIR}/${event}' locally in '${path}'. Local invoke only works with the 'api-to-lambda' template`,
        result.exitCode,
      );
    }
    return result;
  } catch (error: any) {
    throw new CustomError(
      "LOCAL_INVOKE_FAILED",
      error.message ||
        `Failed to invoke function '${functionName}' with event from '${config.EVENTS_DIR}/${event}' locally in '${path}'`,
      error as Error,
    );
  }
}

/**
 * Invokes a function remotely
 * @param stackName name of the stack to invoke the function in
 * @param functionName name of the lambda function to invoke
 * @param region region to invoke the function in
 * @param event name of the event file
 * @param path path to the project
 * @async
 * @example
 * await remoteInvoke("sqs", "SQSQueueListener", "./events/event.json", "/Users/my-user/Documents/my-project");
 * @throws {CustomError} If the function cannot be invoked
 * @returns {Promise<CommandResult>}
 */
export async function runRemoteInvoke(
  stackName: string,
  functionName: string,
  region: string,
  event: string,
  path: string,
): Promise<CommandResult> {
  const args = [
    "remote",
    "invoke",
    "--region",
    region,
    "--stack-name",
    stackName,
    functionName,
    "--event-file",
    `.${config.EVENTS_DIR}/${event}`,
  ];

  try {
    if (!stackName) {
      throw new CustomError(
        "REMOTE_INVOKE_FAILED",
        "Failed to invoke function. Please ensure the stack name is filled",
      );
    }

    if (!functionName) {
      throw new CustomError(
        "REMOTE_INVOKE_FAILED",
        "Failed to invoke function. Please ensure the function name is filled",
      );
    }

    if (!region) {
      throw new CustomError(
        "REMOTE_INVOKE_FAILED",
        "Failed to invoke function. Please ensure the region is filled",
      );
    }

    if (!event) {
      throw new CustomError(
        "REMOTE_INVOKE_FAILED",
        "Failed to invoke function. Please ensure the event is filled",
      );
    }

    if (!path) {
      throw new CustomError(
        "REMOTE_INVOKE_FAILED",
        "Failed to invoke function. Please ensure the path is filled",
      );
    }

    if (!fs.readFileSync(path + config.EVENTS_DIR + "/" + event, "utf-8")) {
      throw new CustomError(
        "LOCAL_INVOKE_FAILED",
        `Event file '${config.EVENTS_DIR}/${event}' is empty. Please provide a valid event file.`,
      );
    }

    const result = await commandRunner.runCommand({
      args,
      command: "sam",
      cwd: path,
    });
    if (result.exitCode !== 0) {
      throw new CommandFailedError(
        `Failed to invoke function '${functionName}' with event from '${config.EVENTS_DIR}/${event}' remotely in '${path}'`,
        result.exitCode,
      );
    }
    return result;
  } catch (error: any) {
    throw new CustomError(
      "REMOTE_INVOKE_FAILED",
      error.message ||
        `Failed to invoke function '${functionName}' with event from '${config.EVENTS_DIR}/${event}' remotely in '${path}'`,
      error as Error,
    );
  }
}

/**
 * Deletes a stack
 * @param stackName name of the stack to delete
 * @async
 * @example
 * await deleteStack("sqs");
 * @throws {CustomError} If the stack cannot be deleted
 * @returns {Promise<CommandResult>}
 */
export async function runDeleteStack(
  stackName: string,
  region: string,
): Promise<CommandResult> {
  const args = [
    "delete",
    "--stack-name",
    stackName,
    "--region",
    region,
    "--no-prompts",
  ];

  try {
    if (!stackName) {
      throw new CustomError(
        "STACK_DELETION_FAILED",
        "Failed to delete stack. Please ensure the stack name is filled",
      );
    }

    if (!region) {
      throw new CustomError(
        "STACK_DELETION_FAILED",
        "Failed to delete stack. Please ensure the region is filled",
      );
    }

    const result = await commandRunner.runCommand({ args, command: "sam" });
    if (
      result.exitCode !== 0 ||
      result.output.stdout.includes("does not exist")
    ) {
      throw new CommandFailedError(
        `Failed to delete stack with stackName '${stackName}'. Please ensure the stack exists in the region '${region}'`,
        result.exitCode,
      );
    }
    return result;
  } catch (error: any) {
    throw new CustomError(
      "STACK_DELETION_FAILED",
      error.message ||
        `Failed to delete stack with stackName '${stackName}' in region '${region}'`,
      error as Error,
    );
  }
}

/**
 * checks if a command-line tool is installed
 * @async
 * @example
 * await runCheckAWSCLI();
 * @returns {Promise<CLICheckResult>}
 */
export async function runCheck(command: string): Promise<CLICheckResult> {
  try {
    const result = await commandRunner.runCommand({
      args: ["--version"],
      command: command,
    });
    return {
      success: result.exitCode === 0,
      exitCode: result.exitCode,
      output: result.output,
    };
  } catch (error: any) {
    return {
      success: false,
      exitCode: 1,
      output: { stdout: "", stderr: error.message },
    };
  }
}
