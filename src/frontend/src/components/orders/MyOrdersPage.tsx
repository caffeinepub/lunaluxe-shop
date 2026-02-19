import { Link } from '@tanstack/react-router';
import { useGetMyOrders } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatDate, formatOrderStatus } from '../../utils/format';

export default function MyOrdersPage() {
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading } = useGetMyOrders();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="container px-4 py-12 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-2xl font-semibold mb-2">Please Log In</h2>
        <p className="text-muted-foreground">You need to be logged in to view your orders</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container px-4 py-12 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
        <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
        <Link to="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

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
    <div className="container px-4 py-6 space-y-6">
      <h1 className="text-2xl font-serif font-bold">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} to="/orders/$orderId" params={{ orderId: order.id }}>
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.placedTime)}
                    </p>
                    <p className="font-semibold text-primary mt-1">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
