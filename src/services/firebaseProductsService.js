import {
  getData,
  subscribeData,
  addData,
  setData,
  updateData,
  deleteData,
} from './firebaseService';

/**
 * Lắng nghe danh sách sản phẩm thời gian thực từ Firebase Realtime Database
 * (Sắp xếp các sản phẩm mới thêm lên trên cùng)
 */
export const subscribeProducts = (onDataChange) => {
  return subscribeData(
    'products',
    (data) => {
      console.log('📥 [Firebase DB] Realtime snapshot received for "products". Has data:', !!data);
      if (!data) {
        onDataChange([]);
      } else {
        // Chuyển object { [id]: productObj } hoặc Array thành Mảng phẳng
        const rawList = Array.isArray(data)
          ? data.filter(Boolean)
          : Object.keys(data).map((key) => ({
              ...data[key],
              id: data[key].id || key,
            }));

        // Sắp xếp sản phẩm mới tạo lên trên cùng theo createdAt / id
        const sortedList = [...rawList].sort((a, b) => {
          const timeA = a.createdAt || (typeof a.id === 'number' ? a.id : 0);
          const timeB = b.createdAt || (typeof b.id === 'number' ? b.id : 0);
          return Number(timeB) - Number(timeA);
        });

        console.log(`✨ [Firebase DB] Xử lý ${sortedList.length} sản phẩm từ Firebase.`);
        onDataChange(sortedList);
      }
    },
    (error) => {
      console.error('❌ [Firebase DB] Lỗi khi lắng nghe danh sách sản phẩm từ Firebase:', error);
      onDataChange([]);
    }
  );
};

/**
 * Lắng nghe danh sách danh mục thời gian thực từ Firebase Realtime Database
 * Mỗi item danh mục chuẩn hóa thành dạng object gồm các trường: { id, name, image }
 */
export const subscribeCategories = (onDataChange) => {
  return subscribeData(
    'categories',
    (data) => {
      if (!data) {
        onDataChange([]);
      } else {
        const rawList = Array.isArray(data)
          ? data.filter(Boolean)
          : Object.keys(data).map((key) => ({
              ...data[key],
              id: data[key].id || key,
            }));

        // Chuẩn hóa cấu trúc object category gồm 3 trường: id, name, image
        const formattedList = rawList.map((item, index) => {
          if (typeof item === 'string') {
            return {
              id: String(index + 1),
              name: item,
              image: '',
            };
          }
          return {
            id: String(item.id || index + 1),
            name: item.name || item.title || '',
            image: item.image || item.image || '',
          };
        });

        onDataChange(formattedList);
      }
    },
    (error) => {
      console.warn('⚠️ [Firebase DB] Lỗi khi lắng nghe danh mục từ Firebase:', error);
      onDataChange([]);
    }
  );
};

/**
 * Thêm sản phẩm mới vào Firebase Realtime Database
 */
export const addProductToFirebase = async (productData) => {
  const rawProduct = {
    name: productData.name || '',
    category: productData.category || 'Hạt dinh dưỡng',
    weight: productData.weight || '',
    tags: Array.isArray(productData.tags) ? productData.tags : [],
    status: productData.status || 'Còn hàng',
    image:
      productData.image ||
      'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80',
  };

  return await addData('products', rawProduct);
};

/**
 * Cập nhật sản phẩm trên Firebase Realtime Database
 */
export const updateProductInFirebase = async (productData) => {
  const productId = String(productData.id);
  const rawProduct = {
    ...productData,
    id: productId,
    tags: Array.isArray(productData.tags) ? productData.tags : [],
  };

  return await updateData(`products/${productId}`, rawProduct);
};

/**
 * Xóa sản phẩm khỏi Firebase Realtime Database
 */
export const deleteProductFromFirebase = async (productId) => {
  return await deleteData(`products/${String(productId)}`);
};

/**
 * Thêm danh mục mới vào Firebase Realtime Database (Object cấu trúc: { id, name, image })
 */
export const addCategoryToFirebase = async (categoryData) => {
  const catId = (categoryData && categoryData.id) ? String(categoryData.id) : `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const rawCategory = {
    id: catId,
    name: typeof categoryData === 'string' ? categoryData : categoryData.name || '',
    image: typeof categoryData === 'object' ? categoryData.image || '' : '',
  };
  return await setData(`categories/${catId}`, rawCategory);
};

/**
 * Cập nhật danh mục trên Firebase Realtime Database và tự động cập nhật tên danh mục cho các sản phẩm liên quan
 */
export const updateCategoryInFirebase = async (categoryData, oldName = '') => {
  const catId = String(categoryData.id);
  const newName = categoryData.name || '';
  const rawCategory = {
    ...categoryData,
    id: catId,
    name: newName,
  };

  // 1. Cập nhật node category
  await updateData(`categories/${catId}`, rawCategory);

  // 2. Tự động liên kết: Cập nhật tên danh mục cho tất cả các sản phẩm thuộc danh mục cũ
  if (oldName && newName && oldName !== newName) {
    try {
      const allProducts = await getData('products');
      if (allProducts) {
        const productKeys = Object.keys(allProducts);
        for (const pKey of productKeys) {
          const prod = allProducts[pKey];
          if (prod && prod.category === oldName) {
            console.log(`🔄 [Firebase DB] Tự động cập nhật danh mục cho sản phẩm ID ${pKey}: "${oldName}" -> "${newName}"`);
            await updateData(`products/${pKey}`, { ...prod, category: newName });
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ [Firebase DB] Lỗi khi tự động liên kết cập nhật danh mục sản phẩm:', err);
    }
  }

  return rawCategory;
};

/**
 * Xóa danh mục khỏi Firebase Realtime Database
 */
export const deleteCategoryFromFirebase = async (categoryId) => {
  return await deleteData(`categories/${String(categoryId)}`);
};
