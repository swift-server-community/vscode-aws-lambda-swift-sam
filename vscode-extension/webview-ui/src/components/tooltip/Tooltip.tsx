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

import React, { useState } from "react";
import { VscQuestion } from "react-icons/vsc";
import "./Tooltip.css";

/**
 * Props for the Tooltip component.
 */
interface TooltipProps {
  text: string;
}

/**
 * Represents a tooltip component.
 * @param {object} props - The component props.
 * @param {string} props.text - The text to display in the tooltip.
 * @returns {JSX.Element} - The rendered Tooltip component.
 */
const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  // State to control the visibility of the tooltip
  const [showTooltip, setShowTooltip] = useState(false);

  // Function to handle mouse enter event
  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  // Function to handle mouse leave event
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div
      className="tooltip-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Icon triggering the tooltip */}
      <div className="tooltip-icon">
        <VscQuestion size={20} />
      </div>

      {/* Tooltip text displayed conditionally based on showTooltip state */}
      {showTooltip && <div className="tooltip-text">{text}</div>}
    </div>
  );
};

export default Tooltip;
