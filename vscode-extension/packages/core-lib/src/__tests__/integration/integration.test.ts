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

import {
  getTemplates,
  initializeProject,
  buildProject,
  localInvoke,
  deployProject,
  remoteInvoke,
  deleteStack,
  subscribeToStdout,
  subscribeToStderr,
} from "../../facade";
import { describe, it, expect, afterAll } from "@jest/globals";
import { promises as fs } from "fs";

describe("Integration test", () => {
  const projectPath = "/tmp";
  const projectName = "api-to-lambda-test";
  const functionName = "HelloWorld";
  const eventPath = "./events/event.json";
  const region = "eu-west-3";

  afterAll(async () => {
    // Clean up
    await fs.rm(projectPath + "/" + projectName, {
      recursive: true,
      force: true,
    });
  });

  it("should perform end-to-end (init to localInvoke) project lifecycle successfully", async () => {
    subscribeToStderr((data) => {
      //do something with stderr
      data;
    });
    subscribeToStdout((data) => {
      //do something with stdout
      data;
    });

    const titles = await getTemplates();
    expect(titles.list.length).toBeGreaterThan(0);

    const templateName = titles.list[0].name;

    await initializeProject(projectName, templateName, projectPath);

    await buildProject(projectPath + "/" + projectName);

    await localInvoke(functionName, eventPath, `${projectPath}/${projectName}`);

    await deployProject(projectName, `${projectPath}/${projectName}`, region);

    await remoteInvoke(
      projectName,
      functionName,
      region,
      eventPath,
      `${projectPath}/${projectName}`,
    );

    await deleteStack(projectName, region);
  }, 2400000);
});
