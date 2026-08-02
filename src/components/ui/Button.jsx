import React from 'react';

/**
 * Base Reusable Button Component
 */
export const Button = ({ children, variant = 'primary', size = 'medium', className = '', ...props }) => {
  return (
    <button 
      className={`btn btn-${variant} btn-${size} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
