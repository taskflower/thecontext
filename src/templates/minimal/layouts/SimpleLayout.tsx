// src/templates/minimal/layouts/SimpleLayout.tsx
import React from "react";
import { LayoutProps } from "../../baseTemplate";

const SimpleLayout: React.FC<LayoutProps> = ({ children }) => (
  <div style={{ padding: 20, border: "1px solid #ddd" }}>{children}</div>
);

export default SimpleLayout;
