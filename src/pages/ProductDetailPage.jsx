import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { ImageWithShimmer } from '../components/ui/ImageWithShimmer';
import { CONTACT_INFO, getZaloUrl } from '../utils/contactInfo';
import {
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  MessageCircle,
  ArrowLeft,
  Tag,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
} from 'lucide-react';
import './ProductDetailPage.css';

export const ProductDetailPage = ({
  productId,
  productsList = [],
  onNavigateHome,
  onNavigateProducts,
  onNavigateAdmin,
  onRequestAdminLogin,
  onSelectProduct,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Find target product by ID
  const product = useMemo(() => {
    if (!productId || !Array.isArray(productsList)) return null;
    return productsList.find((p) => String(p?.id) === String(productId));
  }, [productId, productsList]);

  // Reset active image index whenever target product changes
  useEffect(() => {
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  // Extract images array safely with fallback
  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.filter(Boolean);
    }
    if (product.image) {
      return [product.image];
    }
    return ['https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80'];
  }, [product]);

  // Related products (same category, excluding current product)
  const relatedProducts = useMemo(() => {
    if (!product || !Array.isArray(productsList)) return [];
    return productsList
      .filter((p) => p && p.id !== product.id && p.status !== 'Ẩn' && p.category === product.category)
      .slice(0, 4);
  }, [product, productsList]);

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const isOutOfStock = product?.status === 'Hết hàng';
  const zaloLink = CONTACT_INFO.zaloUrl || getZaloUrl(CONTACT_INFO.phone);

  return (
    <MainLayout
      onNavigateHome={onNavigateHome}
      onNavigateProducts={onNavigateProducts}
      onNavigateAdmin={onNavigateAdmin}
      onRequestAdminLogin={onRequestAdminLogin}
      activePage="products"
    >
      <div className="product-detail-page">
        <div className="container">
          {!product ? (
            /* Empty / Not Found State */
            <div className="product-not-found-card">
              <h3>Không tìm thấy thông tin sản phẩm</h3>
              <p>Sản phẩm này có thể đã bị xóa hoặc không còn tồn tại trong hệ thống.</p>
              <button className="back-btn-lg" onClick={() => onNavigateProducts && onNavigateProducts()}>
                <ArrowLeft size={18} /> Quay lại danh sách sản phẩm
              </button>
            </div>
          ) : (
            <>
              {/* Product Main Detail Card */}
              <div className="product-detail-card">
                <div className="product-detail-grid">
                  {/* Left Column: Image Slider / Gallery */}
                  <div className="detail-gallery-col">
                    <div className="main-image-slider-wrapper">
                      <ImageWithShimmer
                        src={images[activeImageIndex] || images[0]}
                        alt={product.name}
                        className="main-slider-img"
                      />

                      {/* Out of stock banner */}
                      {isOutOfStock && (
                        <div className="out-of-stock-overlay-lg">
                          <span>HẾT HÀNG</span>
                        </div>
                      )}

                      {/* Slider Prev / Next Navigation Arrows */}
                      {images.length > 1 && (
                        <>
                          <button
                            className="slider-nav-btn prev"
                            onClick={handlePrevImage}
                            aria-label="Ảnh trước"
                          >
                            <ChevronLeft size={22} />
                          </button>
                          <button
                            className="slider-nav-btn next"
                            onClick={handleNextImage}
                            aria-label="Ảnh sau"
                          >
                            <ChevronRight size={22} />
                          </button>
                          <div className="slider-counter-pill">
                            {activeImageIndex + 1} / {images.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Selector Bar */}
                    {images.length > 1 && (
                      <div className="gallery-thumbnails-row">
                        {images.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className={`gallery-thumb-item ${idx === activeImageIndex ? 'active' : ''}`}
                            onClick={() => setActiveImageIndex(idx)}
                          >
                            <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="thumb-img" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Product Meta Info & Actions */}
                  <div className="detail-info-col">
                    <div className="detail-category-badge">
                      <Layers size={14} />
                      <span>{product.category}</span>
                    </div>

                    <h1 className="detail-product-title">{product.name}</h1>

                    {/* Tags List */}
                    {Array.isArray(product.tags) && product.tags.length > 0 && (
                      <div className="detail-tags-list">
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

                    {/* Meta specs row */}
                    <div className="detail-meta-box">
                      <div className="meta-item">
                        <Package size={16} className="meta-icon" />
                        <span className="meta-label">Quy cách:</span>
                        <strong className="meta-val">{product.weight}</strong>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Trạng thái:</span>
                        {isOutOfStock ? (
                          <span className="stock-status-pill out">
                            <XCircle size={15} /> Hết hàng
                          </span>
                        ) : (
                          <span className="stock-status-pill in">
                            <CheckCircle2 size={15} /> Còn hàng
                          </span>
                        )}
                      </div>

                      {/* Product Description Field (Under Status) */}
                      <div className="meta-description-block">
                        <span className="meta-label description-header-label">Mô tả sản phẩm:</span>
                        <div className="description-content">
                          {product.description && product.description.trim() ? (
                            product.description
                              .split('\n')
                              .filter((paragraph) => paragraph.trim().length > 0)
                              .map((para, i) => <p key={i}>{para}</p>)
                          ) : (
                            <span className="no-description-text">Không</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Back Button */}
                    <button
                      className="back-to-products-btn"
                      onClick={() => onNavigateProducts && onNavigateProducts()}
                    >
                      <ArrowLeft size={16} /> Xem tất cả sản phẩm
                    </button>
                  </div>
                </div>
              </div>

              {/* Related Products Section */}
              {relatedProducts.length > 0 && (
                <div className="related-products-section">
                  <div className="related-header">
                    <h3 className="related-title">Sản phẩm cùng danh mục</h3>
                    <button
                      className="view-more-cat-btn"
                      onClick={() => onNavigateProducts && onNavigateProducts(product.category)}
                    >
                      Xem thêm trong "{product.category}" →
                    </button>
                  </div>

                  <div className="related-products-grid">
                    {relatedProducts.map((relProd) => {
                      const relImg = (relProd.images && relProd.images[0]) || relProd.image;
                      const relIsOut = relProd.status === 'Hết hàng';
                      return (
                        <div
                          key={relProd.id}
                          className="product-item-card"
                          onClick={() => onSelectProduct && onSelectProduct(relProd.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="product-item-img-wrapper">
                            <ImageWithShimmer
                              src={relImg}
                              alt={relProd.name}
                              className="product-item-img"
                            />
                            {relIsOut && (
                              <div className="out-of-stock-overlay">
                                <span>HẾT HÀNG</span>
                              </div>
                            )}
                          </div>

                          <div className="product-item-details">
                            <span className="product-item-category">{relProd.category}</span>
                            <h4 className="product-item-name">{relProd.name}</h4>
                            <div className="product-item-bottom">
                              <span className="product-item-weight">{relProd.weight}</span>
                              {relIsOut ? (
                                <span className="stock-status out">Hết hàng</span>
                              ) : (
                                <span className="stock-status in">Còn hàng</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
