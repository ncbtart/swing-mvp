import React, { useState } from "react";

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

const Tooltip = ({ children, text }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative flex items-center justify-center">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="tooltip-text absolute -bottom-10 w-auto rounded bg-gray-700 p-2 text-xs text-white">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
