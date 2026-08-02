import React from 'react';
import { MainLayout } from '../layouts/MainLayout';

export const HomePage = () => {
  return (
    <MainLayout>
      <section style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#38bdf8' }}>
          Chào mừng tới Dự án Web Chuẩn
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Cấu trúc thư mục được thiết kế theo nguyên tắc Feature-First Architecture, giúp dự án dễ đọc, dễ mở rộng và dễ bảo trì.
        </p>
      </section>
    </MainLayout>
  );
};
