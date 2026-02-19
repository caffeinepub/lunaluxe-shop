import { useParams, useNavigate } from '@tanstack/react-router';
import AdminGuard from './AdminGuard';
import { useGetOrder } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatDate, formatOrderStatus } from '../../utils/format';

export default function AdminOrderDetailPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrder(orderId);

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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/admin/orders' })}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {isLoading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </>
        ) : order ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">Order Details</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(order.placedTime)}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(order.status)}>
                    {formatOrderStatus(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                  <p className="font-mono text-sm">{order.id}</p>
                </div>
                {order.paymentIntentId && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Payment ID</p>
                    <p className="font-mono text-sm">{order.paymentIntentId}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.customer.phoneNumber}</p>
                </div>
                {order.customer.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{order.customer.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.products.map((product, index) => (
                  <div key={index}>
                    <div className="flex gap-4">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0].getDirectURL()}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                        <p className="text-primary font-semibold mt-1">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>
                    {index < order.products.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
