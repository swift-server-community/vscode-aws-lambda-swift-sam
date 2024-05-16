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
import { spawn, StdioOptions } from "child_process";
import { EventEmitter } from "events";
import { InvalidCommandError } from "../errors/errors";
import { CommandResult } from "./types";

/**
 * Options for running a command
 * @interface
 * @member args - The arguments to pass to the command
 * @member command - The command to run
 * @member cwd - The current working directory to run the command in
 * @member stdioOptions - The stdio options for the command
 * @example
 * const options = {
 *  args: ["local", "invoke", "MyFunction", "--event", "event.json"],
 * command: "sam",
 * cwd: "/Users/my-user/Documents/my-project",
 * stdioOptions: ["pipe", "pipe", "pipe"],
 * };
 */
export interface RunCommandOptions {
  args: string[];
  command?: string;
  cwd?: string;
  stdioOptions?: StdioOptions;
  withOutput?: boolean;
}

/**
 * Represents a command runner utility.
 * @class
 */
export class CommandRunner {
  private static instance: CommandRunner;
  private eventEmitter = new EventEmitter();

  private constructor() {}

  /**
   * Returns the singleton instance of the CommandRunner class.
   * @returns The singleton instance of CommandRunner.
   */
  public static getInstance(): CommandRunner {
    if (!CommandRunner.instance) {
      CommandRunner.instance = new CommandRunner();
    }
    return CommandRunner.instance;
  }

  /**
   * Runs a command
   * @param options - The options for running the command
   * @async
   * @example
   * await runCommand({
   *  args: ["local", "invoke", "MyFunction", "--event", "event.json"],
   *  command: "sam",
   *  cwd: "/Users/my-user/Documents/my-project",
   * });
   * @throws {InvalidCommandError} If the command cannot be run
   * @returns {Promise<CommandResult>}
   */
  public async runCommand({
    args,
    command = "sam",
    cwd = process.cwd(),
    stdioOptions = ["pipe", "pipe", "pipe"],
    withOutput = true,
  }: RunCommandOptions): Promise<CommandResult> {
    return new Promise<{
      exitCode: number;
      output: { stdout: string; stderr: string };
    }>((resolve, reject) => {
      const childProcess = spawn(command, args, { stdio: stdioOptions, cwd });
      const output: { stdout: string; stderr: string } = {
        stdout: "",
        stderr: "",
      };

      if (childProcess.stdout) {
        childProcess.stdout.on("data", (data) => {
          const stdoutData = data.toString();
          output.stdout += stdoutData;
          if (withOutput) this.eventEmitter.emit("stdout", stdoutData);
        });
      }

      if (childProcess.stderr) {
        childProcess.stderr.on("data", (data) => {
          const stderrData = data.toString();
          output.stderr += stderrData;
          if (withOutput) this.eventEmitter.emit("stderr", stderrData);
        });
      }

      childProcess.on("error", (err) => {
        reject(
          new InvalidCommandError(
            `Error running command '${command} ${args[0]}'`,
            err,
          ),
        );
      });

      childProcess.on("exit", (code) => {
        resolve({ exitCode: code ?? 1, output });
      });
    });
  }

  /**
   * Subscribes to events emitted by the command runner.
   * @param event - The event to subscribe to (`stdout` or `stderr`).
   * @param listener - The listener function to be called when the event is emitted.
   */
  public subscribe(
    event: "stdout" | "stderr",
    listener: (data: string) => void,
  ) {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Unsubscribes from events emitted by the command runner.
   * @param event - The event to unsubscribe from (`stdout` or `stderr`).
   * @param listener - The listener function to be removed.
   */
  public unsubscribe(
    event: "stdout" | "stderr",
    listener: (data: string) => void,
  ) {
    this.eventEmitter.off(event, listener);
  }
}
