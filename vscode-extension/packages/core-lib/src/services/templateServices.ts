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

import axios from "axios";
import { TemplateFetchError } from "../errors/errors";
import { TemplatesResult } from "../utils/types";

/** Get the titles of the templates from the JSON file.
 * @param {string} URL The URL of the JSON file
 * @param {string} branch The branch of the repository
 * @throws {Error} If the URL is not defined in the environment
 * @async
 * @example
 * const titles = await getTemplateTitles("https://example.com/templates.json", "main");
 * console.log("Template titles:", titles);
 * @returns {Promise<TemplatesResult>} The titles of the templates with their images
 */
export async function getTemplateTitles(
  URL: string,
  branch: string,
): Promise<TemplatesResult> {
  if (!URL || URL === "") {
    throw new TemplateFetchError(
      "TEMPLATES_JSON_URL is not defined in the environment.",
    );
  }

  if (!branch || branch === "") {
    throw new TemplateFetchError("Branch is not defined.");
  }

  try {
    const response = await axios.get(`${URL}/${branch}/cookiecutter.json`);

    const result = Object.entries(response.data.templates).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ([key, value]: [string, any]) => ({
        name: key,
        path: value.path,
      }),
    );

    return { list: result };
  } catch (error) {
    throw new TemplateFetchError(
      `Error fetching template titles: ${error}`,
      error as Error,
    );
  }
}

/**
 * Get the branches of the template repository.
 * @param {string} repoUrl The URL of the GitHub repository
 * @throws {Error} If the URL is not defined or if there's an error fetching the branches
 * @async
 * @example
 * const branches = await getTemplateBranches("https://github.com/username/repository");
 * console.log("Branches:", branches);
 * @returns {Promise<string[]>} The branches of the repository
 */
export async function getTemplateBranches(repoUrl: string): Promise<string[]> {
  if (!repoUrl || repoUrl === "") {
    throw new TemplateFetchError("Repository URL is not defined.");
  }

  const apiUrl = `${repoUrl}/branches/all`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Accept: "application/json",
      },
    });
    return response.data.payload.branches.map(
      (branch: { name: string }) => branch.name,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new TemplateFetchError(
      `Error fetching template branches: ${error.message}`,
      error,
    );
  }
}
