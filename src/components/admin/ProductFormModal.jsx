import React, { useState, useEffect } from 'react';
import { TAGS_LIST } from '../../utils/productsData';
import { X, Upload, Image as ImageIcon, Save } from 'lucide-react';
import './ProductFormModal.css';

const DEFAULT_CATEGORIES = [
  'Hạt dinh dưỡng',
  'Trái cây sấy',
  'Cà phê - Trà',
  'Gạo - Ngũ cốc',
  'Nông sản khô',
  'Đặc sản vùng miền',
];

export const ProductFormModal = ({
  isOpen,
  onClose,
  onSave,
  editingProduct = null,
  categoriesList = [],
}) => {
  // Safe array fallback for categories and tags
  const safeCategories = Array.isArray(categoriesList) && categoriesList.length > 0
    ? categoriesList.map((c) => (typeof c === 'string' ? c : c.name || c.title || '')).filter(Boolean)
    : DEFAULT_CATEGORIES;

  const safeTagsList = Array.isArray(TAGS_LIST) ? TAGS_LIST : ['Mới về', 'Nổi bật', 'Bán chạy'];

  const [formData, setFormData] = useState({
    name: '',
    category: safeCategories[0] || 'Hạt dinh dưỡng',
    weight: 'Gói 250g / 500g',
    status: 'Còn hàng',
    tags: ['Mới về'],
    image: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80',
  });

  const [imagePreview, setImagePreview] = useState('https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80');
  const [errors, setErrors] = useState({});

  // Reset or fill form safely whenever editingProduct or isOpen changes
  useEffect(() => {
    if (!isOpen) return;

    if (editingProduct) {
      const existingTags = Array.isArray(editingProduct.tags) ? [...editingProduct.tags] : [];
      setFormData({
        name: editingProduct.name || '',
        category: editingProduct.category || safeCategories[0] || 'Hạt dinh dưỡng',
        weight: editingProduct.weight || 'Gói 250g / 500g',
        status: editingProduct.status || 'Còn hàng',
        tags: existingTags,
        image: editingProduct.image || '',
      });
      setImagePreview(editingProduct.image || '');
    } else {
      setFormData({
        name: '',
        category: safeCategories[0] || 'Hạt dinh dưỡng',
        weight: 'Gói 250g / 500g',
        status: 'Còn hàng',
        tags: ['Mới về'],
        image: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80',
      });
      setImagePreview('https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80');
    }
    setErrors({});
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  // Handle device file upload -> Ultra fast lightweight Base64 compression (max 400px, quality 0.6)
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      console.log(`🖼️ [Form Modal] Converting & compressing file "${file.name}" (${(file.size / 1024).toFixed(1)} KB)...`);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400; // max width/height 400px for web thumbnail
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Generate lightweight JPEG Base64 (~15KB)
          const lightweightBase64 = canvas.toDataURL('image/jpeg', 0.6);
          console.log(`⚡ [Form Modal] Ultra-lightweight Base64 generated (~${(lightweightBase64.length / 1024).toFixed(1)} KB).`);

          setFormData((prev) => ({ ...prev, image: lightweightBase64 }));
          setImagePreview(lightweightBase64);
        };
        img.onerror = () => {
          setFormData((prev) => ({ ...prev, image: event.target.result }));
          setImagePreview(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle URL change
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, image: url }));
    setImagePreview(url);
  };

  // Toggle Tag selection safely
  const toggleTag = (tag) => {
    setFormData((prev) => {
      const currentTags = Array.isArray(prev.tags) ? prev.tags : [];
      const exists = currentTags.includes(tag);
      const updatedTags = exists
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];
      return { ...prev, tags: updatedTags };
    });
  };

  // Form Submit Handler -> Closes dialog IMMEDIATELY upon saving
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📝 [Form Modal] Submit button pressed. Validating form...');

    const newErrors = {};
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên sản phẩm';
    }
    if (!formData.weight || !formData.weight.trim()) {
      newErrors.weight = 'Vui lòng nhập quy cách đóng gói';
    }

    if (Object.keys(newErrors).length > 0) {
      console.warn('⚠️ [Form Modal] Validation errors:', newErrors);
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...editingProduct,
      ...formData,
      image: formData.image || 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80',
    };

    console.log('🚀 [Form Modal] Closing dialog instantly and executing onSave payload...');

    // 1. Tắt dialog ngay lập tức khi ấn lưu
    onClose();

    // 2. Gửi dữ liệu sản phẩm chứa chuỗi Base64 siêu nhẹ lên Firebase
    if (onSave) {
      onSave(payload);
    }
  };

  const currentTagsList = Array.isArray(formData.tags) ? formData.tags : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">
            {editingProduct ? 'Chỉnh sửa thông tin sản phẩm' : 'Thêm sản phẩm mới'}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Tên sản phẩm */}
          <div className="form-field">
            <label className="field-label required">Tên sản phẩm</label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="VD: Hạt Điều Rang Muối Vỏ Lụa..."
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-row-2">
            {/* Danh mục */}
            <div className="form-field">
              <label className="field-label required">Danh mục</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                {safeCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Quy cách */}
            <div className="form-field">
              <label className="field-label required">Quy cách / Khối lượng</label>
              <input
                type="text"
                className={`form-input ${errors.weight ? 'input-error' : ''}`}
                placeholder="VD: Gói 250g / 500g..."
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
              />
              {errors.weight && <span className="error-text">{errors.weight}</span>}
            </div>
          </div>

          {/* Trạng thái */}
          <div className="form-field">
            <label className="field-label required">Trạng thái kho hàng</label>
            <div className="radio-group-horizontal">
              {['Còn hàng', 'Hết hàng', 'Ẩn'].map((st) => (
                <label key={st} className={`radio-pill ${formData.status === st ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="status"
                    value={st}
                    checked={formData.status === st}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nhãn / Tags */}
          <div className="form-field">
            <label className="field-label">Nhãn nổi bật (Tag)</label>
            <div className="checkbox-tags-group">
              {safeTagsList.map((tag) => {
                const isSelected = currentTagsList.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-chip-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hình ảnh */}
          <div className="form-field">
            <label className="field-label">Hình ảnh sản phẩm</label>
            <div className="image-upload-wrapper">
              <div className="image-preview-box">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="preview-img" />
                ) : (
                  <div className="preview-placeholder">
                    <ImageIcon size={32} />
                    <span>Chưa chọn ảnh</span>
                  </div>
                )}
              </div>

              <div className="image-inputs-col">
                <label className="file-upload-btn">
                  <Upload size={16} /> Chọn ảnh từ thiết bị
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>

                <span className="divider-text">hoặc dán đường dẫn ảnh:</span>

                <input
                  type="text"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={handleUrlChange}
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Save size={16} /> {editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
