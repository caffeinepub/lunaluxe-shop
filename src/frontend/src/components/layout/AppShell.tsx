import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, Search, ShoppingBag, User, Menu, ShoppingCart, Shield } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useCart } from '../../state/cart';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import LoginButton from '../auth/LoginButton';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const itemCount = useCart((state) => state.getItemCount());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/categories', label: 'Categories', icon: Menu },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
  ];

  const isActive = (path: string) => currentPath === path;

  const handleAdminClick = () => {
    console.log('AppShell: Admin button clicked');
    console.log('AppShell: Current auth status:', isAuthenticated ? 'authenticated' : 'not authenticated');
    console.log('AppShell: Navigating to /admin');
    navigate({ to: '/admin' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/assets/generated/lunaluxe-logo-mark.dim_256x256.svg"
              alt="Neelamaa"
              className="h-8 w-8"
            />
            <span className="font-serif text-xl font-semibold tracking-tight">Neelamaa</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* User Login Button - visible on desktop */}
            <div className="hidden md:block">
              <LoginButton />
            </div>

            {/* Admin Login Button - visible on desktop */}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-2"
              onClick={handleAdminClick}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate({ to: '/cart' })}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="flex flex-col gap-4 mt-8">
                  {/* Mobile Login Buttons */}
                  <div className="flex flex-col gap-2 pb-4 border-b">
                    <LoginButton />
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 justify-center"
                      onClick={() => {
                        console.log('AppShell: Mobile admin button clicked');
                        setIsMenuOpen(false);
                        handleAdminClick();
                      }}
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </Button>
                  </div>

                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive(item.path)
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}

                  {isAuthenticated && (
                    <>
                      <Link
                        to="/orders"
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive('/orders')
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShoppingBag className="h-5 w-5" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/profile"
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive('/profile')
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif text-lg font-semibold mb-4">Neelamaa</h3>
              <p className="text-sm text-muted-foreground">
                Elegant jewelry and apparel for the modern woman
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                    Search
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/orders" className="text-muted-foreground hover:text-foreground transition-colors">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Neelamaa. Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
