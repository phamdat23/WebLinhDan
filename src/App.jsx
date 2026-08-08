import React, { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { AdminPage } from './pages/AdminPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { checkAdminAccessByIP } from './firebase';
import {
  subscribeProducts,
  subscribeCategories,
  addProductToFirebase,
  updateProductInFirebase,
  deleteProductFromFirebase,
  addCategoryToFirebase,
  updateCategoryInFirebase,
  deleteCategoryFromFirebase,
} from './services/firebaseProductsService';

// Parse route and query parameters from window.location.hash
const parseRoute = () => {
  const hash = window.location.hash || '#trang-chu';
  if (hash.startsWith('#admin')) {
    return { page: 'admin', productId: '', category: '', searchQuery: '', hash };
  }
  if (hash.startsWith('#chi-tiet-san-pham') || hash.startsWith('#detail') || hash.startsWith('#product-detail')) {
    const queryIndex = hash.indexOf('?');
    let productId = '';
    if (queryIndex !== -1) {
      const queryString = hash.substring(queryIndex + 1);
      const params = new URLSearchParams(queryString);
      productId = params.get('id') || '';
    }
    return { page: 'product-detail', productId, category: '', searchQuery: '', hash };
  }
  if (hash.startsWith('#san-pham') || hash.startsWith('#products')) {
    const queryIndex = hash.indexOf('?');
    let category = '';
    let searchQuery = '';
    if (queryIndex !== -1) {
      const queryString = hash.substring(queryIndex + 1);
      const params = new URLSearchParams(queryString);
      category = params.get('category') || '';
      searchQuery = params.get('search') || params.get('q') || '';
    }
    return { page: 'products', productId: '', category, searchQuery, hash };
  }
  return { page: 'home', productId: '', category: '', searchQuery: '', hash };
};

export function App() {
  const initialRoute = parseRoute();
  const [currentPage, setCurrentPage] = useState(initialRoute.page);
  const [selectedProductId, setSelectedProductId] = useState(initialRoute.productId || '');
  const [selectedCategory, setSelectedCategory] = useState(initialRoute.category);
  const [selectedSearchQuery, setSelectedSearchQuery] = useState(initialRoute.searchQuery);
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Subscribe to Firebase Realtime Database for Products & Categories
  useEffect(() => {
    const unsubscribeProducts = subscribeProducts((data) => {
      setProductsList(Array.isArray(data) ? data : []);
      setIsLoadingProducts(false);
    });

    const unsubscribeCategories = subscribeCategories((cats) => {
      setCategoriesList(Array.isArray(cats) ? cats : []);
      setIsLoadingCategories(false);
    });

    return () => {
      if (typeof unsubscribeProducts === 'function') unsubscribeProducts();
      if (typeof unsubscribeCategories === 'function') unsubscribeCategories();
    };
  }, []);

  // Scroll helper to target hash element or top with smooth offset handling for fixed header (height ~80px)
  const scrollToHashOrTop = (targetHash) => {
    if (targetHash && targetHash !== '#trang-chu' && targetHash !== '#admin') {
      setTimeout(() => {
        const element = document.querySelector(targetHash);
        if (element) {
          const headerOffset = 90;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isUserAdminAuthenticated = () => {
    return (
      typeof window !== 'undefined' &&
      (localStorage.getItem('isAdminLoggedIn') === 'true' ||
        sessionStorage.getItem('isAdminLoggedIn') === 'true')
    );
  };

  // Sync state with URL Hash for SPA navigation & Remote Config IP Guard + Login Guard
  useEffect(() => {
    let isMounted = true;
    const handleHashChange = async () => {
      const { page, productId, category, searchQuery, hash } = parseRoute();
      if (page === 'admin') {
        const isAllowed = await checkAdminAccessByIP();
        if (!isAllowed && isMounted) {
          console.warn('⛔ [Admin Guard] Access denied. Current IP is not in Remote Config "remote_ip". Redirecting to home...');
          window.location.hash = '#trang-chu';
          setCurrentPage('home');
          return;
        }

        const isAuth = isUserAdminAuthenticated();
        if (!isAuth && isMounted) {
          setIsAdminLoginOpen(true);
          return;
        }
      }
      if (isMounted) {
        setCurrentPage(page);
        if (productId) setSelectedProductId(productId);
        setSelectedCategory(category);
        setSelectedSearchQuery(searchQuery);
        scrollToHashOrTop(hash);
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      isMounted = false;
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Navigation handlers
  const handleNavigateHome = (targetHash = '#trang-chu') => {
    if (currentPage !== 'home') {
      window.location.hash = targetHash;
    } else {
      if (window.location.hash === targetHash) {
        scrollToHashOrTop(targetHash);
      } else {
        window.location.hash = targetHash;
      }
    }
  };

  const handleNavigateProducts = (category = '', search = '') => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);

    const queryString = params.toString();
    const newHash = queryString ? `#san-pham?${queryString}` : '#san-pham';

    setCurrentPage('products');
    setSelectedCategory(category);
    setSelectedSearchQuery(search);

    if (window.location.hash === newHash) {
      scrollToHashOrTop(newHash);
    } else {
      window.location.hash = newHash;
    }
  };

  const handleNavigateProductDetail = (productId) => {
    if (!productId) return;
    const newHash = `#chi-tiet-san-pham?id=${productId}`;
    setCurrentPage('product-detail');
    setSelectedProductId(productId);
    if (window.location.hash === newHash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = newHash;
    }
  };

  const handleNavigateAdmin = () => {
    const isAuth = isUserAdminAuthenticated();
    if (isAuth) {
      setCurrentPage('admin');
      if (window.location.hash === '#admin') {
        scrollToHashOrTop('#admin');
      } else {
        window.location.hash = '#admin';
      }
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleRequestAdminLogin = () => {
    const isAuth = isUserAdminAuthenticated();
    if (isAuth) {
      handleNavigateAdmin();
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAdminLoginOpen(false);
    localStorage.setItem('isAdminLoggedIn', 'true');
    sessionStorage.setItem('isAdminLoggedIn', 'true');
    window.location.hash = '#admin';
    setCurrentPage('admin');
  };

  const handleCloseAdminLogin = () => {
    setIsAdminLoginOpen(false);
    if (window.location.hash === '#admin' && !isUserAdminAuthenticated()) {
      window.location.hash = '#trang-chu';
      setCurrentPage('home');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    sessionStorage.removeItem('isAdminLoggedIn');
    window.location.hash = '#trang-chu';
    setCurrentPage('home');
  };

  // Optimistic UI updates + Firebase Realtime DB async syncing for Products
  const handleAddProduct = async (newProductData) => {
    setIsSyncing(true);
    const tempId = `temp_${Date.now()}`;
    const optimisticProd = {
      ...newProductData,
      id: tempId,
      createdAt: Date.now(),
    };

    setProductsList((prev) => [optimisticProd, ...prev]);

    try {
      const savedProd = await addProductToFirebase(newProductData);
      setProductsList((prev) =>
        prev.map((item) => (item.id === tempId ? savedProd : item))
      );
    } catch (error) {
      console.warn('Firebase add product notice:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateProduct = async (updatedProductData) => {
    setIsSyncing(true);
    setProductsList((prev) =>
      prev.map((item) =>
        String(item.id) === String(updatedProductData.id)
          ? { ...item, ...updatedProductData, updatedAt: Date.now() }
          : item
      )
    );

    try {
      await updateProductInFirebase(updatedProductData);
    } catch (error) {
      console.warn('Firebase update product notice:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    setIsSyncing(true);
    setProductsList((prev) => prev.filter((item) => String(item.id) !== String(productId)));

    try {
      await deleteProductFromFirebase(productId);
    } catch (error) {
      console.warn('Firebase delete product notice:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Category CRUD Handlers
  const handleAddCategory = async (newCategoryData) => {
    setIsSyncing(true);
    const tempId = `temp_cat_${Date.now()}`;
    const optimisticCat = {
      id: tempId,
      name: typeof newCategoryData === 'string' ? newCategoryData : newCategoryData.name || '',
      image: typeof newCategoryData === 'object' ? newCategoryData.image || '' : '',
    };

    setCategoriesList((prev) => [...prev, optimisticCat]);

    try {
      await addCategoryToFirebase(newCategoryData);
    } catch (error) {
      console.warn('Firebase add category notice:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateCategory = async (updatedCategoryData) => {
    setIsSyncing(true);

    // Tìm tên danh mục cũ trước khi cập nhật
    const existingCat = categoriesList.find(
      (item) => String(item.id) === String(updatedCategoryData.id)
    );
    const oldName = existingCat ? (typeof existingCat === 'string' ? existingCat : existingCat.name || '') : '';
    const newName = updatedCategoryData.name || '';

    // Cập nhật danh sách danh mục (Optimistic UI)
    setCategoriesList((prev) =>
      prev.map((item) =>
        String(item.id) === String(updatedCategoryData.id)
          ? { ...item, ...updatedCategoryData }
          : item
      )
    );

    // Tự động liên kết: Cập nhật tên danh mục cho các sản phẩm trong State nếu tên danh mục thay đổi
    if (oldName && newName && oldName !== newName) {
      console.log(`🔗 [App State] Tự động cập nhật danh mục sản phẩm từ "${oldName}" -> "${newName}"`);
      setProductsList((prevProducts) =>
        prevProducts.map((prod) =>
          prod && prod.category === oldName
            ? { ...prod, category: newName }
            : prod
        )
      );
    }

    try {
      await updateCategoryInFirebase(updatedCategoryData, oldName);
    } catch (error) {
      console.warn('Firebase update category notice:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    setIsSyncing(true);
    setCategoriesList((prev) => prev.filter((item) => String(item.id) !== String(categoryId)));

    try {
      await deleteCategoryFromFirebase(categoryId);
    } catch (error) {
      console.warn('Firebase delete category notice:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      {currentPage === 'admin' ? (
        <AdminPage
          productsList={productsList}
          categoriesList={categoriesList}
          isSyncing={isSyncing}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onNavigateHome={handleNavigateHome}
          onLogout={handleAdminLogout}
        />
      ) : currentPage === 'product-detail' ? (
        <ProductDetailPage
          productId={selectedProductId}
          productsList={productsList}
          onNavigateHome={handleNavigateHome}
          onNavigateProducts={handleNavigateProducts}
          onNavigateAdmin={handleNavigateAdmin}
          onRequestAdminLogin={handleRequestAdminLogin}
          onSelectProduct={handleNavigateProductDetail}
        />
      ) : currentPage === 'products' ? (
        <ProductsPage
          initialCategory={selectedCategory}
          initialSearchQuery={selectedSearchQuery}
          onNavigateHome={handleNavigateHome}
          onNavigateProducts={handleNavigateProducts}
          onNavigateAdmin={handleNavigateAdmin}
          onRequestAdminLogin={handleRequestAdminLogin}
          onSelectProduct={handleNavigateProductDetail}
          productsList={productsList}
          categoriesList={categoriesList}
          isLoadingProducts={isLoadingProducts}
          isLoadingCategories={isLoadingCategories}
        />
      ) : (
        <HomePage
          productsList={productsList}
          categoriesList={categoriesList}
          onNavigateHome={handleNavigateHome}
          onNavigateProducts={handleNavigateProducts}
          onNavigateAdmin={handleNavigateAdmin}
          onRequestAdminLogin={handleRequestAdminLogin}
          onSelectProduct={handleNavigateProductDetail}
          isLoadingProducts={isLoadingProducts}
          isLoadingCategories={isLoadingCategories}
        />
      )}

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={handleCloseAdminLogin}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default App;
