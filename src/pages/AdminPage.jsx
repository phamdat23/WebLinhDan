import React, { useState, useMemo, useEffect } from 'react';
import { checkRemoveCategoryPermission } from '../firebase';
import {
  PieChart,
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  ArrowLeft,
  Leaf,
  CheckCircle,
  AlertTriangle,
  EyeOff,
  Boxes,
  Home,
  FolderTree,
} from 'lucide-react';
import { StatusDonutChart, CategoryDonutChart } from '../components/admin/DonutChart';
import { ProductFormModal } from '../components/admin/ProductFormModal';
import { CategoryFormModal } from '../components/admin/CategoryFormModal';
import './AdminPage.css';

export const AdminPage = ({
  productsList = [],
  categoriesList = [],
  isSyncing = false,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onNavigateHome,
}) => {
  const safeProducts = Array.isArray(productsList) ? productsList : [];
  const safeCategories = useMemo(() => {
    let list = [];
    if (Array.isArray(categoriesList) && categoriesList.length > 0) {
      list = categoriesList.map((c) => (typeof c === 'string' ? c : c.name || c.title || ''));
    } else {
      const cats = new Set();
      safeProducts.forEach((p) => {
        if (p.category) cats.add(p.category);
      });
      list = Array.from(cats);
    }
    return list.filter(Boolean);
  }, [categoriesList, safeProducts]);

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'products' | 'categories'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Confirm Delete Modal State
  const [confirmDeleteConfig, setConfirmDeleteConfig] = useState({
    isOpen: false,
    type: null, // 'product' | 'category'
    id: null,
    name: '',
  });

  // Firebase Remote Config Permission for Category Deletion
  const [canRemoveCategory, setCanRemoveCategory] = useState(false);

  useEffect(() => {
    const fetchRemoveCategoryPermission = async () => {
      const isAllowed = await checkRemoveCategoryPermission();
      setCanRemoveCategory(isAllowed);
    };
    fetchRemoveCategoryPermission();
  }, []);

  // Statistics Calculation
  const stats = useMemo(() => {
    const total = safeProducts.length;
    const inStock = safeProducts.filter((p) => p && p.status === 'Còn hàng').length;
    const outOfStock = safeProducts.filter((p) => p && p.status === 'Hết hàng').length;
    const hidden = safeProducts.filter((p) => p && p.status === 'Ẩn').length;

    // Status counts map
    const statusCounts = {
      'Còn hàng': inStock,
      'Hết hàng': outOfStock,
      'Ẩn': hidden,
    };

    // Category counts map
    const categoryCounts = {};
    safeCategories.forEach((cat) => {
      categoryCounts[cat] = safeProducts.filter((p) => p && p.category === cat).length;
    });

    return { total, inStock, outOfStock, hidden, statusCounts, categoryCounts };
  }, [safeProducts, safeCategories]);

  // Filtered Products for Admin Product Table
  const filteredProducts = useMemo(() => {
    return safeProducts.filter((product) => {
      if (!product) return false;
      if (
        selectedCategoryFilter &&
        product.category !== selectedCategoryFilter
      ) {
        return false;
      }
      if (
        searchQuery.trim() &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [safeProducts, searchQuery, selectedCategoryFilter]);

  // Formatted Categories List for Admin Table
  const formattedCategories = useMemo(() => {
    let list = Array.isArray(categoriesList) ? categoriesList : [];
    if (list.length === 0 && safeProducts.length > 0) {
      const cats = new Set();
      safeProducts.forEach((p) => {
        if (p.category) cats.add(p.category);
      });
      list = Array.from(cats).map((c, idx) => ({ id: String(idx + 1), name: c, image: '' }));
    }
    return list.map((c, idx) => {
      if (typeof c === 'string') {
        return { id: String(idx + 1), name: c, image: '' };
      }
      return { id: String(c.id || idx + 1), name: c.name || c.title || '', image: c.image || '' };
    });
  }, [categoriesList, safeProducts]);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return formattedCategories.filter((cat) => {
      if (!categorySearchQuery.trim()) return true;
      return cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase());
    });
  }, [formattedCategories, categorySearchQuery]);

  // Product Modal Handlers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    if (editingProduct) {
      if (onUpdateProduct) await onUpdateProduct(productData);
    } else {
      if (onAddProduct) await onAddProduct(productData);
    }
  };

  const handleDelete = (id, name) => {
    setConfirmDeleteConfig({
      isOpen: true,
      type: 'product',
      id,
      name: name || 'này',
    });
  };

  // Category Modal Handlers
  const handleOpenAddCategoryModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (categoryData) => {
    if (editingCategory) {
      if (onUpdateCategory) await onUpdateCategory(categoryData);
    } else {
      if (onAddCategory) await onAddCategory(categoryData);
    }
  };

  const handleDeleteCategory = (id, name) => {
    setConfirmDeleteConfig({
      isOpen: true,
      type: 'category',
      id,
      name: name || 'này',
    });
  };

  const handleConfirmDeleteAction = async () => {
    if (!confirmDeleteConfig.isOpen || !confirmDeleteConfig.id) return;
    const { type, id } = confirmDeleteConfig;
    setConfirmDeleteConfig({ isOpen: false, type: null, id: null, name: '' });

    if (type === 'product' && onDeleteProduct) {
      await onDeleteProduct(id);
    } else if (type === 'category' && onDeleteCategory) {
      await onDeleteCategory(id);
    }
  };

  const handleCancelDeleteAction = () => {
    setConfirmDeleteConfig({ isOpen: false, type: null, id: null, name: '' });
  };

  return (
    <div className="admin-page-layout">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo-icon">
            <Leaf size={22} />
          </div>
          <div className="admin-logo-text">
            <h2>Nông Sản Xanh</h2>
            <span>Quyền Quản Trị</span>
          </div>
        </div>

        <nav className="admin-nav-menu">
          <button
            className={`admin-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <PieChart size={20} />
            <span>Thống kê tổng quan</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={20} />
            <span>Danh sách sản phẩm</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <FolderTree size={20} />
            <span>Danh mục sản phẩm</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button
            className="back-home-btn"
            onClick={() => onNavigateHome && onNavigateHome('#trang-chu')}
          >
            <Home size={18} />
            <span>Quay lại trang chủ</span>
          </button>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="admin-main-content">
        {/* TOP BAR */}
        <header className="admin-top-bar">
          <h1 className="admin-page-title">
            {activeTab === 'stats' && 'Thống kê sản phẩm'}
            {activeTab === 'products' && 'Quản lý sản phẩm'}
            {activeTab === 'categories' && 'Quản lý danh mục sản phẩm'}
          </h1>
          <span className="admin-user-badge">Admin System</span>
        </header>

        {isSyncing && (
          <div className="firebase-sync-loading-banner">
            <div className="spinner-dot"></div>
            <span>Đang đồng bộ dữ liệu với Firebase...</span>
          </div>
        )}

        {/* TAB 1: THỐNG KÊ (STATISTICS) */}
        {activeTab === 'stats' && (
          <div className="admin-stats-view">
            {/* Stat Metric Cards */}
            <div className="stats-cards-grid">
              <div className="stat-card total">
                <div className="stat-icon-wrapper">
                  <Boxes size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Tổng số sản phẩm</span>
                  <span className="stat-number">{stats.total}</span>
                </div>
              </div>

              <div className="stat-card instock">
                <div className="stat-icon-wrapper">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Sản phẩm đang bán</span>
                  <span className="stat-number">{stats.inStock}</span>
                </div>
              </div>

              <div className="stat-card outstock">
                <div className="stat-icon-wrapper">
                  <AlertTriangle size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Sản phẩm hết hàng</span>
                  <span className="stat-number">{stats.outOfStock}</span>
                </div>
              </div>

              <div className="stat-card hidden">
                <div className="stat-icon-wrapper">
                  <EyeOff size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Sản phẩm đang ẩn</span>
                  <span className="stat-number">{stats.hidden}</span>
                </div>
              </div>
            </div>

            {/* Donut Charts Section */}
            <div className="charts-grid-container">
              <div className="chart-card-box">
                <StatusDonutChart statusCounts={stats.statusCounts} />
              </div>
              <div className="chart-card-box">
                <CategoryDonutChart categoryCounts={stats.categoryCounts} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUẢN LÝ SẢN PHẨM (PRODUCTS) */}
        {activeTab === 'products' && (
          <div className="admin-products-view">
            {/* Controls Bar */}
            <div className="admin-action-bar">
              <div className="admin-search-filter-group">
                <div className="admin-search-box">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm theo tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="admin-category-select"
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                >
                  <option value="">Tất cả danh mục ({safeCategories.length})</option>
                  {safeCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <button className="add-product-btn" onClick={handleOpenAddModal}>
                <Plus size={18} />
                <span>Thêm sản phẩm mới</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="table-responsive-wrapper">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>Hình ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Quy cách</th>
                    <th>Nhãn</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <img
                            src={
                              product.image ||
                              'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80'
                            }
                            alt={product.name}
                            className="table-img-thumb"
                          />
                        </td>
                        <td>
                          <strong className="table-product-name">{product.name}</strong>
                          <span className="table-product-id">ID: {product.id}</span>
                        </td>
                        <td>
                          <span className="table-category-badge">{product.category}</span>
                        </td>
                        <td>
                          <span className="table-text-muted">{product.weight}</span>
                        </td>
                        <td>
                          <div className="table-tags-group">
                            {product.tags && product.tags.length > 0 ? (
                              product.tags.map((tg) => (
                                <span key={tg} className="table-tag-chip">
                                  {tg}
                                </span>
                              ))
                            ) : (
                              <span className="table-text-muted">-</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {product.status === 'Còn hàng' && (
                            <span className="table-status-pill instock">Còn hàng</span>
                          )}
                          {product.status === 'Hết hàng' && (
                            <span className="table-status-pill outstock">Hết hàng</span>
                          )}
                          {product.status === 'Ẩn' && (
                            <span className="table-status-pill hidden">Ẩn</span>
                          )}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="action-btn edit"
                              onClick={() => handleOpenEditModal(product)}
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleDelete(product.id, product.name)}
                              title="Xóa sản phẩm"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-table-cell">
                        Không có sản phẩm nào khớp với từ khóa tìm kiếm.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: QUẢN LÝ DANH MỤC (CATEGORIES) */}
        {activeTab === 'categories' && (
          <div className="admin-products-view">
            {/* Controls Bar */}
            <div className="admin-action-bar">
              <div className="admin-search-filter-group">
                <div className="admin-search-box">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm danh mục..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <button className="add-product-btn" onClick={handleOpenAddCategoryModal}>
                <Plus size={18} />
                <span>Thêm danh mục mới</span>
              </button>
            </div>

            {/* Categories Table */}
            <div className="table-responsive-wrapper">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>Hình ảnh</th>
                    <th>Tên danh mục</th>
                    <th>Số lượng sản phẩm</th>
                    <th style={{ textAlign: 'right' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => {
                      const prodCount = safeProducts.filter(
                        (p) => p && p.category === cat.name
                      ).length;
                      const sampleProd = safeProducts.find(
                        (p) => p && p.category === cat.name && p.image
                      );
                      const displayImg =
                        cat.image ||
                        (sampleProd
                          ? sampleProd.image
                          : 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=500&q=80');

                      return (
                        <tr key={cat.id}>
                          <td>
                            <img src={displayImg} alt={cat.name} className="table-img-thumb" />
                          </td>
                          <td>
                            <strong className="table-product-name">{cat.name}</strong>
                            <span className="table-product-id">ID: {cat.id}</span>
                          </td>
                          <td>
                            <span className="table-category-badge">{prodCount} sản phẩm</span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="action-btn edit"
                                onClick={() => handleOpenEditCategoryModal(cat)}
                                title="Chỉnh sửa danh mục"
                              >
                                <Edit2 size={16} />
                              </button>
                              {canRemoveCategory && (
                                <button
                                  className="action-btn delete"
                                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                  title="Xóa danh mục"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-table-cell">
                        Chưa có danh mục nào. Hãy bấm "+ Thêm danh mục mới".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        categoriesList={safeCategories}
      />

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
      />

      {/* Custom Confirm Delete Dialog Modal */}
      {confirmDeleteConfig.isOpen && (
        <div className="modal-overlay" onClick={handleCancelDeleteAction}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <div className="confirm-icon-box">
                <AlertTriangle size={28} />
              </div>
              <h3 className="confirm-modal-title">Xác nhận xóa</h3>
            </div>
            <div className="confirm-modal-body">
              <p>
                Bạn có chắc chắn muốn xóa {confirmDeleteConfig.type === 'product' ? 'sản phẩm' : 'danh mục'}{' '}
                <strong>"{confirmDeleteConfig.name}"</strong> không?
              </p>
              <span className="confirm-warning-note">⚠️ Thao tác này sẽ xóa vĩnh viễn và không thể hoàn tác.</span>
            </div>
            <div className="confirm-modal-actions">
              <button className="confirm-btn cancel" onClick={handleCancelDeleteAction}>
                Hủy bỏ
              </button>
              <button className="confirm-btn delete" onClick={handleConfirmDeleteAction}>
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
