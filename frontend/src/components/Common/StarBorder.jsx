// components/Common/StarBorder.jsx
import React from "react";

const StarBorder = ({
  as: Component = "button",
  className = "",
  color = "red",
  speed = "3s",
  thickness = 1,
  children,
  ...rest
}) => {
  return (
    <Component
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-all transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      style={{
        padding: `${thickness}px 0`,
        ...rest.style,
      }}
      {...rest}
    >
      {/* Bottom glow */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      {/* Top glow */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      {/* Actual button UI */}
      <div className="relative z-1 w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 transition-colors duration-200 text-white py-[16px] px-[26px] rounded-full">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
