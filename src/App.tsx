import { lazy } from "react";
import { MotionConfig } from "framer-motion";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { SearchProvider } from "@/features/search/SearchProvider";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { usePrefersReducedMotion } from "@/lib/motion";

const HomePage = lazy(() => import("@/pages/HomePage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const HowItWorksPage = lazy(() => import("@/pages/HowItWorksPage"));
const FoodsPage = lazy(() => import("@/pages/FoodsPage"));
const FoodDetailPage = lazy(() => import("@/pages/FoodDetailPage"));
const RecipesPage = lazy(() => import("@/pages/RecipesPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const DoctorPage = lazy(() => import("@/pages/DoctorPage"));
const SourcesPage = lazy(() => import("@/pages/SourcesPage"));
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage"));
const ShoppingPage = lazy(() => import("@/pages/ShoppingPage"));
const AlternativesPage = lazy(() => import("@/pages/AlternativesPage"));
const IngredientCheckerPage = lazy(() => import("@/pages/IngredientCheckerPage"));
const PrintPage = lazy(() => import("@/pages/PrintPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

/**
 * HashRouter keeps deep links working when the built `index.html` is opened
 * served by a static host without rewrite rules.
 */
export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <MotionConfig reducedMotion="user" skipAnimations={reducedMotion}>
    <ThemeProvider>
      <HashRouter>
        <SearchProvider>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="how-it-works" element={<HowItWorksPage />} />
              <Route path="foods" element={<FoodsPage />} />
              <Route path="foods/:slug" element={<FoodDetailPage />} />
              <Route path="alternatives" element={<AlternativesPage />} />
              <Route path="ingredients" element={<IngredientCheckerPage />} />
              <Route path="print" element={<PrintPage />} />
              <Route path="recipes" element={<RecipesPage />} />
              <Route path="faq" element={<FAQPage />} />
              <Route path="doctor" element={<DoctorPage />} />
              <Route path="sources" element={<SourcesPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="shopping" element={<ShoppingPage />} />
              <Route path="404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </SearchProvider>
      </HashRouter>
    </ThemeProvider>
    </MotionConfig>
  );
}
