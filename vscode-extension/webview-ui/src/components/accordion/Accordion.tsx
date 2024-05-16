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

import React, { useEffect, useState, JSX } from "react";
import { VscCircleLarge, VscCheckAll, VscChevronRight } from "react-icons/vsc";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import "./Accordion.css";

/**
 * Interface representing a step in the accordion.
 */
interface Step {
  id: number;
  title: string;
  done: boolean;
  isLoading: boolean;
  toggled?: boolean;
  renderContent: () => JSX.Element;
}

/**
 * Props for the Accordion component.
 */
interface AccordionProps {
  items: Step[];
}

/**
 * Accordion component for displaying a list of steps.
 * @param items The array of steps to display in the accordion.
 * @returns The rendered Accordion component.
 */
const Accordion: React.FC<AccordionProps> = ({ items }) => {
  // State to manage accordion items
  const [accordionItems, setAccordionItems] = useState<Step[]>(items);

  // Effect to update accordion items when the provided items change
  useEffect(() => {
    if (items.some((item) => item.isLoading)) setAccordionItems(items);
    else
      setAccordionItems([
        ...items.map((item) => ({
          ...item,
          toggled: false,
        })),
      ]);
  }, [items]);

  /**
   * Handles toggling of accordion items.
   * @param step The step to toggle.
   */
  function handleAccordionToggle(step: Step) {
    setAccordionItems(
      accordionItems.map((item) => {
        if (item.id === step.id) {
          return {
            ...item,
            toggled: !item.toggled,
          };
        }
        return { ...item, toggled: false };
      }),
    );
  }

  return (
    <div className="accordion-parent">
      {/* Render each accordion item */}
      {accordionItems?.map((step, key) => {
        return (
          <div
            className={`accordion ${step.toggled ? "toggled" : ""}`}
            key={key}
          >
            <div className="toggle" onClick={() => handleAccordionToggle(step)}>
              <div className="direction-indicator">
                <VscChevronRight size={20} />
              </div>
              <div className="step-title">
                <p>{step.title}</p>
              </div>
              {/* Render loading, done, or undone indicator */}
              {step.isLoading ? (
                <VSCodeProgressRing />
              ) : step.done ? (
                <div className="step-indicator green">
                  <VscCheckAll size={20} />
                </div>
              ) : (
                <div className="step-indicator">
                  <VscCircleLarge size={20} />
                </div>
              )}
            </div>
            {/* Render step content */}
            <div className="content-parent">
              <div className="content">{step.renderContent()}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
