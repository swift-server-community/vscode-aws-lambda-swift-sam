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

import { vscode } from "../utilities/vscode";
import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  VSCodeDropdown,
  VSCodeOption,
  VSCodeButton,
} from "@vscode/webview-ui-toolkit/react";
import { ConfigurationContext } from "../context/ConfigurationProvider";
import { VscRefresh } from "react-icons/vsc";
import { useTranslation } from "react-i18next";

/**
 * Props for the EventsDropdown component.
 */
interface EventsDropdownProps {
  selectedEvent: string;
  // eslint-disable-next-line no-unused-vars
  setSelectedEvent: (event: string) => void;
}

/**
 * Represents a dropdown component for selecting events.
 * @param {Object} EventsDropdownProps - Props for the EventsDropdown component.
 * @param {string} EventsDropdownProps.selectedEvent - The currently selected event.
 * @param {Function} EventsDropdownProps.setSelectedEvent - Function to set the selected event.
 * @returns {JSX.Element} - The rendered EventsDropdown component.
 */
const EventsDropdown: React.FC<EventsDropdownProps> = ({
  selectedEvent,
  setSelectedEvent,
}) => {
  // Accessing translation function
  const { t } = useTranslation("global");
  // Accessing configuration state and setConfiguration function from ConfigurationProvider context
  const { configuration, setConfiguration } = useContext(ConfigurationContext);
  // State for loading status
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch events list
  const refreshEvents = useCallback(() => {
    setIsLoading(true);
    // Sending message to VS Code extension to fetch events
    vscode.postMessage({
      command: "events",
      data: {
        path: configuration.projectFolder + "/" + configuration.projectName,
      },
    });
    // Listening for messages from VS Code extension
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (message.command === "events" && message.data.success) {
        setConfiguration((prevConfig) => ({
          ...prevConfig,
          eventsList: message.data.events,
        }));
        // Setting the selected event to the first event in the list
        setSelectedEvent(message.data.events[0]);
        setIsLoading(false);
      } else {
        if (message.command === "events" && !message.data.success) {
          // Handling errors by resetting events list and selected event
          setConfiguration((prevConfig) => ({
            ...prevConfig,
            eventsList: [],
          }));
          setSelectedEvent("");
          setIsLoading(false);
        }
      }
    });
  }, [
    configuration.projectFolder,
    configuration.projectName,
    setConfiguration,
    setSelectedEvent,
  ]);

  // Fetches events list on mount and whenever projectName changes
  useEffect(() => {
    refreshEvents();
  }, [configuration.projectName, refreshEvents]);

  return (
    <div className="label-input">
      {/* Label for the events dropdown */}
      <label htmlFor="event">{t("localInvoke.form.event.label")}</label>
      <div className="dropdown-container">
        {/* Dropdown component to select events */}
        <VSCodeDropdown
          id="event"
          value={selectedEvent}
          onChange={(e: any) => {
            setSelectedEvent(e.target.value);
          }}
        >
          {/* Mapping through events list to render options */}
          {configuration.eventsList.map((event) => (
            <VSCodeOption key={event} value={event}>
              {event}
            </VSCodeOption>
          ))}
        </VSCodeDropdown>
        {/* Button to refresh events list */}
        <VSCodeButton
          appearance="icon"
          onClick={refreshEvents}
          disabled={isLoading}
        >
          <VscRefresh />
        </VSCodeButton>
      </div>
    </div>
  );
};

export default EventsDropdown;
