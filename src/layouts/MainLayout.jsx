import React from 'react';
import { Header } from '../components/layout/Header';

export const MainLayout = ({
  children,
  onNavigateHome,
  onNavigateProducts,
  onNavigateAdmin,
  activePage,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        onNavigateHome={onNavigateHome}
        onNavigateProducts={onNavigateProducts}
        onNavigateAdmin={onNavigateAdmin}
        activePage={activePage}
      />
      <main style={{ flex: 1, width: '100%' }}>
        {children}
      </main>
    </div>
  );
};
