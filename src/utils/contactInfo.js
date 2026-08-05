// File Cấu hình thông tin liên hệ tập trung (Địa chỉ, Số điện thoại, Facebook, Zalo, Google Maps)
// Bạn có thể dễ dàng thay đổi tất cả các giá trị tại đây mà không cần sửa code giao diện

const defaultAddress = 'Số 2B Đường Phạm Hùng, Cầu Giấy, Hà Nội';
const defaultPhone = '0988 123 456';

export const CONTACT_INFO = {
  brandName: 'Nông Sản Xanh',

  // 1. Số điện thoại & Zalo
  phone: defaultPhone,
  // Link mở Zalo (nếu để rỗng tự sinh từ số điện thoại)
  zaloUrl: 'https://zalo.me/0988123456',

  // 2. Facebook
  facebookName: 'Nông Sản Xanh - Thực Phẩm Sạch',
  facebookUrl: 'https://facebook.com/nongsanxanh.official',

  // 3. Địa chỉ & Google Maps
  address: defaultAddress,
  // Link mở Google Maps trong tab mới khi người dùng click vào địa chỉ
  googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(defaultAddress)}`,

  // 4. Email & Giờ làm việc
  email: 'info@nongsanxanh.vn',
  workHours: '8:00 - 20:00 (Thứ 2 - Chủ Nhật)',

  // Link iframe nhúng bản đồ vị trí (Tự động ghim Marker Red Pin & thông tin thẻ giống như Google Maps)
  // Bạn cũng có thể dán trực tiếp link src từ Google Maps -> Chia sẻ -> Nhúng bản đồ vào đây!
  mapEmbedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(defaultAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
};

// Hàm hỗ trợ tự động tạo link Google Maps tìm kiếm từ địa chỉ
export const getGoogleMapsSearchUrl = (queryAddress) => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryAddress || defaultAddress)}`;
};

// Hàm hỗ trợ tự động tạo link Zalo từ số điện thoại
export const getZaloUrl = (phoneNumber) => {
  const cleanPhone = (phoneNumber || defaultPhone).replace(/\D/g, '');
  return `https://zalo.me/${cleanPhone}`;
};

// Hàm hỗ trợ tạo link nhúng iframe Google Map tự động có Ghim Marker ghim sẵn địa chỉ
export const getGoogleMapEmbedUrl = (queryAddress) => {
  if (!queryAddress || queryAddress === defaultAddress) {
    return CONTACT_INFO.mapEmbedUrl;
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(queryAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
};
