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

import { checkAWSCLI, checkSAMCLI, checkDocker } from "../../facade";
import { describe, it, expect } from "@jest/globals";

describe("checkRequirements", () => {
  describe("checkAWSCLI", () => {
    it("should return true if AWS CLI is installed", async () => {
      const result = await checkAWSCLI();
      expect(result).toBeDefined();
    });
  });
  describe("checkSAMCLI", () => {
    it("should return true if SAM CLI is installed", async () => {
      const result = await checkSAMCLI();
      expect(result).toBeDefined();
    });
  });
  describe("checkDocker", () => {
    it("should return true if Docker is installed", async () => {
      const result = await checkDocker();
      expect(result).toBeDefined();
    });
  });
});
