import React, { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import {
  TAGS_LIST,
  STATUS_LIST,
} from '../utils/productsData';
import {
  Filter,
  RotateCcw,
  CheckSquare,
  Square,
  CheckCircle2,
  Circle,
  Search,
  Tag,
} from 'lucide-react';
import './ProductsPage.css';

const DEFAULT_CATEGORIES = [
  'Hạt dinh dưỡng',
  'Trái cây sấy',
  'Cà phê - Trà',
  'Gạo - Ngũ cốc',
  'Nông sản khô',
  'Đặc sản vùng miền',
];

export const ProductsPage = ({
  initialCategory = '',
  initialSearchQuery = '',
  onNavigateHome,
  onNavigateProducts,
  onNavigateAdmin,
  productsList = [],
  categoriesList = [],
}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // State tìm kiếm và Debounce 2 giây
  const [searchInput, setSearchInput] = useState(initialSearchQuery || '');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [isSearching, setIsSearching] = useState(false);

  // Extract dynamic categories from categoriesList or productsList with DEFAULT_CATEGORIES fallback
  const activeCategories = useMemo(() => {
    let list = [];
    if (Array.isArray(categoriesList) && categoriesList.length > 0) {
      list = categoriesList.map((c) => (typeof c === 'string' ? c : c.name || c.title || ''));
    } else if (Array.isArray(productsList) && productsList.length > 0) {
      const cats = new Set();
      productsList.forEach((p) => {
        if (p.category) cats.add(p.category);
      });
      list = Array.from(cats);
    }
    
    const validList = list.filter(Boolean);
    return validList.length > 0 ? validList : DEFAULT_CATEGORIES;
  }, [categoriesList, productsList]);

  // Apply initial category & search query when coming from search or URL
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    }
    if (initialSearchQuery !== undefined && initialSearchQuery !== null) {
      setSearchInput(initialSearchQuery);
      setSearchQuery(initialSearchQuery);
      setIsSearching(false);
    }
    window.scrollTo(0, 0);
  }, [initialCategory, initialSearchQuery]);

  // Xử lý khi người dùng nhập vào ô tìm kiếm:
  // Nếu ô nhập trở về rỗng -> Cập nhật ngay lập tức không có delay, hiển thị toàn bộ sản phẩm!
  // Nếu có từ khóa -> Hiện loading và đếm ngược 2s mới tiến hành lọc.
  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (!val.trim()) {
      setSearchQuery('');
      setIsSearching(false);
    } else {
      setIsSearching(true);
    }
  };

  useEffect(() => {
    if (searchInput === searchQuery) {
      setIsSearching(false);
      return;
    }

    if (!searchInput.trim()) {
      setSearchQuery('');
      setIsSearching(false);
      return;
    }

    // Đợi 1 giây (1000ms) sau khi người dùng ngừng gõ (nếu có từ khóa) mới tiến hành lọc
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setIsSearching(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchInput, searchQuery]);

  // Handle Category Checkbox Toggle (Multiple select)
  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Handle Tag Checkbox Toggle (Multiple select)
  const toggleTag = (tg) => {
    setSelectedTags((prev) =>
      prev.includes(tg) ? prev.filter((t) => t !== tg) : [...prev, tg]
    );
  };

  // Handle Status Toggle (Single choice: 'Còn hàng' | 'Hết hàng')
  const toggleStatus = (st) => {
    setSelectedStatus((prev) => (prev === st ? '' : st));
  };

  // Clear all active filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedStatus('');
    setSearchInput('');
    setSearchQuery('');
    setIsSearching(false);
  };

  // Filter products dynamically based on category, tags, status & search query (Fuzzy matching name & category)
  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      // Products with status 'Ẩn' are NEVER displayed
      if (product.status === 'Ẩn') {
        return false;
      }

      // Category filter (Multiple allowed)
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(product.category)
      ) {
        return false;
      }

      // Tag filter (Multiple allowed)
      if (
        selectedTags.length > 0 &&
        !selectedTags.some((tg) => product.tags && product.tags.includes(tg))
      ) {
        return false;
      }

      // Status filter (Single choice: 'Còn hàng' | 'Hết hàng')
      if (selectedStatus && product.status !== selectedStatus) {
        return false;
      }

      // Search query filter (Fuzzy/partial matching by Product Name OR Category Name)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = product.name && product.name.toLowerCase().includes(query);
        const matchCategory = product.category && product.category.toLowerCase().includes(query);
        if (!matchName && !matchCategory) {
          return false;
        }
      }

      return true;
    });
  }, [productsList, selectedCategories, selectedTags, selectedStatus, searchQuery]);

  return (
    <MainLayout
      onNavigateHome={onNavigateHome}
      onNavigateProducts={onNavigateProducts}
      onNavigateAdmin={onNavigateAdmin}
      activePage="products"
    >
      <div className="products-page">
        <div className="container">
          <div className="products-layout-grid">
            {/* Left Sidebar Filter Panel */}
            <aside className="filter-sidebar">
              <div className="filter-card">
                <div className="filter-header">
                  <div className="filter-title-group">
                    <Filter size={18} className="filter-icon" />
                    <h3 className="filter-main-title">BỘ LỌC SẢN PHẨM</h3>
                  </div>
                </div>

                {/* Filter Block 1: Search inside page with 2s Debounce & Loading */}
                <div className="filter-group">
                  <h4 className="filter-group-title">TÌM KIẾM</h4>
                  <div className="filter-search-input-box">
                    <input
                      type="text"
                      className="filter-search-input"
                      placeholder="Tên hoặc danh mục..."
                      value={searchInput}
                      onChange={handleSearchInputChange}
                    />
                    {isSearching ? (
                      <div className="filter-search-spinner" />
                    ) : (
                      <Search size={16} className="filter-search-icon" />
                    )}
                  </div>
                </div>

                {/* Filter Block 2: Danh Mục (Multiple Checkboxes) */}
                <div className="filter-group">
                  <h4 className="filter-group-title">DANH MỤC SẢN PHẨM</h4>
                  <div className="checkbox-list">
                    {activeCategories.length === 0 ? (
                      <div style={{ fontSize: '13px', color: '#888' }}>Chưa có danh mục</div>
                    ) : (
                      activeCategories.map((cat) => {
                        const isChecked = selectedCategories.includes(cat);
                        return (
                          <label
                            key={cat}
                            className={`checkbox-item ${isChecked ? 'active' : ''}`}
                            onClick={() => toggleCategory(cat)}
                          >
                            <div className="checkbox-box">
                              {isChecked ? (
                                <CheckSquare className="icon-checked" size={18} />
                              ) : (
                                <Square className="icon-unchecked" size={18} />
                              )}
                            </div>
                            <span className="checkbox-label">{cat}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Filter Block 3: Nhãn nổi bật (Tags Filter) */}
                <div className="filter-group">
                  <h4 className="filter-group-title">MẶT HÀNG / NHÃN</h4>
                  <div className="checkbox-list">
                    {TAGS_LIST.map((tag) => {
                      const isChecked = selectedTags.includes(tag);
                      return (
                        <label
                          key={tag}
                          className={`checkbox-item ${isChecked ? 'active' : ''}`}
                          onClick={() => toggleTag(tag)}
                        >
                          <div className="checkbox-box">
                            {isChecked ? (
                              <CheckSquare className="icon-checked" size={18} />
                            ) : (
                              <Square className="icon-unchecked" size={18} />
                            )}
                          </div>
                          <span className="checkbox-label">{tag}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Filter Block 4: Trạng thái (Status Single Selection) */}
                <div className="filter-group">
                  <h4 className="filter-group-title">TRẠNG THÁI TỒN KHO</h4>
                  <div className="checkbox-list">
                    {STATUS_LIST.map((st) => {
                      const isChecked = selectedStatus === st;
                      return (
                        <label
                          key={st}
                          className={`checkbox-item ${isChecked ? 'active' : ''}`}
                          onClick={() => toggleStatus(st)}
                        >
                          <div className="checkbox-box">
                            {isChecked ? (
                              <CheckCircle2 className="icon-checked" size={18} />
                            ) : (
                              <Circle className="icon-unchecked" size={18} />
                            )}
                          </div>
                          <span className="checkbox-label">{st}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Main Content Area */}
            <main className="products-main-content">
              {/* Active Filter Bar */}
              <div className="products-top-bar">
                <div className="products-count">
                  Hiển thị <strong>{isSearching ? '...' : filteredProducts.length}</strong> sản phẩm
                </div>

                {/* Active Filter Badges */}
                {(selectedCategories.length > 0 ||
                  selectedTags.length > 0 ||
                  selectedStatus) && (
                  <div className="active-tags-list">
                    {selectedCategories.map((cat) => (
                      <span key={cat} className="active-tag category-tag">
                        {cat}
                        <button onClick={() => toggleCategory(cat)}>×</button>
                      </span>
                    ))}
                    {selectedTags.map((tg) => (
                      <span key={tg} className="active-tag tag-badge">
                        <Tag size={11} /> {tg}
                        <button onClick={() => toggleTag(tg)}>×</button>
                      </span>
                    ))}
                    {selectedStatus && (
                      <span className="active-tag status-tag">
                        {selectedStatus}
                        <button onClick={() => setSelectedStatus('')}>×</button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Loading State or Products Grid */}
              {isSearching ? (
                <div className="search-loading-container">
                  <div className="search-loading-spinner" />
                  <p className="search-loading-text">Đang tìm kiếm sản phẩm...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="products-grid">
                  {filteredProducts.map((product) => {
                    const isOutOfStock = product.status === 'Hết hàng';
                    return (
                      <div
                        key={product.id}
                        className={`product-item-card ${
                          isOutOfStock ? 'is-out-of-stock' : ''
                        }`}
                      >
                        <div className="product-item-img-wrapper">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="product-item-img"
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

                          {/* Out of Stock Overlay Banner */}
                          {isOutOfStock && (
                            <div className="out-of-stock-overlay">
                              <span>HẾT HÀNG</span>
                            </div>
                          )}
                        </div>

                        <div className="product-item-details">
                          <span className="product-item-category">
                            {product.category}
                          </span>
                          <h3 className="product-item-name">{product.name}</h3>
                          <div className="product-item-bottom">
                            <span className="product-item-weight">
                              {product.weight}
                            </span>
                            {isOutOfStock ? (
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
              ) : (
                <div className="empty-products-state">
                  <h3>Không tìm thấy sản phẩm nào</h3>
                  <p>
                    Thử bỏ bớt điều kiện lọc hoặc từ khóa tìm kiếm để hiển thị nhiều sản phẩm hơn.
                  </p>
                  <button className="reset-filter-btn-lg" onClick={clearFilters}>
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
