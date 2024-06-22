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
  Disposable,
  Webview,
  WebviewPanel,
  window,
  Uri,
  ViewColumn,
  env,
} from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";
import {
  getReady,
  initializeProject,
  subscribeToConsole,
  checkPrerequisites,
  buildProject,
  localInvoke,
  deployProject,
  remoteInvoke,
  deleteStack,
  getEvents,
  getFunctions,
  checkFolderExists,
  getTemplates,
} from "../commands/Commands";

/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering HelloWorld webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class MainPanel {
  public static currentPanel: MainPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  /**
   * The MainPanel
   * class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: WebviewPanel, extensionUri: Uri) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      extensionUri,
    );

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);

    // Listen for changes in the color theme
    window.onDidChangeActiveColorTheme(() => {
      this._handleColorThemeChange();
    });
  }

  /**
   * Handles the color theme change event.
   */
  private _handleColorThemeChange() {
    // Notify the webview panel that the color theme has changed
    this._panel.webview.postMessage({
      command: "themeChange",
      data: { theme: window.activeColorTheme.kind },
    });
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
  public static render(extensionUri: Uri) {
    if (MainPanel.currentPanel) {
      // If the webview panel already exists reveal it
      MainPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = window.createWebviewPanel(
        // Panel view type
        "vals",
        // Panel title
        "vscode aws lambda swift",
        // The editor column the panel should be displayed in
        ViewColumn.One,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          // Restrict the webview to only load resources from the `out` and `webview-ui/build` directories
          localResourceRoots: [
            Uri.joinPath(extensionUri, "out"),
            Uri.joinPath(extensionUri, "webview-ui/build"),
            Uri.joinPath(extensionUri, "webview-ui/build/src/assets"),
          ],
          retainContextWhenHidden: true,
        },
      );

      MainPanel.currentPanel = new MainPanel(panel, extensionUri);
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    MainPanel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the React webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, [
      "webview-ui",
      "build",
      "assets",
      "index.css",
    ]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, [
      "webview-ui",
      "build",
      "assets",
      "index.js",
    ]);

    const nonce = getNonce();

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src * data:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; connect-src *;">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>VSCODE AWS LAMBDA SWIFT</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */
  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const data = message.data;

        switch (command) {
          case "templates":
            getTemplates(data)
              .then((response) => {
                webview.postMessage({ command: "templates", data: response });
              })
              .catch((error) => {
                webview.postMessage({
                  command: "templates",
                  data: { success: false, error },
                });
              });
            return;
          case "checkExists":
            checkFolderExists(data)
              .then((response) => {
                webview.postMessage({
                  command: "checkResult",
                  data: response,
                });
              })
              .catch((error) => {
                webview.postMessage({
                  command: "checkResult",
                  data: { success: false, error },
                });
              });
            return;
          case "functions":
            getFunctions(data)
              .then((response) => {
                webview.postMessage({ command: "functions", data: response });
              })
              .catch((error) => {
                webview.postMessage({
                  command: "functions",
                  data: { success: false, error },
                });
              });
            return;
          case "events":
            getEvents(data)
              .then((response) => {
                webview.postMessage({ command: "events", data: response });
              })
              .catch((error) => {
                webview.postMessage({
                  command: "events",
                  data: { success: false, error },
                });
              });
            return;
          case "ready":
            getReady().then((response) => {
              webview.postMessage({ command: "ready", data: response });
            });
            return;
          case "console":
            subscribeToConsole((data) => {
              webview.postMessage({ command: "console", data });
            });
            return;
          case "checkPrerequisites":
            checkPrerequisites().then((response) => {
              webview.postMessage({
                command: "checkPrerequisites",
                data: response,
              });
            });
            return;
          case "initializeProject":
            initializeProject(data)
              .then((response) => {
                webview.postMessage({
                  command: "initializeProject",
                  data: response,
                });
              })
              .catch((error) => {
                webview.postMessage({
                  command: "initializeProject",
                  data: { success: false, error },
                });
              });
            return;
          case "buildProject":
            buildProject(data)
              .then((response) => {
                webview.postMessage({
                  command: "buildProject",
                  data: response,
                });
              })
              .catch((error) => {
                webview.postMessage({
                  command: "buildProject",
                  data: { success: false, error },
                });
              });
            return;
          case "localInvoke":
            localInvoke(data)
              .then((response) => {
                webview.postMessage({ command: "localInvoke", data: response });
              })
              .catch((error) => {
                webview.postMessage({
                  command: "localInvoke",
                  data: { success: false, error },
                });
              });
            return;
          case "deployProject":
            deployProject(data)
              .then((response) => {
                webview.postMessage({
                  command: "deployProject",
                  data: response,
                });
              })
              .catch((error) => {
                webview.postMessage({
                  command: "deployProject",
                  data: { success: false, error },
                });
              });
            return;
          case "remoteInvoke":
            remoteInvoke(data)
              .then((response) => {
                webview.postMessage({
                  command: "remoteInvoke",
                  data: response,
                });
              })
              .catch((error) => {
                webview.postMessage({
                  command: "remoteInvoke",
                  data: { success: false, error },
                });
              });
            return;
          case "deleteStack":
            deleteStack(data)
              .then((response) => {
                webview.postMessage({ command: "deleteStack", data: response });
              })
              .catch((error) => {
                webview.postMessage({
                  command: "deleteStack",
                  data: { success: false, error },
                });
              });
            return;
          default:
            return;
        }
      },
      undefined,
      this._disposables,
    );
  }
}
