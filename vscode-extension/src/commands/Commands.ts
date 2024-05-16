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
import * as Sam from "core-lib";
import { window, workspace, env } from "vscode";

/**
 * Fetches functions from the specified path.
 * @param {any} data - Path information.
 * @returns {Promise<{ functions: any[], success: boolean }>} An object containing fetched functions and success status.
 */
export async function getFunctions(data: any) {
  const path = data.path;
  const functions = await Sam.getFunctions(path);
  return { functions, success: true };
}

/**
 * Check if folder exists.
 * @param {any} data - Folder path information.
 * @returns {Promise<{ exists: boolean }>} An object containing whether the folder exists.
 */
export async function checkFolderExists(data: any) {
  const path = data.path;
  const type = data.type;
  const exists = await Sam.checkFolderExists(path);
  return { exists, type };
}

/**
 * Fetches events from the specified path.
 * @param {any} data - Path information.
 * @returns {Promise<{ events: any[], success: boolean }>} An object containing fetched events and success status.
 */
export async function getEvents(data: any) {
  const path = data.path;
  const events = await Sam.getEvents(path);
  return { events, success: true };
}

/**
 * Fetches necessary data to initialize the project.
 * @returns {Promise<{ templates: any[], path: string, regions: any[], locale: string, theme: string }>} Object with templates, path, regions, locale, and theme.
 */
export async function getReady() {
  try {
    let templates = { list: [{ name: "", path: "" }] };
    try {
      templates = await Sam.getTemplates();
    } catch (error: any) {
      window.showErrorMessage(
        "Failed to fetch templates. Please check your internet connection and try again.",
      );
    }
    const path =
      workspace.workspaceFolders?.[0].uri.fsPath ||
      (await Sam.getDefaultPath()) ||
      "";
    let regions = {
      default: "",
      list: [] as string[],
    };
    try {
      regions = await Sam.getRegions();
    } catch (error: any) {
      window.showErrorMessage(
        "Failed to fetch regions. This could be due to a lack of internet connection or missing AWS credentials (AWS CLI).",
      );
    }
    const locale = env.language || "en";
    const theme = window.activeColorTheme.kind || "dark";
    return { templates, path, regions, locale, theme };
  } catch (error: any) {
    window.showErrorMessage(error.message);
  }
}

/**
 * Subscribes to console output.
 * @param {Function} callback - Function to handle console output.
 */
export async function subscribeToConsole(callback: (data: string) => void) {
  try {
    Sam.subscribeToStdout(callback);
    Sam.subscribeToStderr(callback);
  } catch (error: any) {
    window.showErrorMessage(error.message);
  }
}

/**
 * Checks prerequisites for serverless applications.
 * @returns {Promise<any[]>} List of prerequisites.
 */
export async function checkPrerequisites() {
  try {
    const result = await Sam.checkAllRequirements();
    if (result.prerequisites) {
      const missingRequirements = result.prerequisites.filter(
        (req) => !req.success,
      );
      if (missingRequirements.length > 0) {
        const missingPackages = missingRequirements
          .map((req) => req.name)
          .join(", ");
        window.showInformationMessage(
          `The following packages are missing: ${missingPackages}. Please install them and restart the extension for it to work as intended.`,
        );
      }
    }
    return result.prerequisites;
  } catch (error: any) {
    window.showErrorMessage(error.message);
  }
}

/**
 * Initializes a new project.
 * @param {any} data - Project initialization information.
 * @returns {Promise<{ success: boolean }>} Success status of project initialization.
 */
export async function initializeProject(data: any) {
  try {
    const name = data.name;
    const selectedTemplate = data.template;
    let path = data.path;

    if (!path) {
      const workspaceFolders = workspace.workspaceFolders;
      path = workspaceFolders?.[0]?.uri.fsPath;
    }

    const result = await Sam.initializeProject(name, selectedTemplate, path);
    return { success: result.exitCode === 0 };
  } catch (error: any) {
    window.showErrorMessage(error.message);
    throw error;
  }
}

/**
 * Builds the project located at the specified path.
 * @param {any} data - Build information.
 * @returns {Promise<{ success: boolean }>} Success status of the build process.
 */
export async function buildProject(data: any) {
  try {
    const path = data.path;
    const result = await Sam.buildProject(path);
    return { success: result.exitCode === 0 };
  } catch (error: any) {
    window.showErrorMessage(error.message);
    throw error;
  }
}

/**
 * Invokes a function locally.
 * @param {any} data - Local invocation information.
 * @returns {Promise<{ success: boolean }>} Success status of the local invocation.
 */
export async function localInvoke(data: any) {
  try {
    const path = data.path;
    const eventPath = data.eventPath;
    const functionName = data.functionName;
    const result = await Sam.localInvoke(functionName, eventPath, path);
    return { success: result.exitCode === 0 };
  } catch (error: any) {
    window.showErrorMessage(error.message);
    throw error;
  }
}

/**
 * Deploys the project to AWS.
 * @param {any} data - Deployment information.
 * @returns {Promise<{ success: boolean }>} Success status of the deployment process.
 */
export async function deployProject(data: any) {
  try {
    const path = data.path;
    const stackName = data.stackName;
    const region = data.region;
    const result = await Sam.deployProject(stackName, path, region);
    return { success: result.exitCode === 0 };
  } catch (error: any) {
    window.showErrorMessage(error.message);
    throw error;
  }
}

/**
 * Invokes a function remotely.
 * @param {any} data - Remote invocation information.
 * @returns {Promise<{ success: boolean }>} Success status of the remote invocation.
 */
export async function remoteInvoke(data: any) {
  try {
    const path = data.path;
    const eventPath = data.eventPath;
    const functionName = data.functionName;
    const stackName = data.stackName;
    const region = data.region;
    const result = await Sam.remoteInvoke(
      stackName,
      functionName,
      region,
      eventPath,
      path,
    );
    return { success: result.exitCode === 0 };
  } catch (error: any) {
    window.showErrorMessage(error.message);
    throw error;
  }
}

/**
 * Deletes a stack from AWS.
 * @param {any} data - Stack deletion information.
 * @returns {Promise<{ success: boolean }>} Success status of the stack deletion.
 */
export async function deleteStack(data: any) {
  try {
    const stackName = data.stackName;
    const region = data.region;
    const result = await Sam.deleteStack(stackName, region);
    return { success: result.exitCode === 0 };
  } catch (error: any) {
    window.showErrorMessage(error.message);
    throw error;
  }
}
