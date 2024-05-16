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

import { commands, ExtensionContext } from "vscode";
import { MainPanel } from "./panels/MainPanel";

/**
 * Activates the extension.
 * @param {ExtensionContext} context - The extension context.
 */
export function activate(context: ExtensionContext) {
  /**
   * Registers the command to show the main panel.
   */
  context.subscriptions.push(
    commands.registerCommand("vals.showMainPanel", () => {
      MainPanel.render(context.extensionUri);
    }),
  );
}
