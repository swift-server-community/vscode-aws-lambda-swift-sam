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

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ConfigurationProvider } from "./context/ConfigurationProvider";
import i18next from "i18next";
import global_en from "./i18n/en/global.json";
import { I18nextProvider } from "react-i18next";
import { ErrorProvider } from "./context/ErrorProvider";
import { createRoot } from 'react-dom/client';


/**
 * Initialize i18next and set up localization resources.
 */
i18next.init({
  interpolation: { escapeValue: true },
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: {
      global: global_en,
    },
  },
});

/**
 * The root component of the application.
 * @returns {JSX.Element} The rendered root component.
 */
// Find your root element
const container = document.getElementById('root');

// Create a root
if (container) {
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <ErrorProvider>
        <I18nextProvider i18n={i18next}>
          <ConfigurationProvider>
            <App />
          </ConfigurationProvider>
        </I18nextProvider>
      </ErrorProvider>
    </React.StrictMode>
  );
}
