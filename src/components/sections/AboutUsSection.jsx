import React from 'react';
import { Award, Users, PackageCheck, Smile } from 'lucide-react';
import './AboutUsSection.css';

export const AboutUsSection = () => {
  const stats = [
    {
      id: 1,
      value: '5+',
      label: 'Năm kinh nghiệm',
      icon: <Award size={22} />,
    },
    {
      id: 2,
      value: '1000+',
      label: 'Khách hàng tin tưởng',
      icon: <Users size={22} />,
    },
    {
      id: 3,
      value: '50+',
      label: 'Sản phẩm đa dạng',
      icon: <PackageCheck size={22} />,
    },
    {
      id: 4,
      value: '100%',
      label: 'Hài lòng khách hàng',
      icon: <Smile size={22} />,
    },
  ];

  return (
    <section className="about-us-section" id="ve-chung-toi">
      <div className="container">
        <div className="about-card">
          <div className="about-grid">
            {/* Left Image */}
            <div className="about-img-box">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
                alt="Cánh đồng nông sản xanh"
                className="about-img"
              />
            </div>

            {/* Right Content */}
            <div className="about-content">
              <h2 className="about-title">VỀ CHÚNG TÔI</h2>
              <p className="about-description">
                Nông Sản Xanh là đơn vị chuyên cung cấp các mặt hàng nông sản và đồ khô chất lượng cao, được tuyển chọn từ những vùng nguyên liệu uy tín trên khắp cả nước. Chúng tôi cam kết mang đến sản phẩm sạch, an toàn và giá trị tốt nhất cho khách hàng.
              </p>

              {/* Stats Grid */}
              <div className="about-stats-grid">
                {stats.map((stat) => (
                  <div key={stat.id} className="stat-item">
                    <div className="stat-icon-wrapper">{stat.icon}</div>
                    <div className="stat-info">
                      <span className="stat-value">{stat.value}</span>
                      <span className="stat-label">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
