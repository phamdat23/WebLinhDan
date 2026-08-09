import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TAGS_LIST } from '../../utils/productsData';
import { X, Upload, Image as ImageIcon, Save, Plus, Trash2, Star } from 'lucide-react';
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
  // Safe array fallback for categories and tags — dùng useMemo để tránh tạo reference mới mỗi render
  // (nếu không, useEffect bên dưới sẽ fire liên tục và reset form mỗi khi người dùng nhập liệu)
  const safeCategories = useMemo(() => {
    return Array.isArray(categoriesList) && categoriesList.length > 0
      ? categoriesList.map((c) => (typeof c === 'string' ? c : c.name || c.title || '')).filter(Boolean)
      : DEFAULT_CATEGORIES;
  }, [categoriesList]);

  const safeTagsList = useMemo(() => {
    return Array.isArray(TAGS_LIST) ? TAGS_LIST : ['Mới về', 'Nổi bật', 'Bán chạy'];
  }, []);

  // Ref để reset file input sau mỗi lần upload (cho phép chọn lại cùng 1 file)
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: safeCategories[0] || 'Hạt dinh dưỡng',
    weight: 'Gói 250g / 500g',
    status: 'Còn hàng',
    tags: ['Mới về'],
    images: ['https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80'],
    description: '',
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [errors, setErrors] = useState({});

  // Reset or fill form safely whenever editingProduct or isOpen changes
  useEffect(() => {
    if (!isOpen) return;

    if (editingProduct) {
      const existingTags = Array.isArray(editingProduct.tags) ? [...editingProduct.tags] : [];
      let existingImages = [];
      if (Array.isArray(editingProduct.images) && editingProduct.images.length > 0) {
        existingImages = [...editingProduct.images];
      } else if (editingProduct.image) {
        existingImages = [editingProduct.image];
      }
      if (existingImages.length === 0) {
        existingImages = ['https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80'];
      }

      // Determine valid initial category: use editingProduct.category if it exists in list, else default to first item
      const initialCat = (editingProduct.category && safeCategories.includes(editingProduct.category))
        ? editingProduct.category
        : (safeCategories[0] || 'Hạt dinh dưỡng');

      setFormData({
        name: editingProduct.name || '',
        category: initialCat,
        weight: editingProduct.weight || 'Gói 250g / 500g',
        status: editingProduct.status || 'Còn hàng',
        tags: existingTags,
        images: existingImages,
        description: editingProduct.description || '',
      });
    } else {
      setFormData({
        name: '',
        category: safeCategories[0] || 'Hạt dinh dưỡng',
        weight: 'Gói 250g / 500g',
        status: 'Còn hàng',
        tags: ['Mới về'],
        images: ['https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80'],
        description: '',
      });
    }
    setNewImageUrl('');
    setErrors({});
  }, [editingProduct, isOpen, safeCategories]);

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

          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, lightweightBase64],
          }));

          // Reset file input để có thể chọn lại cùng 1 file lần sau
          if (fileInputRef.current) fileInputRef.current.value = '';
        };
        img.onerror = () => {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, event.target.result],
          }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Add image URL from input
  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  // Remove image from list
  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: updated.length > 0 ? updated : ['https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80'],
      };
    });
  };

  // Set primary image (move to position 0)
  const handleSetPrimary = (index) => {
    if (index === 0) return;
    setFormData((prev) => {
      const updated = [...prev.images];
      const [selected] = updated.splice(index, 1);
      updated.unshift(selected);
      return { ...prev, images: updated };
    });
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

    const finalImages = formData.images.length > 0
      ? formData.images
      : ['https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80'];

    // Check if form data has actually changed compared to editingProduct
    if (editingProduct) {
      const origTags = Array.isArray(editingProduct.tags) ? editingProduct.tags : [];
      const origImages = Array.isArray(editingProduct.images) && editingProduct.images.length > 0
        ? editingProduct.images
        : (editingProduct.image ? [editingProduct.image] : []);

      const isNameSame = (editingProduct.name || '') === formData.name.trim();
      const isCategorySame = (editingProduct.category || safeCategories[0] || 'Hạt dinh dưỡng') === formData.category;
      const isWeightSame = (editingProduct.weight || '') === formData.weight.trim();
      const isStatusSame = (editingProduct.status || 'Còn hàng') === formData.status;
      const isDescSame = (editingProduct.description || '') === (formData.description || '').trim();
      const isTagsSame = JSON.stringify(origTags.sort()) === JSON.stringify([...formData.tags].sort());
      const isImagesSame = JSON.stringify(origImages) === JSON.stringify(finalImages);

      if (isNameSame && isCategorySame && isWeightSame && isStatusSame && isDescSame && isTagsSame && isImagesSame) {
        console.log('ℹ️ [Form Modal] No changes detected. Closing modal without saving.');
        onClose();
        return;
      }
    }

    const payload = {
      ...editingProduct,
      ...formData,
      name: formData.name.trim(),
      weight: formData.weight.trim(),
      images: finalImages,
      image: finalImages[0], // preserving single image backward compatibility
      description: (formData.description || '').trim(),
    };

    console.log('🚀 [Form Modal] Closing dialog instantly and executing onSave payload...');

    // 1. Tắt dialog ngay lập tức khi ấn lưu
    onClose();

    // 2. Gửi dữ liệu sản phẩm lên Firebase
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

          {/* Danh sách Hình ảnh (Multi-image management) */}
          <div className="form-field">
            <label className="field-label">Hình ảnh sản phẩm (Có thể thêm nhiều ảnh)</label>

            {/* Thumbnail list of added images */}
            <div className="multi-images-preview-list">
              {formData.images.map((imgUrl, idx) => (
                <div key={idx} className={`multi-image-thumb-box ${idx === 0 ? 'is-primary' : ''}`}>
                  <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="thumb-img" />
                  {idx === 0 && <span className="primary-badge">Ảnh chính</span>}
                  
                  <div className="thumb-actions-overlay">
                    {idx !== 0 && (
                      <button
                        type="button"
                        className="thumb-action-btn set-primary"
                        onClick={() => handleSetPrimary(idx)}
                        title="Đặt làm ảnh chính"
                      >
                        <Star size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="thumb-action-btn remove"
                      onClick={() => handleRemoveImage(idx)}
                      title="Xóa ảnh"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Controls to add images */}
            <div className="image-upload-wrapper">
              <div className="image-inputs-col">
                <div className="file-upload-row">
                  <label className="file-upload-btn">
                    <Upload size={16} /> Chọn ảnh từ thiết bị
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span className="divider-text">hoặc thêm URL ảnh:</span>
                </div>

                <div className="url-add-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://images.unsplash.com/..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="add-url-btn"
                    onClick={handleAddImageUrl}
                  >
                    <Plus size={16} /> Thêm ảnh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mô tả sản phẩm (Description) */}
          <div className="form-field">
            <label className="field-label">Mô tả sản phẩm</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Nhập thông tin chi tiết, xuất xứ, công dụng, hướng dẫn sử dụng sản phẩm..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
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
