import { Link } from '@tanstack/react-router';
import AdminGuard from './AdminGuard';
import { Card, CardContent } from '@/components/ui/card';
import { Package, ShoppingBag, CreditCard } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <div className="container px-4 py-6 space-y-6">
        <h1 className="text-2xl font-serif font-bold">Admin Dashboard</h1>

        <div className="grid gap-4">
          <Link to="/admin/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Manage Orders</h3>
                    <p className="text-sm text-muted-foreground">View and manage all orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Manage Products</h3>
                    <p className="text-sm text-muted-foreground">Add and edit products</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Payment Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure Stripe (Coming soon)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}
