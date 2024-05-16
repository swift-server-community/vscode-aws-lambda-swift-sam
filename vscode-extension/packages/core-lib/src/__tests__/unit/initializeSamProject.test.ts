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
import { cleanupTempDirectory } from "../../utils/cleanUp";
import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { config } from "../../config/config";
import { promises as fs } from "fs";

jest.mock("../../utils/commandRunner", () => {
  let instance: any;

  return {
    CommandRunner: {
      getInstance: jest.fn(() => {
        if (!instance) {
          instance = {
            runCommand: jest.fn(),
          };
        }
        return instance;
      }),
    },
  };
});

describe("initializeSamProject", () => {
  // The following tests are meant to test the cleanupTempDirectory function
  describe("cleanupTempDirectory", () => {
    beforeEach(async () => {
      try {
        await fs.access(config.CLONED_TEMPLATES_DIR);
      } catch (error: any) {
        if (error.code === "ENOENT") {
          await fs.mkdir(config.CLONED_TEMPLATES_DIR);
        }
      }
    });

    afterEach(async () => {
      try {
        await fs.access(config.CLONED_TEMPLATES_DIR);
      } catch (error: any) {
        if (error.code === "ENOENT") {
          return;
        }
      }
      await fs.rmdir(config.CLONED_TEMPLATES_DIR);
    });

    it("should clean up the temporary directory successfully", async () => {
      await cleanupTempDirectory();

      try {
        await fs.access(config.CLONED_TEMPLATES_DIR);
        throw new Error("Directory still exists");
      } catch (error: any) {
        expect(error.code).toBe("ENOENT");
      }
    });
  });
});
