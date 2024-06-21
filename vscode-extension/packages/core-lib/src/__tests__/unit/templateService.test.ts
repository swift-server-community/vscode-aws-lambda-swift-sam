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

import { TemplateFetchError } from "../../errors/errors";
import { getTemplateTitles } from "../../services/templateServices";
import axios from "axios";
import { jest, describe, afterEach, it, expect } from "@jest/globals";

jest.mock("axios");

describe("TemplateService", () => {
  describe("getTemplateTitles", () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should fetch template titles successfully", async () => {
      const mockResponse = {
        data: {
          templates: {
            apiToLambda: {
              path: "some/path/to/api.png",
            },
            sqsToLambda: {
              path: "some/path/to/sqs.png",
            },
          },
        },
      };
      const axiosGetSpy = jest
        .spyOn(axios, "get")
        .mockResolvedValueOnce(mockResponse);

      const data = await getTemplateTitles(
        "https://example.com/templates.json",
        "main",
      );

      expect(data.list.length).toBe(2);
      expect(data.list[0].name).toBe("apiToLambda");
      expect(data.list[0].path).toBe("some/path/to/api.png");
      expect(data.list[1].name).toBe("sqsToLambda");
      expect(data.list[1].path).toBe("some/path/to/sqs.png");
      expect(axios.get).toHaveBeenCalledWith(
        "https://example.com/templates.json",
      );

      axiosGetSpy.mockRestore();
    });

    it("should throw TemplateFetchError when URL is not defined", async () => {
      await expect(getTemplateTitles("", "")).rejects.toThrow(
        TemplateFetchError,
      );
    });

    it("should throw TemplateFetchError when request fails", async () => {
      const errorMessage = "Network Error";
      const axiosGetSpy = jest
        .spyOn(axios, "get")
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        getTemplateTitles("https://example.com/templates.json", "main"),
      ).rejects.toThrow(TemplateFetchError);

      axiosGetSpy.mockRestore();
    });
  });
});
