import React, { useState, useEffect } from 'react';
import { X, Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { getData } from '../../services/firebaseService';
import './AdminLoginModal.css';

export const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setUsername('');
      setPassword('');
      setErrorMessage('');
      setShowPassword(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      console.log('🔍 [Admin Login] Connecting to Firebase Realtime Database node "admin"...');
      const adminData = await getData('admin');

      if (!adminData) {
        console.warn('⚠️ [Admin Login] Node "admin" in Firebase Realtime Database is empty or null.');
        setErrorMessage('Dữ liệu tài khoản quản trị chưa tồn tại trên Firebase!');
        setIsLoading(false);
        return;
      }

      let isMatch = false;

      if (typeof adminData === 'object') {
        // Direct comparison for { user: "...", password: "..." }
        const dbUser = String(adminData.user || adminData.username || '').trim();
        const dbPass = String(adminData.password || adminData.pass || '').trim();

        if (dbUser === cleanUser && dbPass === cleanPass) {
          isMatch = true;
        } else {
          // Fallback if admin node contains a list/map of admin accounts
          const entries = Object.values(adminData);
          for (const entry of entries) {
            if (entry && typeof entry === 'object') {
              const u = String(entry.user || entry.username || '').trim();
              const p = String(entry.password || entry.pass || '').trim();
              if (u === cleanUser && p === cleanPass) {
                isMatch = true;
                break;
              }
            }
          }
        }
      }

      if (isMatch) {
        console.log('✅ [Admin Login] Login successful!');
        localStorage.setItem('isAdminLoggedIn', 'true');
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        onClose();
      } else {
        console.warn('❌ [Admin Login] Invalid credentials entered.');
        setErrorMessage('Tên đăng nhập hoặc mật khẩu không chính xác!');
      }
    } catch (error) {
      console.error('❌ [Admin Login] Error checking credentials from Firebase:', error);
      setErrorMessage('Đã xảy ra lỗi khi kiểm tra tài khoản từ Firebase. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div className="admin-header-title-group">
            <div className="admin-title-icon-box">
              <ShieldCheck className="admin-title-icon" size={22} />
            </div>
            <div>
              <h3 className="admin-modal-title">Đăng Nhập Quản Trị</h3>
              <p className="admin-modal-subtitle">Xác thực quyền truy cập hệ thống</p>
            </div>
          </div>
          <button className="admin-modal-close-btn" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-body">
          {errorMessage && (
            <div className="admin-error-alert" role="alert">
              <AlertCircle size={18} className="error-alert-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="admin-form-group">
            <label className="admin-field-label">Tên đăng nhập (Username)</label>
            <div className="admin-input-wrapper">
              <User className="admin-input-icon" size={18} />
              <input
                type="text"
                className={`admin-form-input ${errorMessage ? 'input-has-error' : ''}`}
                placeholder="Nhập tên đăng nhập..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-field-label">Mật khẩu (Password)</label>
            <div className="admin-input-wrapper">
              <Lock className="admin-input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`admin-form-input ${errorMessage ? 'input-has-error' : ''}`}
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="admin-toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="spinner-icon" size={18} /> Đang kiểm tra...
                </>
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginModal;
