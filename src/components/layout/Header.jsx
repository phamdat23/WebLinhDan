import React from 'react';

export const Header = () => {
  return (
    <header style={{ padding: '1rem 2rem', background: '#1e293b', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#38bdf8' }}>MyWebProduct</div>
      <nav style={{ display: 'flex', gap: '1.5rem' }}>
        <a href="/" style={{ color: '#f8fafc', textDecoration: 'none' }}>Trang chủ</a>
        <a href="/products" style={{ color: '#f8fafc', textDecoration: 'none' }}>Sản phẩm</a>
        <a href="/cart" style={{ color: '#f8fafc', textDecoration: 'none' }}>Giỏ hàng</a>
      </nav>
    </header>
  );
};
