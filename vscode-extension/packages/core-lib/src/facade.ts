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

/* eslint-disable no-unused-vars */
import { getTemplateTitles } from "./services/templateServices";
import logger from "./logger";
import { config } from "./config/config";
import * as Sam from "./sam/sam";
import { CommandRunner } from "./utils/commandRunner";
import {
  CommandResult,
  CLICheckResult,
  RegionsResult,
  TemplatesResult,
} from "./utils/types";

const commandRunner = CommandRunner.getInstance();

/**
 * Gets all the functions
 * @param {string} path The path to the project to get the functions from
 * @async
 * @example
 * const functions = await getFunctions("/Users/my-user/Documents/my-project");
 * console.log("Functions:", functions);
 * @throws {Error} If the functions cannot be fetched
 * @returns {Promise<string[]>} A list of functions
 */
export async function getFunctions(path: string): Promise<string[]> {
  logger.debug("Getting functions...");
  return await Sam.getFunctions(path);
}

/**
 * Gets all the events
 * @param {string} path The path to the project to get the events from
 * @async
 * @example
 * const events = await getEvents("/Users/my-user/Documents/my-project");
 * console.log("Events:", events);
 * @throws {Error} If the events cannot be fetched
 * @returns {Promise<string[]>} A list of events
 */
export async function getEvents(path: string): Promise<string[]> {
  logger.debug("Getting events...");
  return await Sam.getEvents(path);
}

/**
 * Gets all the regions
 * @async
 * @example
 * await getRegions();
 * @throws {Error} If the regions cannot be fetched
 * @returns {Promise<RegionsResult>}
 */
export async function getRegions(): Promise<RegionsResult> {
  logger.debug("Getting regions...");
  return await Sam.getRegions();
}

/**
 * Gets the default path
 * @async
 * @example
 * const defaultPath = await getDefaultPath();
 * console.log("Default path:", defaultPath);
 * @throws {Error} If the default path cannot be retrieved
 * @returns {Promise<string>} The default path
 */
export async function getDefaultPath(): Promise<string> {
  return await Sam.getDefaultPath();
}

/**
 * Checks if a folder exists
 * @param {string} path The path to the folder to check
 * @async
 * @example
 * const exists = await checkFolderExists("/Users/my-user/Documents/my-project");
 * console.log("Folder exists:", exists);
 * @throws {Error} If the folder existence cannot be checked
 * @returns {Promise<boolean>} Whether the folder exists
 */
export async function checkFolderExists(path: string): Promise<boolean> {
  return await Sam.checkFolderExists(path);
}
/**
 * Subscribes to stdout events
 * @param {function} listener The listener function to be called when stdout data is emitted
 * @example
 * subscribeToStdout((data) => console.log(data));
 * @returns {void}
 */
export function subscribeToStdout(listener: (data: string) => void) {
  commandRunner.subscribe("stdout", listener);
}

/**
 * Unsubscribes from stdout events
 * @param {function} listener The listener function to be removed from stdout subscriptions
 * @example
 * unsubscribeFromStdout((data) => console.log(data));
 * @returns {void}
 */
export function unsubscribeFromStdout(listener: (data: string) => void) {
  commandRunner.unsubscribe("stdout", listener);
}

/**
 * Subscribes to stderr events
 * @param {function} listener The listener function to be called when stderr data is emitted
 * @example
 * subscribeToStderr((data) => console.error(data));
 * @returns {void}
 */
export function subscribeToStderr(listener: (data: string) => void) {
  commandRunner.subscribe("stderr", listener);
}

/**
 * Unsubscribes from stderr events
 * @param {function} listener The listener function to be removed from stderr subscriptions
 * @example
 * unsubscribeFromStderr((data) => console.error(data));
 * @returns {void}
 */
export function unsubscribeFromStderr(listener: (data: string) => void) {
  commandRunner.unsubscribe("stderr", listener);
}

/**
 * Gets a list of available template titles
 * @async
 * @example
 * const templates = await getTemplates();
 * console.log("Available templates:", templates);
 * @throws {Error} If the templates cannot be retrieved
 * @returns {Promise<string[]>} A list of available template titles
 */
export async function getTemplates(): Promise<TemplatesResult> {
  logger.debug("Getting templates...");
  return await getTemplateTitles(config.TEMPLATES_JSON_URL);
}

/**
 * Initializes a new project
 * @param {string} name The name of the project
 * @param {string} template The name of the template to use
 * @param {string} path The path to initialize the project in
 * @async
 * @example
 * await initializeProject("sqs", "sqs-to-lambda", "/Users/my-user/Documents/my-project");
 * @throws {Error} If the project cannot be initialized
 * @returns {Promise<CommandResult>}
 */
export async function initializeProject(
  name: string,
  template: string,
  path: string,
): Promise<CommandResult> {
  logger.debug(
    `Initializing project with template ${template} and name ${name} in directory ${path}...`,
  );
  return await Sam.runInitializeProject(name, template, path);
}

/**
 * Builds a project
 * @param {string} path The path to the project to build
 * @async
 * @example
 * await buildProject("/Users/my-user/Documents/my-project");
 * @throws {Error} If the project cannot be built
 * @returns {Promise<CommandResult>}
 */
export async function buildProject(path: string): Promise<CommandResult> {
  logger.debug(`Building project in directory ${path}...`);
  return await Sam.runBuildProject(path);
}

/**
 * Deploys a project
 * @param {string} stackName The name of the stack to deploy
 * @param {string} path The path to the project to deploy
 * @param {string} region The region to deploy the project in
 * @async
 * @example
 * await deployProject("sqs", "/Users/my-user/Documents/my-project", "us-east-1");
 * @throws {Error} If the project cannot be deployed
 * @returns {Promise<CommandResult>}
 */
export async function deployProject(
  stackName: string,
  path: string,
  region: string,
): Promise<CommandResult> {
  logger.debug(
    `Deploying project with stack name ${stackName} in directory ${path}...`,
  );
  return await Sam.runDeployProject(stackName, path, region);
}

/**
 * Invokes a function locally
 * @param {string} functionName The name of the Lambda function to invoke
 * @param {string} event The name of the event file
 * @param {string} path The path to the project to invoke the function in
 * @async
 * @example
 * await localInvoke("MyFunction", "./events/event.json", "/Users/my-user/Documents/my-project");
 * @throws {Error} If the function cannot be invoked
 * @returns {Promise<CommandResult>}
 */
export async function localInvoke(
  functionName: string,
  event: string,
  path: string,
): Promise<CommandResult> {
  logger.debug(
    `Invoking function ${functionName} with event ${event} in directory ${path}...`,
  );
  return await Sam.runLocalInvoke(functionName, event, path);
}

/**
 * Invokes a function remotely
 * @param {string} stackName The name of the stack
 * @param {string} functionName The name of the Lambda function to invoke
 * @param {string} region The region to invoke the function in
 * @param {string} event the name of the event file
 * @param {string} path The path to the project to invoke the function in
 * @async
 * @example
 * await remoteInvoke("sqs", "MyFunction", "./events/event.json", "/Users/my-user/Documents/my-project");
 * @throws {Error} If the function cannot be invoked
 * @returns {Promise<CommandResult>}
 */
export async function remoteInvoke(
  stackName: string,
  functionName: string,
  region: string,
  event: string,
  path: string,
): Promise<CommandResult> {
  logger.debug("Invoking function remotely...");
  return await Sam.runRemoteInvoke(
    stackName,
    functionName,
    region,
    event,
    path,
  );
}

/**
 * Deletes a stack
 * @param {string} stackName The name of the stack to delete
 * @param {string} region The region to delete the stack from
 * @async
 * @example
 * await deleteStack("sqs", "us-east-1");
 * @throws {Error} If the stack cannot be deleted
 * @returns {Promise<CommandResult>}
 */
export async function deleteStack(
  stackName: string,
  region: string,
): Promise<CommandResult> {
  logger.debug(`Deleting stack: ${stackName}, in region: ${region}...`);
  return await Sam.runDeleteStack(stackName, region);
}

/**
 * Checks all requirements
 * @async
 * @example
 * const requirements = await checkAllRequirements();
 * console.log("Requirements:", requirements);
 * @throws {Error} If the requirements cannot be checked
 * @returns {Promise<CLICheckResult>} An object containing the results of the requirement checks
 */
export async function checkAllRequirements(): Promise<CLICheckResult> {
  logger.debug("Checking all requirements...");
  const awsCLI = await Sam.runCheck("aws");
  const samCLI = await Sam.runCheck("sam");
  const docker = await Sam.runCheck("docker");

  const success = awsCLI.success && samCLI.success && docker.success;

  const output = {
    stdout: `${awsCLI.output.stdout}${samCLI.output.stdout}${docker.output.stdout}`,
    stderr: `${awsCLI.output.stderr}${samCLI.output.stderr}${docker.output.stderr}`,
  };

  const exitCode = success ? 0 : 1;

  return {
    success,
    prerequisites: [
      {
        name: "Docker",
        url: "https://www.docker.com/",
        success: docker.success,
      },
      {
        name: "AWS CLI",
        url: "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html",
        success: docker.success,
      },
      {
        name: "AWS SAM CLI",
        url: "https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html",
        success: samCLI.success,
      },
    ],
    exitCode,
    output,
  };
}

/**
 * Checks if AWS CLI is installed
 * @async
 * @example
 * const awsCLI = await checkAWSCLI();
 * console.log("AWS CLI:", awsCLI);
 * @throws {Error} If AWS CLI cannot be checked
 * @returns {Promise<CLICheckResult>} Whether AWS CLI is installed
 */
export async function checkAWSCLI(): Promise<CLICheckResult> {
  logger.debug("Checking AWS CLI...");
  return await Sam.runCheck("aws");
}

/**
 * Checks if SAM CLI is installed
 * @async
 * @example
 * const samCLI = await checkSAMCLI();
 * console.log("SAM CLI:", samCLI);
 * @throws {Error} If SAM CLI cannot be checked
 * @returns {Promise<CLICheckResult>} Whether SAM CLI is installed
 */
export async function checkSAMCLI(): Promise<CLICheckResult> {
  logger.debug("Checking SAM CLI...");
  return await Sam.runCheck("sam");
}

/**
 * Checks if Docker is installed
 * @async
 * @example
 * const docker = await checkDocker();
 * console.log("Docker:", docker);
 * @throws {Error} If Docker cannot be checked
 * @returns {Promise<CLICheckResult>} Whether Docker is installed
 */
export async function checkDocker(): Promise<CLICheckResult> {
  logger.debug("Checking Docker...");
  return await Sam.runCheck("docker");
}
