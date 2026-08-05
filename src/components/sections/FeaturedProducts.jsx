import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './FeaturedProducts.css';

export const FeaturedProducts = ({ productsList = [], onViewAll }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Lọc chỉ những sản phẩm CHƯA BỊ ẨN VÀ thực sự có nhãn "Nổi bật"
  const featuredProducts = useMemo(() => {
    if (!Array.isArray(productsList) || productsList.length === 0) return [];

    return productsList.filter(
      (p) => p.status !== 'Ẩn' && Array.isArray(p.tags) && p.tags.includes('Nổi bật')
    );
  }, [productsList]);

  // Kiểm tra vị trí scroll để bật/tắt nút mũi tên ở 2 đầu
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [featuredProducts]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="featured-products-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title main-title">SẢN PHẨM NỔI BẬT</h2>
          <a
            href="#san-pham"
            className="view-all-link"
            onClick={(e) => {
              e.preventDefault();
              if (onViewAll) onViewAll();
            }}
          >
            Xem tất cả
          </a>
        </div>

        {featuredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#666', fontSize: '0.95rem' }}>
            Chưa có sản phẩm nào có nhãn "Nổi bật" trên Firebase.
          </div>
        ) : (
          <div className="featured-carousel-wrapper">
            {/* Nút lùi bên trái (Left Side Button) */}
            <button
              className={`carousel-side-btn left ${!canScrollLeft ? 'disabled' : ''}`}
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Xem sản phẩm trước"
              title="Xem sản phẩm trước"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Khung chứa danh sách cuộn 1 dòng */}
            <div
              className="featured-scroll-container"
              ref={scrollRef}
              onScroll={checkScroll}
            >
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card featured-carousel-card"
                  onClick={() => {
                    if (onViewAll) onViewAll();
                  }}
                >
                  <div className="product-img-wrapper">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-img"
                    />

                    {/* Render ALL Tags dynamically */}
                    {Array.isArray(product.tags) && product.tags.length > 0 && (
                      <div className="product-badges-container">
                        {product.tags.map((tag) => {
                          let badgeClass = 'badge-default';
                          if (tag === 'Mới về') badgeClass = 'badge-new';
                          else if (tag === 'Bán chạy') badgeClass = 'badge-hot';
                          else if (tag === 'Nổi bật') badgeClass = 'badge-featured';

                          return (
                            <span key={tag} className={`badge ${badgeClass}`}>
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="product-details">
                    <h3 className="product-name">{product.name}</h3>
                    <span className="product-weight">{product.weight}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Nút tiến bên phải (Right Side Button) */}
            <button
              className={`carousel-side-btn right ${!canScrollRight ? 'disabled' : ''}`}
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Xem sản phẩm tiếp theo"
              title="Xem sản phẩm tiếp theo"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
