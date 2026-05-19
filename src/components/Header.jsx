import React from "react";
import { Link } from "react-router-dom";
import { LOGO_HEADER} from "../assets/icons"
import HeaderTabs from "./HeaderTabs";

const Header = ({
  clientName = "Alfred Health",
  actions = null,
  homePath = "/",
  brandTitle = "Amy Jacobson",
  showLogo = true
}) => {
  const showBrandText = brandTitle !== "Amy Jacobson";
  const isClientHeader = !showLogo;
  return (
    <header className="w-full">
      <div style={{ background: "#25282A", borderBottom: "3px solid #0092E7" }}>
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: isClientHeader ? "nowrap" : "wrap",
            gap: 16,
            minHeight: 56,
          }}
        >
          <Link
            to={homePath}
            style={{
              display: "flex",
              alignItems: "center",
              height: 56,
              textDecoration: "none",
              flex: "1 1 320px",
              minWidth: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              {showLogo ? (
                <img src={LOGO_HEADER} alt={brandTitle} style={{ height: 26, width: "auto", display: "block" }} />
              ) : null}
              {showBrandText ? (
                <div
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: 800,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {brandTitle}
                </div>
              ) : null}
              <div style={{ width: 1, height: 24, background: "#ffffff25" }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>The Liminal Index</div>
                <div
                  style={{
                    color: "#ffffff60",
                    fontSize: 10,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {clientName}
                </div>
              </div>
            </div>
          </Link>
          {actions && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                justifyContent: isClientHeader ? "flex-end" : "center",
                flex: isClientHeader ? "0 0 auto" : "1 1 260px",
                marginLeft: "auto",
              }}
            >
              {actions}
            </div>
          )}
        </div>
      </div>
      <HeaderTabs />
    </header>
  );
};

export default Header;
