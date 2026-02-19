import { Link } from '@tanstack/react-router';
import AdminGuard from './AdminGuard';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatDate, formatOrderStatus } from '../../utils/format';

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useAdminOrders();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'shipped':
        return 'default';
      case 'paid':
        return 'secondary';
      case 'pendingPayment':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <AdminGuard>
      <div className="container px-4 py-6 space-y-6">
        <h1 className="text-2xl font-serif font-bold">All Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} to="/admin/orders/$orderId" params={{ orderId: order.id }}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <p className="font-mono text-sm font-medium">{order.id.slice(0, 16)}...</p>
                      </div>
                      <Badge variant={getStatusVariant(order.status)}>
                        {formatOrderStatus(order.status)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Customer</span>
                        <span className="font-medium">{order.customer.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span>{formatDate(order.placedTime)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">
                          {formatPrice(order.total)}
                        </span>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No orders yet</p>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
