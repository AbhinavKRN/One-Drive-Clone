import React from 'react';
import { useToast } from '../../context/ToastContext';
import Toast from './Toast';
import './Toast.css';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;

