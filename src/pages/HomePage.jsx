import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { HeroSection } from '../components/sections/HeroSection';
import { CategorySection } from '../components/sections/CategorySection';
import { FeaturedProducts } from '../components/sections/FeaturedProducts';
import { AboutUsSection } from '../components/sections/AboutUsSection';
import { ContactSection } from '../components/sections/ContactSection';

export const HomePage = ({
  productsList = [],
  categoriesList = [],
  onNavigateHome,
  onNavigateProducts,
  onNavigateAdmin,
  onRequestAdminLogin,
  onSelectProduct,
  isLoadingProducts = false,
  isLoadingCategories = false,
}) => {
  return (
    <MainLayout
      onNavigateHome={onNavigateHome}
      onNavigateProducts={onNavigateProducts}
      onNavigateAdmin={onNavigateAdmin}
      onRequestAdminLogin={onRequestAdminLogin}
      activePage="home"
    >
      <HeroSection
        onExploreProducts={() => {
          if (onNavigateProducts) onNavigateProducts('');
        }}
      />
      <CategorySection
        categoriesList={categoriesList}
        productsList={productsList}
        isLoading={isLoadingCategories}
        onSelectCategory={(catTitle) => {
          if (onNavigateProducts) onNavigateProducts(catTitle);
        }}
      />
      <FeaturedProducts
        productsList={productsList}
        isLoading={isLoadingProducts}
        onSelectProduct={onSelectProduct}
        onViewAll={() => {
          if (onNavigateProducts) onNavigateProducts('');
        }}
      />
      <AboutUsSection />
      <ContactSection />
    </MainLayout>
  );
};

export default HomePage;
