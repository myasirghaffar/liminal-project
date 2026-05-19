import React from "react";
import { LOGO_LIGHT } from "../assets/icons"

const Footer = ({ brandTitle = "Amy Jacobson", showLogo = true }) => {
  return (
    <footer style={{ borderTop: "1px solid #e2e8f0", padding: "14px 16px", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        {showLogo ? (
          <img src={LOGO_LIGHT} alt={brandTitle} style={{ height: 22, width: "auto" }} />
        ) : (
          <span style={{ fontSize: 12, color: "#25282A", fontWeight: 700 }}>{brandTitle}</span>
        )}
        <span style={{ fontSize: 11, color: "#64748b" }}>· The Liminal Index™ · All responses are anonymous</span>
      </div>
    </footer>
  );
};

export default Footer;
