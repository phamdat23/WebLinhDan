import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Save } from 'lucide-react';
import './CategoryFormModal.css';

export const CategoryFormModal = ({
  isOpen,
  onClose,
  onSave,
  editingCategory = null,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (editingCategory) {
      // Form edit: Fill toàn bộ thông tin của category (name, image), giữ nguyên ID
      const catId = typeof editingCategory === 'object' ? editingCategory.id : null;
      const catName = typeof editingCategory === 'string' ? editingCategory : editingCategory.name || editingCategory.title || '';
      const catImg = typeof editingCategory === 'object' && editingCategory.image ? editingCategory.image : '';

      setFormData({
        id: catId,
        name: catName,
        image: catImg,
      });
      setImagePreview(catImg);
    } else {
      // Form thêm mới: Khởi tạo trống các trường
      setFormData({
        name: '',
        image: '',
      });
      setImagePreview('');
    }
    setErrors({});
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  // Xử lý tải ảnh từ thiết bị -> Nén nhẹ Base64
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      console.log(`🖼️ [Category Modal] Converting & compressing file "${file.name}"...`);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
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

          const lightweightBase64 = canvas.toDataURL('image/jpeg', 0.6);
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

  // Dán URL ảnh
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, image: url }));
    setImagePreview(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên danh mục';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = editingCategory
      ? {
          id: editingCategory.id, // Giữ nguyên ID khi chỉnh sửa
          name: formData.name.trim(),
          image: formData.image || '',
        }
      : {
          id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, // Tự sinh ID riêng duy nhất khi thêm mới
          name: formData.name.trim(),
          image: formData.image || '',
        };

    onClose();
    if (onSave) {
      onSave(payload);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">
            {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Hiển thị ID nếu đang chỉnh sửa (Read-only ID info) */}
          {editingCategory && (
            <div className="form-field">
              <label className="field-label">Mã danh mục (ID)</label>
              <input
                type="text"
                className="form-input read-only-input"
                value={editingCategory.id}
                disabled
                readOnly
              />
            </div>
          )}

          {/* Tên danh mục */}
          <div className="form-field">
            <label className="field-label required">Tên danh mục</label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="VD: Hạt dinh dưỡng, Trái cây sấy..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Hình ảnh danh mục */}
          <div className="form-field">
            <label className="field-label">Hình ảnh danh mục</label>
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
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {editingCategory ? 'Cập nhật' : 'Thêm danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
