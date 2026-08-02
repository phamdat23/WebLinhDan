import React from 'react';

export const Footer = () => {
  return (
    <footer style={{ padding: '1.5rem 2rem', background: '#0f172a', borderTop: '1px solid #334155', textAlign: 'center', marginTop: 'auto', color: '#94a3b8' }}>
      <p>&copy; {new Date().getFullYear()} MyWebProduct. All rights reserved.</p>
    </footer>
  );
};
