// File Cấu hình thông tin liên hệ tập trung (Địa chỉ, Số điện thoại, Facebook, Zalo, Google Maps)
// Bạn có thể dễ dàng thay đổi tất cả các giá trị tại đây mà không cần sửa code giao diện

const defaultAddress = '60 QL279D, Mường La, Sơn La, Việt Nam';
const defaultPhone1 = '0982 051 975';
const defaultPhone2 = '0978 213 067';

export const CONTACT_INFO = {
  brandName: 'Hải Sản Làng Chài-Nga Doãn',

  // 1. Số điện thoại & Zalo
  phone1: defaultPhone1,
  phone2: defaultPhone2,
  phone: defaultPhone1, // Fallback

  zaloUrl1: 'https://zalo.me/0982051975',
  zaloUrl2: 'https://zalo.me/0978213067',
  zaloUrl: 'https://zalo.me/0982051975', // Fallback

  // 2. Facebook
  facebookName: 'Hải Sản Làng Chài-Nga Doãn',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61593230153765',

  // 3. Địa chỉ & Google Maps
  address: defaultAddress,

  // Link iframe nhúng bản đồ vị trí (Tự động ghim Marker Red Pin & thông tin thẻ địa chỉ)
  // Khi bạn đổi địa chỉ ở biến defaultAddress hoặc address, bản đồ sẽ tự ghim Marker tại địa chỉ mới.
  // Nếu bạn muốn dán link iframe tùy chỉnh lấy từ Google Maps (Chia sẻ -> Nhúng bản đồ), dán vào customMapEmbedUrl bên dưới:
  customMapEmbedUrl: '',
};

// Hàm hỗ trợ tự động tạo link Google Maps tìm kiếm từ địa chỉ
export const getGoogleMapsSearchUrl = (queryAddress) => {
  const addr = queryAddress || CONTACT_INFO.address || defaultAddress;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
};

// Hàm hỗ trợ tự động tạo link Zalo từ số điện thoại
export const getZaloUrl = (phoneNumber) => {
  const cleanPhone = (phoneNumber || defaultPhone1).replace(/\D/g, '');
  return `https://zalo.me/${cleanPhone}`;
};

// Hàm hỗ trợ tạo link nhúng iframe Google Map tự động có Ghim Marker Đỏ (Red Pin) chắc chắn hiển thị
export const getGoogleMapEmbedUrl = (queryAddress) => {
  if (CONTACT_INFO.customMapEmbedUrl && (!queryAddress || queryAddress === CONTACT_INFO.address)) {
    return CONTACT_INFO.customMapEmbedUrl;
  }
  const addr = queryAddress || CONTACT_INFO.address || defaultAddress;
  return `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&t=&z=16&ie=UTF8&iwloc=near&output=embed`;
};
