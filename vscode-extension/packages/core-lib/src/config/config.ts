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

export const config = {
  RAW_TEMPLATES_REPO_URL:
    process.env.RAW_TEMPLATES_REPO_URL ||
    "https://raw.githubusercontent.com/swift-server-community/aws-lambda-swift-sam-template",
  TEMPLATES_REPO_URL:
    process.env.TEMPLATES_REPO_URL ||
    "https://github.com/swift-server-community/aws-lambda-swift-sam-template",
  CLONED_TEMPLATES_DIR:
    process.env.CLONED_TEMPLATES_DIR || "/tmp/template-repo",
  EVENTS_DIR: process.env.EVENTS_DIR || "/events",
  SWIFT_PACKAGE_FILE: process.env.SWIFT_PACKAGE_FILE || "/Package.swift",
  SWIFT_PACKAGE_FUNCTIONS_REGEX:
    process.env.SWIFT_PACKAGE_REGEX || /\.executable\(name: "(.*?)"/g,
};
