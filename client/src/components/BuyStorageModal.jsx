import React, { useEffect } from "react";
import { DismissRegular } from "@fluentui/react-icons";
import "./BuyStorage.css";

const BuyStorageModal = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-container">
        <div className="modal-header">
          <img
            src="/images/microsoft.png"
            alt="Microsoft"
            className="m365-logo"
          />
          <button className="btn-close" onClick={onClose} aria-label="Close">
            <DismissRegular />
          </button>
        </div>

        <div className="modal-body">
          <div className="img-multiple">
            <img
              src="/images/modalImage.png"
              alt="Microsoft"
              className="m365"
            />
          </div>
          <div className="header-section">
            <h2>Get more cloud storage with Microsoft 365</h2>
            <p className="subtitle">
              From Basic, Personal, or Premium, choose the subscription that
              best meets your needs.
            </p>
            <div className="billing-toggle">
              <label>
                <input type="radio" name="billing" /> Yearly{" "}
                <span className="save-tag">Save up to 17%</span>
              </label>
              <label>
                <input type="radio" name="billing" defaultChecked /> Monthly
              </label>
            </div>
          </div>

          <div className="plan-grid">
            <div className="plan-card">
              <h3>Microsoft 365 Basic</h3>
              <p className="for">1 person</p>
              <p className="price">
                ₹149.00<span>/month</span>
              </p>
              <button className="btn-primary">Buy now</button>
              <p className="note">
                Subscription continues to be charged unless cancelled in your
                Microsoft account. See Store Terms.
              </p>
              <div>Apps </div>
              <img src="" alt="" />
              <div>Benifits</div>
              <ol>
                <li>AI-powered writing assistant in Word and Outlook</li>
                <li>AI-powered image generation in PowerPoint and Designer</li>
                <li>AI-powered data analysis in Excel</li>
              </ol>
            </div>

            <div className="plan-card highlight">
              <h3>Microsoft 365 Personal</h3>
              <p className="for">1 person</p>
              <p className="price">
                ₹689.00<span>/month</span>
              </p>
              <button className="btn-primary">Buy now</button>
              <p className="note">
                Subscription continues to be charged unless cancelled in your
                Microsoft account. See Store Terms.
              </p>
              <div>Apps</div>
              <img src="" alt="" />
              <div>Benifits</div>
              <ol>
                <li>AI-powered writing assistant in Word and Outlook</li>
                <li>AI-powered image generation in PowerPoint and Designer</li>
                <li>AI-powered data analysis in Excel</li>
              </ol>
            </div>

            <div className="plan-card">
              <h3>Microsoft 365 Premium</h3>
              <p className="for">For AI power users</p>
              <p className="price">
                ₹1,999.00<span>/month</span>
              </p>
              <button className="btn-primary">Buy now</button>
              <p className="note">
                Subscription continues to be charged unless cancelled in your
                Microsoft account. See Store Terms.
              </p>
              <div>Apps</div>
              <img src="" alt="" />
              <div>Benifits</div>
              <ol>
                <li>AI-powered writing assistant in Word and Outlook</li>
                <li>AI-powered image generation in PowerPoint and Designer</li>
                <li>AI-powered data analysis in Excel</li>
              </ol>
            </div>
          </div>

          <div>
            Explre Microsoft 365 for Business plans for up to 300 users,
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default BuyStorageModal;
