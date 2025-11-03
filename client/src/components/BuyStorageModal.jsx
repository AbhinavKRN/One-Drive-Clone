import React, { useEffect, useState } from "react";
import { DismissRegular } from "@fluentui/react-icons";
import "./BuyStorage.css";

const BuyStorageModal = ({ onClose }) => {
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const plans = [
    {
      tier: "Basic",
      forBadge: "1 person",
      price: "₹149.00",
      apps: ["onedrive", "outlook"],
      benefits: [
        "For one person",
        "Sign into five devices at once",
        "Use on PCs, Macs, phones, and tablets",
        "100 GB of secure cloud storage",
        "Secure ad-free Outlook web and mobile email and calendars",
      ],
    },
    {
      tier: "Personal",
      forBadge: "1 person",
      price: "₹689.00",
      apps: ["word", "excel", "powerpoint", "outlook", "onenote", "onedrive"],
      benefits: [
        "For one person",
        "Sign into five devices at once",
        "Use on PCs, Macs, phones, and tablets",
        "1 TB (1000 GB) of secure cloud storage",
        "Productivity apps with Microsoft Copilot¹",
        "Higher usage limits than free for select Copilot features¹",
        "Image and video editing tools",
        "Data and device security",
      ],
      highlight: true,
    },
    {
      tier: "Premium",
      forBadge: "For AI power users",
      price: "₹1,999.00",
      apps: ["word", "excel", "powerpoint", "outlook", "onenote", "onedrive"],
      benefits: [
        "For one to six people",
        "Sign into five devices at once",
        "Use on PCs, Macs, phones, and tablets",
        "Up to 6 TB of secure cloud storage (1 TB per person)",
        "Productivity apps with Microsoft Copilot¹",
        "Highest usage limits for select Copilot features¹",
        "Access to Copilot features currently exclusive to Premium¹",
        "Image and video editing tools",
        "Data and device security",
      ],
    },
  ];

  const features = [
    {
      title: "All-in-one online security",
      description:
        "Microsoft Defender scans for threats and alerts you with steps to keep your devices secure.",
      image: "/images/image copy 7.png",
    },
    {
      title: "In-app collaboration",
      description:
        "Share and co-edit with anyone, even if they don't have a Microsoft account.",
      image: "/images/image copy 6.png",
    },
    {
      title: "AI-powered Designer¹",
      description:
        "Make eye-catching images using only your words, craft next-level designs that pop, and even edit photos like an expert.",
      image: "/images/image copy 3.png",
    },
    {
      title: "Clipchamp video editor",
      description:
        "Create and edit beautiful videos online using Clipchamp's robust tools, intuitive storyboard, and an extensive stock library.",
      image: "/images/image copy 4.png",
    },
    {
      title: "Ransomware protection",
      description:
        "Securely save your photos and files in OneDrive with built-in ransomware detection and file recovery.",
      image: "/images/image copy 5.png",
    },
  ];

  const getAppIcon = (appName) => {
    const icons = {
      word: "https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/docx.svg",
      excel:
        "https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/xlsx.svg",
      powerpoint:
        "https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/pptx.svg",
      onenote:
        "https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/onetoc.svg",
      onedrive:
        "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/onedrive_24x1_3dca28ce.svg",
      outlook:
        "https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/outlook_24x1_16f15926.svg",
    };
    return icons[appName] || "";
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-container">
        <div className="modal-header">
          <div className="microsoft-logo-container">
            <div className="microsoft-logo-grid">
              <div className="microsoft-square microsoft-red"></div>
              <div className="microsoft-square microsoft-green"></div>
              <div className="microsoft-square microsoft-blue"></div>
              <div className="microsoft-square microsoft-yellow"></div>
            </div>
            <span className="microsoft-text">Microsoft</span>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            <DismissRegular />
          </button>
        </div>

        <div className="modal-body">
          {/* App Icons Row */}
          <div className="app-icons-row">
            <img
              src="https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/onenote_24x1_917c6a51.svg"
              alt="OneNote"
              className="app-icon"
            />
            <img
              src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/docx.svg"
              alt="Word"
              className="app-icon"
            />
            <img
              src="https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/onedrive_24x1_3dca28ce.svg"
              alt="OneDrive"
              className="app-icon app-icon-large"
            />
            <img
              src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/xlsx.svg"
              alt="Excel"
              className="app-icon"
            />
            <img
              src="https://res-1.cdn.office.net/files/fabric-cdn-prod_20230815.002/assets/item-types/16/pptx.svg"
              alt="PowerPoint"
              className="app-icon"
            />
            <img
              src="https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/outlook_24x1_16f15926.svg"
              alt="Outlook"
              className="app-icon"
            />
            <img
              src="https://res-1.public.onecdn.static.microsoft/files/odsp-web-prod_2025-10-17.010/odbspartan/images/teams_24x1_737122d8.svg"
              alt="Teams"
              className="app-icon"
            />
          </div>

          {/* Header Section */}
          <div className="header-section">
            <h1>Get more cloud storage with Microsoft 365</h1>
            <p className="subtitle">
              From Basic, Personal, or Premium, choose the subscription that
              best meets your needs.
            </p>

            <div className="billing-toggle">
              <label
                className={`billing-option ${
                  billingPeriod === "yearly" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="billing"
                  value="yearly"
                  checked={billingPeriod === "yearly"}
                  onChange={() => setBillingPeriod("yearly")}
                />
                <span>Yearly</span>
                <span className="save-badge">Save up to 17%</span>
              </label>
              <label
                className={`billing-option ${
                  billingPeriod === "monthly" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="billing"
                  value="monthly"
                  checked={billingPeriod === "monthly"}
                  onChange={() => setBillingPeriod("monthly")}
                />
                <span>Monthly</span>
              </label>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="plan-grid">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`plan-card ${plan.highlight ? "highlight" : ""}`}
              >
                <div className="plan-header-section">
                  <div className="plan-title-group">
                    <span className="plan-label">Microsoft 365</span>
                    <h3 className="plan-tier">{plan.tier}</h3>
                  </div>
                  <span className="for-badge">{plan.forBadge}</span>
                </div>

                <div className="plan-price-section">
                  <span className="price">{plan.price}</span>
                  <span className="price-period">/month</span>
                </div>

                <button className="btn-buy-now">Buy now</button>

                <p className="disclaimer">
                  Subscription continues to be charged at {plan.price}/month,
                  unless cancelled in Microsoft account.{" "}
                  <a href="#" className="link-terms">
                    See Store Terms.
                  </a>
                </p>

                <div className="plan-section">
                  <div className="section-title">Apps</div>
                  <div className="apps-icons-container">
                    {plan.apps.map((app, appIndex) => (
                      <img
                        key={appIndex}
                        src={getAppIcon(app)}
                        alt={app}
                        className="plan-app-icon"
                      />
                    ))}
                  </div>
                </div>

                <div className="plan-section">
                  <div className="section-title">Benefits</div>
                  <ul className="benefits-list">
                    {plan.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex}>
                        <span className="checkmark">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="features-section">
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="feature-image"
                  />
                  <h4 className="feature-title">{feature.title}</h4>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="modal-footer-disclaimer">
            <p>
              App availability varies by device/language. Features vary by
              platform. Minimum age limits may apply to use of AI features.{" "}
              <a href="#" className="link-blue">
                Details
              </a>
            </p>
            <p>
              ¹AI features only available to subscription owner and cannot be
              shared; usage limits apply.{" "}
              <a href="#" className="link-blue">
                Learn more.
              </a>
            </p>
          </div>

          {/* Footer Link */}
          <div className="footer-link">
            Explore Microsoft 365 for Business plans for up to 300 users
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyStorageModal;
