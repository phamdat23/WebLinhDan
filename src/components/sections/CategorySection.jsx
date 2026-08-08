import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithShimmer } from '../ui/ImageWithShimmer';
import './CategorySection.css';

export const CategorySection = ({ categoriesList = [], productsList = [], isLoading = false, onSelectCategory }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Chuẩn hóa danh sách các danh mục khả dụng (Mỗi item có 3 trường: id, name, image)
  const availableCategories = useMemo(() => {
    let list = Array.isArray(categoriesList) ? categoriesList : [];

    // Nếu categoriesList rỗng nhưng productsList có sản phẩm -> Tự tạo danh mục từ sản phẩm
    if (list.length === 0 && Array.isArray(productsList) && productsList.length > 0) {
      const uniqueCatNames = new Set();
      productsList.forEach((prod) => {
        if (prod.category) uniqueCatNames.add(prod.category);
      });

      list = Array.from(uniqueCatNames).map((catName, index) => ({
        id: String(index + 1),
        name: catName,
        image: '',
      }));
    }

    // Chuẩn hóa định dạng item category gồm 3 trường: { id, name, image }
    return list.map((item, index) => {
      const catId = item.id || String(index + 1);
      const catName = typeof item === 'string' ? item : item.name || item.title || '';

      // Ưu tiên hình ảnh từ item.image, nếu rỗng thì lấy ảnh sản phẩm mẫu thuộc danh mục đó
      let catImage = typeof item === 'object' && item.image ? item.image : '';
      if (!catImage) {
        const sampleProd = productsList.find((p) => p.category === catName && p.image);
        catImage = sampleProd
          ? sampleProd.image
          : 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=500&q=80';
      }

      return {
        id: catId,
        name: catName,
        image: catImage,
      };
    });
  }, [categoriesList, productsList]);

  // Kiểm tra vị trí scroll để bật/tắt nút 2 đầu
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
  }, [availableCategories, isLoading]);

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
    <section className="category-section" id="san-pham">
      <div className="container">
        <h2 className="section-title">DANH MỤC SẢN PHẨM</h2>

        {isLoading ? (
          <div className="category-carousel-wrapper">
            <div className="category-scroll-container">
              {[1, 2, 3, 4, 5, 6].map((skKey) => (
                <div key={skKey} className="category-card category-carousel-card">
                  <div className="category-img-container skeleton-box" style={{ minHeight: '120px' }} />
                  <div className="category-info" style={{ padding: '8px 4px' }}>
                    <div className="skeleton-box" style={{ height: '18px', width: '80%', margin: '0 auto' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : availableCategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
            Chưa có danh mục sản phẩm nào trên Firebase.
          </div>
        ) : (
          <div className="category-carousel-wrapper">
            {/* Nút lùi bên trái (Left Side Button) */}
            <button
              className={`category-side-btn left ${!canScrollLeft ? 'disabled' : ''}`}
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Xem danh mục trước"
              title="Xem danh mục trước"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Khung chứa danh sách cuộn 1 dòng */}
            <div
              className="category-scroll-container"
              ref={scrollRef}
              onScroll={checkScroll}
            >
              {availableCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="category-card category-carousel-card"
                  onClick={() => {
                    if (onSelectCategory) {
                      onSelectCategory(cat.name);
                    }
                  }}
                >
                  <div className="category-img-container">
                    <ImageWithShimmer src={cat.image} alt={cat.name} className="category-img" />
                  </div>
                  <div className="category-info">
                    <h3 className="category-name">{cat.name}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Nút tiến bên phải (Right Side Button) */}
            <button
              className={`category-side-btn right ${!canScrollRight ? 'disabled' : ''}`}
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Xem danh mục tiếp theo"
              title="Xem danh mục tiếp theo"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
