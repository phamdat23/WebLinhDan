import React, { useState, useEffect } from 'react';
import { Award, Users, PackageCheck, Smile, ChevronLeft, ChevronRight } from 'lucide-react';
import './AboutUsSection.css';

import aboutImg1 from '../../assets/images/img_about_1.jpg';
import aboutImg2 from '../../assets/images/img_about_2.jpg';
import aboutImg3 from '../../assets/images/img_about_3.jpg';
import aboutImg4 from '../../assets/images/img_about_4.jpg';
import aboutImg5 from '../../assets/images/img_about_5.jpg';
import aboutImg6 from '../../assets/images/img_about_6.jpg';
import aboutImg7 from '../../assets/images/img_about_7.JPG';

const ABOUT_IMAGES = [
  aboutImg1,
  aboutImg2,
  aboutImg3,
  aboutImg4,
  aboutImg5,
  aboutImg6,
  aboutImg7,
];

export const AboutUsSection = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % ABOUT_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + ABOUT_IMAGES.length) % ABOUT_IMAGES.length);
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % ABOUT_IMAGES.length);
  };

  const stats = [
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
            {/* Left Image Slider */}
            <div className="about-img-box">
              {ABOUT_IMAGES.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`Về Hải Sản Làng Chài Nga Doãn #${index + 1}`}
                  className={`about-img ${index === currentSlideIndex ? 'active' : ''}`}
                />
              ))}

              <button
                className="about-slider-btn prev"
                onClick={handlePrevSlide}
                aria-label="Ảnh trước"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="about-slider-btn next"
                onClick={handleNextSlide}
                aria-label="Ảnh sau"
              >
                <ChevronRight size={20} />
              </button>

              <div className="about-slider-dots">
                {ABOUT_IMAGES.map((_, idx) => (
                  <button
                    key={idx}
                    className={`about-slider-dot ${idx === currentSlideIndex ? 'active' : ''}`}
                    onClick={() => setCurrentSlideIndex(idx)}
                    aria-label={`Chuyển tới ảnh ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Content */}
            <div className="about-content">
              <h2 className="about-title">VỀ HẢI SẢN LÀNG CHÀI NGA DOÃN</h2>
              <p className="about-description">
                Từ nỗi nhớ biển của một người con Sầm Sơn lên Tây Bắc lập nghiệp, Hải sản Làng Chài Nga Doãn ra đời với mong muốn mang hương vị quê nhà đến gần hơn với người dân nơi đây.Cửa hàng luôn sẵn hải sản tươi sống đa dạng, được đưa về mới mỗi ngày, phong phú theo mùa từ tôm, cua, ghẹ, cá, mực đến ốc, ngao… Bên cạnh đó là hải sản khô, nước mắm, mắm chua và nhiều loại mắm đặc sản; để giữa núi rừng Tây Bắc, khách hàng vẫn có thể dễ dàng tìm thấy đầy đủ và trọn vẹn hương vị biển Sầm Sơn
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
