import React, { useState, useEffect } from 'react';
import { Leaf, Menu, X, Search } from 'lucide-react';
import { checkAdminAccessByIP } from '../../firebase';
import './Header.css';

export const Header = ({ onNavigateHome, onNavigateProducts, onNavigateAdmin, onRequestAdminLogin, activePage = 'home' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdminTabAllowed, setIsAdminTabAllowed] = useState(false);

  // Check Firebase Remote Config "remote_ip" to allow rendering Admin Tab
  useEffect(() => {
    let isMounted = true;
    checkAdminAccessByIP().then((allowed) => {
      if (isMounted) {
        setIsAdminTabAllowed(allowed);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Determine current active tab based on activePage & window.location.hash
  const getInitialTab = () => {
    if (activePage === 'products') return 'products';
    if (activePage === 'admin') return 'admin';
    const hash = window.location.hash;
    if (hash === '#ve-chung-toi') return 've-chung-toi';
    if (hash === '#lien-he') return 'lien-he';
    if (hash === '#admin') return 'admin';
    return 'home';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Sync activeTab whenever activePage or hash changes
  useEffect(() => {
    const syncActiveTab = () => {
      if (activePage === 'products') {
        setActiveTab('products');
      } else if (activePage === 'admin') {
        setActiveTab('admin');
      } else {
        const hash = window.location.hash;
        if (hash === '#ve-chung-toi') {
          setActiveTab('ve-chung-toi');
        } else if (hash === '#lien-he') {
          setActiveTab('lien-he');
        } else if (hash === '#admin') {
          setActiveTab('admin');
        } else {
          setActiveTab('home');
        }
      }
    };

    syncActiveTab();

    window.addEventListener('hashchange', syncActiveTab);
    window.addEventListener('popstate', syncActiveTab);

    return () => {
      window.removeEventListener('hashchange', syncActiveTab);
      window.removeEventListener('popstate', syncActiveTab);
    };
  }, [activePage]);

  // ScrollSpy: Track scroll position on HomePage to automatically select current section tab
  useEffect(() => {
    if (activePage !== 'home') return;

    const handleScrollSpy = () => {
      const scrollY = window.scrollY;
      const headerOffset = 120; // 90px header height + padding

      const aboutSection = document.getElementById('ve-chung-toi');
      const contactSection = document.getElementById('lien-he');

      const aboutTop = aboutSection ? aboutSection.offsetTop - headerOffset : Infinity;
      const contactTop = contactSection ? contactSection.offsetTop - headerOffset : Infinity;

      // Check if user scrolled to near bottom of page
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;

      if (isAtBottom && contactSection) {
        setActiveTab('lien-he');
      } else if (scrollY >= contactTop) {
        setActiveTab('lien-he');
      } else if (scrollY >= aboutTop) {
        setActiveTab('ve-chung-toi');
      } else {
        setActiveTab('home');
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy(); // Check initial position on mount

    return () => {
      window.removeEventListener('scroll', handleScrollSpy);
    };
  }, [activePage]);

  const navItems = [
    { id: 'home', label: 'Trang chủ', href: '#trang-chu' },
    { id: 'products', label: 'Sản phẩm', href: '#san-pham' },
    { id: 've-chung-toi', label: 'Về chúng tôi', href: '#ve-chung-toi' },
    { id: 'lien-he', label: 'Liên hệ', href: '#lien-he' },
    ...(isAdminTabAllowed ? [{ id: 'admin', label: 'Quản trị hệ thống', href: '#admin' }] : []),
  ];

  const handleNavClick = (item) => {
    setIsMobileMenuOpen(false);

    if (item.id === 'home') {
      setActiveTab('home');
      if (onNavigateHome) onNavigateHome('#trang-chu');
    } else if (item.id === 'products') {
      setActiveTab('products');
      if (onNavigateProducts) onNavigateProducts('');
    } else if (item.id === 'admin') {
      const isAuth =
        typeof window !== 'undefined' &&
        (localStorage.getItem('isAdminLoggedIn') === 'true' ||
          sessionStorage.getItem('isAdminLoggedIn') === 'true');
      if (isAuth) {
        setActiveTab('admin');
        if (onNavigateAdmin) {
          onNavigateAdmin();
        } else {
          window.location.hash = '#admin';
        }
      } else {
        if (onRequestAdminLogin) {
          onRequestAdminLogin();
        } else if (onNavigateAdmin) {
          onNavigateAdmin();
        } else {
          window.location.hash = '#admin';
        }
      }
    } else {
      setActiveTab(item.id);
      if (onNavigateHome) {
        onNavigateHome(item.href);
      } else {
        window.location.hash = item.href;
      }
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setActiveTab('products');
      if (onNavigateProducts) {
        onNavigateProducts('', searchTerm);
      }
    }
  };

  return (
    <header className="site-header">
      <div className="container header-container">
        {/* Brand Logo */}
        <a
          href="#trang-chu"
          className="brand-logo"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('home');
            if (onNavigateHome) onNavigateHome('#trang-chu');
          }}
        >
          <div className="logo-icon-wrapper">
            <Leaf className="logo-icon" />
          </div>
          <div className="logo-text-group">
            <span className="brand-title">Nông Sản Xanh</span>
            <span className="brand-subtitle">Chất lượng từ thiên nhiên</span>
          </div>
        </a>

        {/* Right Section: Nav Items aligned right + Search Box */}
        <div className={`header-right-wrapper ${isMobileMenuOpen ? 'open' : ''}`}>
          <nav className="main-nav">
            <ul className="nav-list">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id} className="nav-item">
                    <a
                      href={item.href}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(item);
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Search Box at the end */}
          <form className="search-box" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Tìm kiếm">
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="header-actions">
          <button
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};
