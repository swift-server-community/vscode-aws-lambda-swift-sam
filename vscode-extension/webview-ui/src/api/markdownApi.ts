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

// This file contains the API for fetching Markdown files from the specified template repository.
const GITHUB_API_URL =
  process.env.GITHUB_API_URL ||
  "https://raw.githubusercontent.com/swift-server-community/aws-lambda-swift-sam-template/main/";

/**
 * Fetches a Markdown file from the specified template repository.
 * @param {string} template - The name of the template repository.
 * @returns {Promise<string>} - A promise that resolves to the content of the Markdown file.
 * @throws {Error} - If fetching the Markdown file fails.
 */
export async function fetchMarkdownFile(template: string): Promise<string> {
  // Constructing the URL of the Markdown file
  const url = `${GITHUB_API_URL}/${template}/doc/INFO.md`;

  try {
    // Fetching the Markdown file
    const response = await fetch(url);

    // Checking if the response is successful
    if (!response.ok) {
      // Throwing an error if fetching fails
      throw new Error(`Failed to fetch Markdown file: ${response.statusText}`);
    }

    // Returning the content of the Markdown file
    return await response.text();
  } catch (error) {
    // Logging and rethrowing any errors that occur during fetching
    return "# Error fetching Markdown file\n\n" + error;
  }
}
