import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, ShieldCheck, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import './HeroSection.css';

import banner1 from '../../assets/images/img_banner_1.jpg';
import banner2 from '../../assets/images/img_banner_2.jpg';
import banner3 from '../../assets/images/img_banner_3.jpg';
import banner4 from '../../assets/images/img_banner_4.jpg';
import banner5 from '../../assets/images/img_banner_5.jpg';
import banner6 from '../../assets/images/img_banner_6.jpg';
import banner7 from '../../assets/images/img_banner_7.jpg';
import banner8 from '../../assets/images/img_banner_8.jpg';

const DEFAULT_BANNER_SLIDES = [
  { id: 1, image: banner1, title: '' },
  { id: 2, image: banner2, title: '' },
  { id: 3, image: banner3, title: '' },
  { id: 4, image: banner4, title: '' },
  { id: 5, image: banner5, title: '' },
  { id: 6, image: banner6, title: '' },
  { id: 7, image: banner7, title: '' },
  { id: 8, image: banner8, title: '' },
];

export const HeroSection = ({ onExploreProducts, bannerImages = [] }) => {
  const slides = React.useMemo(() => {
    if (Array.isArray(bannerImages) && bannerImages.length > 0) {
      return bannerImages.map((item, idx) => {
        if (typeof item === 'string') {
          return { id: idx + 1, image: item, title: `Hải sản làng chài #${idx + 1}` };
        }
        return {
          id: item.id || idx + 1,
          image: item.image || item.url || '',
          title: item.title || item.name || `Hải sản làng chài #${idx + 1}`,
        };
      });
    }
    return DEFAULT_BANNER_SLIDES;
  }, [bannerImages]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Tự động chuyển slide sau mỗi 4 giây
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides]);

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  return (
    <section className="hero-section" id="trang-chu">
      <div className="container">
        <div className="hero-grid">
          {/* Left Text Content */}
          <div className="hero-content">
            <h1 className="hero-title">
               <span className="hero-title-highlight">Hải sản Làng Chài Nga Doãn </span>- Mang Vị Biển Sầm Sơn Về Bữa Cơm Nhà
            </h1>
            <p className="hero-description">
              Tươi mới mỗi ngày từ biển Sầm Sơn. Đa dạng tôm, cua, ghẹ, cá, mực, ốc, ngao…luôn phong phú theo mùa được chọn kỹ từ độ tươi đến chất lượng. Ngoài ra còn có nước mắm, mắm chua và các loại mắm đặc sản cho bữa cơm thêm đậm vị biển.
            </p>
            <div className="hero-cta-group">
              <a
                href="#san-pham"
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  if (onExploreProducts) {
                    onExploreProducts();
                  } else {
                    window.location.hash = '#san-pham';
                  }
                }}
              >
                <ShoppingBag size={20} />
                Khám phá sản phẩm
              </a>
              <a
                href="#ve-chung-toi"
                className="btn btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('ve-chung-toi');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Tìm hiểu thêm
                <ArrowRight size={18} />
              </a>
            </div>
          </div>

          {/* Right Image Banner Slider */}
          <div className="hero-image-wrapper">
            <div className="hero-image-card">
              {/* Slider Track */}
              <div
                className="hero-slider-track"
                style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
              >
                {slides.map((slide) => (
                  <div key={slide.id} className="hero-slide-item">
                    <img src={slide.image} alt={slide.title} className="hero-main-img" />
                    {slide.title && <div className="hero-slide-caption">{slide.title}</div>}
                  </div>
                ))}
              </div>

              {/* Slider Controls */}
              {slides.length > 1 && (
                <>
                  <button
                    className="slider-arrow prev"
                    onClick={handlePrevSlide}
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    className="slider-arrow next"
                    onClick={handleNextSlide}
                    aria-label="Ảnh sau"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="slider-dots">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        className={`dot ${currentSlideIndex === index ? 'active' : ''}`}
                        onClick={() => setCurrentSlideIndex(index)}
                        aria-label={`Slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Feature Highlights Bar (Chỉ còn 2 điểm nổi bật: Chất lượng đảm bảo & Nguồn gốc rõ ràng) */}
        <div className="hero-features-bar">
          <div className="feature-item">
            <div className="feature-icon-box">
              <ShieldCheck className="feature-icon" size={24} />
            </div>
            <div className="feature-text">
              <h4 className="feature-title">Chất lượng đảm bảo</h4>
              <p className="feature-subtitle">Sản phẩm tuyển chọn kỹ lượng</p>
                 <p className="feature-subtitle">Đảm bảo vệ sinh ATTP</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-box">
              <MapPin className="feature-icon" size={24} />
            </div>
            <div className="feature-text">
              <h4 className="feature-title">Nguồn gốc rõ ràng</h4>
              <p className="feature-subtitle">100% có xuất xứ minh bạch</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
