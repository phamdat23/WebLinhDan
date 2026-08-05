import { ref, get, onValue, set, update, remove, push } from 'firebase/database';
import { db } from '../firebase';

/**
 * Utility function to sanitize object by removing undefined properties.
 * Firebase Realtime Database throws an error when encountering `undefined`.
 */
const sanitizePayload = (data) => {
  if (data === null || data === undefined || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(sanitizePayload);
  }
  
  const clean = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      clean[key] = sanitizePayload(data[key]);
    }
  });
  return clean;
};

/**
 * 1. LẤY DỮ LIỆU BẤT ĐỒNG BỘ 1 LẦN (GET / READ ONCE)
 * @param {string} path - Đường dẫn tới node dữ liệu (ví dụ: 'products', 'users/user123')
 * @returns {Promise<any>} - Trả về dữ liệu từ Firebase hoặc null nếu không tồn tại
 */
export const getData = async (path) => {
  try {
    const dbRef = ref(db, path);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error(`❌ [Firebase Service] Lỗi khi lấy dữ liệu tại path "${path}":`, error);
    throw error;
  }
};

/**
 * 2. LẮNG NGHE DỮ LIỆU THỜI GIAN THỰC (REALTIME SUBSCRIBE)
 * @param {string} path - Đường dẫn tới node dữ liệu (ví dụ: 'products', 'categories')
 * @param {Function} callback - Hàm callback nhận dữ liệu mới khi Firebase có thay đổi
 * @param {Function} [onError] - Hàm xử lý lỗi (tùy chọn)
 * @returns {Function} - Hàm unsubscribe để hủy lắng nghe (dùng khi component unmount)
 */
export const subscribeData = (path, callback, onError) => {
  console.log(`📡 [Firebase Service] Đang lắng nghe realtime tại path: "${path}"...`);
  const dbRef = ref(db, path);

  const unsubscribe = onValue(
    dbRef,
    (snapshot) => {
      const data = snapshot.val();
      callback(data);
    },
    (error) => {
      console.error(`❌ [Firebase Service] Lỗi realtime tại path "${path}":`, error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
};

/**
 * 3. THÊM DỮ LIỆU MỚI TỰ ĐỘNG TẠO ID NGẪU NHIÊN (CREATE / PUSH)
 * @param {string} path - Đường dẫn tới tập hợp (ví dụ: 'products', 'orders')
 * @param {Object} data - Dữ liệu cần thêm
 * @returns {Promise<Object>} - Trả về object dữ liệu vừa tạo kèm id và createdAt
 */
export const addData = async (path, data) => {
  const startTime = performance.now();
  try {
    const collectionRef = ref(db, path);
    const newItemRef = push(collectionRef);
    const newId = newItemRef.key || `item_${Date.now()}`;
    const createdAt = Date.now();

    const payload = sanitizePayload({
      ...data,
      id: data.id || String(newId),
      createdAt: data.createdAt || createdAt,
    });

    await set(newItemRef, payload);
    const duration = (performance.now() - startTime).toFixed(2);
    console.log(`✅ [Firebase Service] Đã thêm dữ liệu thành công tại "${path}/${newId}" (${duration}ms)`);

    return payload;
  } catch (error) {
    console.error(`❌ [Firebase Service] Lỗi khi thêm dữ liệu tại path "${path}":`, error);
    throw error;
  }
};

/**
 * 4. THIẾT LẬP / GHI ĐÈ DỮ LIỆU TẠI PATH CỤ THỂ (SET / OVERWRITE)
 * @param {string} path - Đường dẫn cụ thể (ví dụ: 'categories', 'products/prod1')
 * @param {any} data - Dữ liệu cần ghi
 * @returns {Promise<any>}
 */
export const setData = async (path, data) => {
  const startTime = performance.now();
  try {
    const dbRef = ref(db, path);
    const payload = sanitizePayload(data);
    await set(dbRef, payload);
    const duration = (performance.now() - startTime).toFixed(2);
    console.log(`✅ [Firebase Service] Đã ghi đè dữ liệu tại path "${path}" (${duration}ms)`);
    return payload;
  } catch (error) {
    console.error(`❌ [Firebase Service] Lỗi khi ghi đè dữ liệu tại path "${path}":`, error);
    throw error;
  }
};

/**
 * 5. CẬP NHẬT DỮ LIỆU TẠI PATH CỤ THỂ (UPDATE)
 * @param {string} path - Đường dẫn tới node dữ liệu (ví dụ: 'products/123')
 * @param {Object} updates - Các trường dữ liệu cần cập nhật
 * @returns {Promise<Object>}
 */
export const updateData = async (path, updates) => {
  const startTime = performance.now();
  try {
    const dbRef = ref(db, path);
    const payload = sanitizePayload({
      ...updates,
      updatedAt: updates.updatedAt || Date.now(),
    });

    await update(dbRef, payload);
    const duration = (performance.now() - startTime).toFixed(2);
    console.log(`✅ [Firebase Service] Đã cập nhật dữ liệu tại path "${path}" (${duration}ms)`);
    return payload;
  } catch (error) {
    console.error(`❌ [Firebase Service] Lỗi khi cập nhật dữ liệu tại path "${path}":`, error);
    throw error;
  }
};

/**
 * 6. XÓA DỮ LIỆU TẠI PATH CỤ THỂ (DELETE / REMOVE)
 * @param {string} path - Đường dẫn tới node cần xóa (ví dụ: 'products/123')
 * @returns {Promise<void>}
 */
export const deleteData = async (path) => {
  const startTime = performance.now();
  try {
    const dbRef = ref(db, path);
    await remove(dbRef);
    const duration = (performance.now() - startTime).toFixed(2);
    console.log(`✅ [Firebase Service] Đã xóa dữ liệu thành công tại path "${path}" (${duration}ms)`);
  } catch (error) {
    console.error(`❌ [Firebase Service] Lỗi khi xóa dữ liệu tại path "${path}":`, error);
    throw error;
  }
};
