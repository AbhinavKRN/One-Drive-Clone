import React, { useEffect, useState } from 'react';
import {
  CheckmarkCircleRegular,
  DismissCircleRegular,
  WarningRegular,
  InfoRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import './Toast.css';

const Toast = ({ id, message, type, duration, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
      }, 10);

      return () => clearInterval(interval);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckmarkCircleRegular className="toast-icon toast-icon-success" />;
      case 'error':
        return <DismissCircleRegular className="toast-icon toast-icon-error" />;
      case 'warning':
        return <WarningRegular className="toast-icon toast-icon-warning" />;
      case 'info':
      default:
        return <InfoRegular className="toast-icon toast-icon-info" />;
    }
  };

  return (
    <div className={`toast toast-${type} ${isExiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={handleClose} aria-label="Close">
          <DismissRegular />
        </button>
      </div>
      {duration > 0 && (
        <div className="toast-progress-bar">
          <div
            className="toast-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default Toast;

