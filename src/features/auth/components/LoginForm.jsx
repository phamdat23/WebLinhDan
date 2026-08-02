import React from 'react';

export const LoginForm = () => {
  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '360px', margin: '0 auto', background: '#1e293b', padding: '2rem', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', color: '#38bdf8' }}>Đăng nhập</h2>
      <input type="email" placeholder="Email" style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
      <input type="password" placeholder="Mật khẩu" style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} />
      <button type="submit" style={{ padding: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Đăng nhập</button>
    </form>
  );
};
