import React from 'react';
import { useToast } from '../../context/ToastContext';

/**
 * Toast Demo Component
 * 
 * This component demonstrates all toast notification types.
 * Use it for testing or as a reference for implementation.
 * 
 * To use: Import and render in any component
 * <ToastDemo />
 */
const ToastDemo = () => {
  const toast = useToast();

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
        Toast Demo
      </h4>
      
      <button
        onClick={() => toast.success('Operation completed successfully!')}
        style={{
          padding: '8px 16px',
          backgroundColor: '#107c10',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        Success Toast
      </button>

      <button
        onClick={() => toast.error('Something went wrong. Please try again.')}
        style={{
          padding: '8px 16px',
          backgroundColor: '#d13438',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        Error Toast
      </button>

      <button
        onClick={() => toast.warning('Your storage is almost full.')}
        style={{
          padding: '8px 16px',
          backgroundColor: '#f7630c',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        Warning Toast
      </button>

      <button
        onClick={() => toast.info('This feature is coming soon!')}
        style={{
          padding: '8px 16px',
          backgroundColor: '#0078d4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        Info Toast
      </button>

      <button
        onClick={() => {
          toast.success('First toast');
          setTimeout(() => toast.info('Second toast'), 500);
          setTimeout(() => toast.warning('Third toast'), 1000);
        }}
        style={{
          padding: '8px 16px',
          backgroundColor: '#5c2d91',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        Multiple Toasts
      </button>

      <button
        onClick={() => toast.success('This toast stays until you close it', 0)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#464646',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        Persistent Toast
      </button>
    </div>
  );
};

export default ToastDemo;

