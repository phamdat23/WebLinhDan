import React from 'react';
import { Phone, MapPin, ExternalLink } from 'lucide-react';
import {
  CONTACT_INFO,
  getGoogleMapEmbedUrl,
  getGoogleMapsSearchUrl,
  getZaloUrl,
} from '../../utils/contactInfo';
import './ContactSection.css';

const FacebookIcon = ({ size = 22, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const ContactSection = () => {
  const mapSrc = getGoogleMapEmbedUrl(CONTACT_INFO.address);
  const mapsSearchUrl = CONTACT_INFO.googleMapsUrl || getGoogleMapsSearchUrl(CONTACT_INFO.address);
  const zaloUrl = CONTACT_INFO.zaloUrl || getZaloUrl(CONTACT_INFO.phone);
  const facebookUrl = CONTACT_INFO.facebookUrl || 'https://facebook.com';
  const facebookUrl2 = CONTACT_INFO.facebookUrl2 || '';
  const facebookName2 = CONTACT_INFO.facebookName2 || '';

  return (
    <section className="contact-section" id="lien-he">
      <div className="container">
        <div className="contact-card">
          {/* Header Title Section */}
          <div className="contact-header">
            <h2 className="contact-title">THÔNG TIN LIÊN HỆ</h2>
            <p className="contact-subtitle">
              Kết nối ngay với chúng tôi qua Điện thoại / Zalo, Facebook hoặc đến trực tiếp cửa hàng theo chỉ đường Google Maps.
            </p>
          </div>

          {/* Body Layout: Contact Items & Map */}
          <div className="contact-body-grid">
            {/* Left Side: Contact Information Items */}
            <div className="contact-left-col">
              <div className="contact-info-list">
                {/* Item 1: Địa chỉ -> Mở Google Maps tab mới */}
                <a
                  href={mapsSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-info-item clickable-item"
                  title="Click để xem vị trí trên Google Maps"
                >
                  <div className="contact-icon-box maps-icon-box">
                    <MapPin className="contact-icon" size={22} />
                  </div>
                  <div className="contact-info-detail">
                    <span className="info-label">
                      Địa chỉ cửa hàng <ExternalLink size={12} className="link-icon-inline" />
                    </span>
                    <span className="info-value-link">{CONTACT_INFO.address}</span>
                  </div>
                </a>

                {/* Item 2: Số điện thoại / Zalo gộp chung 1 Box */}
                <div className="contact-info-item">
                  <div className="contact-icon-box zalo-icon-box">
                    <Phone className="contact-icon" size={22} />
                  </div>
                  <div className="contact-info-detail">
                    <span className="info-label">Số điện thoại / Zalo</span>
                    <div className="phone-links-group">
                      <a
                        href={CONTACT_INFO.zaloUrl1 || getZaloUrl(CONTACT_INFO.phone1)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="info-value-link phone-single-link"
                        title={`Click để chat Zalo ngay với ${CONTACT_INFO.phone1}`}
                      >
                        {CONTACT_INFO.phone1} <ExternalLink size={12} className="link-icon-inline" />
                      </a>
                      <span className="phone-separator">•</span>
                      <a
                        href={CONTACT_INFO.zaloUrl2 || getZaloUrl(CONTACT_INFO.phone2)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="info-value-link phone-single-link"
                        title={`Click để chat Zalo ngay với ${CONTACT_INFO.phone2}`}
                      >
                        {CONTACT_INFO.phone2} <ExternalLink size={12} className="link-icon-inline" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Item 3: Facebook 1 -> Mở Facebook tab mới */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-info-item clickable-item"
                  title="Click để truy cập Facebook Fanpage"
                >
                  <div className="contact-icon-box facebook-icon-box">
                    <FacebookIcon size={20} className="contact-icon" />
                  </div>
                  <div className="contact-info-detail">
                    <span className="info-label">
                      Facebook Fanpage <ExternalLink size={12} className="link-icon-inline" />
                    </span>
                    <span className="info-value-link">{CONTACT_INFO.facebookName}</span>
                  </div>
                </a>

                {/* Item 4: Facebook 2 -> Mở Facebook tab mới */}
                {facebookUrl2 && (
                  <a
                    href={facebookUrl2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-info-item clickable-item"
                    title="Click để truy cập Facebook cá nhân"
                  >
                    <div className="contact-icon-box facebook-icon-box">
                      <FacebookIcon size={20} className="contact-icon" />
                    </div>
                    <div className="contact-info-detail">
                      <span className="info-label">
                        Facebook cá nhân <ExternalLink size={12} className="link-icon-inline" />
                      </span>
                      <span className="info-value-link">{facebookName2}</span>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Right Side: Google Map Embed Box */}
            <div className="contact-right-col">
              <div className="map-container">
                <iframe
                  title="Google Map Address"
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
