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

import { CleanupError } from "../errors/errors";
import { config } from "../config/config";
import { promises as fs } from "fs";
import logger from "../logger";

/**
 * Cleans up the temporary directory
 * @async
 * @example
 * await cleanupTempDirectory();
 * @throws {Error} If the temporary directory cannot be cleaned up
 * @returns {Promise<void>}
 */
export async function cleanupTempDirectory(): Promise<void> {
  try {
    await fs.rm(config.CLONED_TEMPLATES_DIR, { recursive: true });
    logger.debug("Temporary directory cleanup successful.");
  } catch (error) {
    const err = error as CleanupError;
    if (err.code === "ENOENT") {
      logger.debug("Temporary directory does not exist. No cleanup needed.");
    } else {
      throw new CleanupError(
        "Failed to clean up temporary directory",
        err,
        err.code,
      );
    }
  }
}
