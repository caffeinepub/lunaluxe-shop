import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import AppShell from './components/layout/AppShell';
import HomePage from './components/storefront/HomePage';
import CategoryBrowsePage from './components/storefront/CategoryBrowsePage';
import ProductListPage from './components/storefront/ProductListPage';
import ProductDetailPage from './components/storefront/ProductDetailPage';
import SearchPage from './components/storefront/SearchPage';
import CartPage from './components/cart/CartPage';
import CheckoutPage from './components/checkout/CheckoutPage';
import OrderConfirmationPage from './components/checkout/OrderConfirmationPage';
import MyOrdersPage from './components/orders/MyOrdersPage';
import OrderDetailPage from './components/orders/OrderDetailPage';
import ProfilePage from './components/profile/ProfilePage';
import AdminDashboardPage from './components/admin/AdminDashboardPage';
import AdminOrdersPage from './components/admin/AdminOrdersPage';
import AdminOrderDetailPage from './components/admin/AdminOrderDetailPage';
import AdminProductsPage from './components/admin/AdminProductsPage';
import PaymentSuccess from './components/payments/PaymentSuccess';
import PaymentFailure from './components/payments/PaymentFailure';
import ProfileSetupModal from './components/profile/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/categories',
  component: CategoryBrowsePage,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductListPage,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/$productId',
  component: ProductDetailPage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: SearchPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-confirmation/$orderId',
  component: OrderConfirmationPage,
});

const myOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: MyOrdersPage,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/$orderId',
  component: OrderDetailPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/orders',
  component: AdminOrdersPage,
});

const adminOrderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/orders/$orderId',
  component: AdminOrderDetailPage,
});

const adminProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/products',
  component: AdminProductsPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailure,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  categoriesRoute,
  productsRoute,
  productDetailRoute,
  searchRoute,
  cartRoute,
  checkoutRoute,
  orderConfirmationRoute,
  myOrdersRoute,
  orderDetailRoute,
  profileRoute,
  adminRoute,
  adminOrdersRoute,
  adminOrderDetailRoute,
  adminProductsRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </ThemeProvider>
  );
}
