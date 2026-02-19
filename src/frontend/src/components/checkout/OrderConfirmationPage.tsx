import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatDate } from '../../utils/format';

export default function OrderConfirmationPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrder(orderId);

  if (isLoading) {
    return (
      <div className="container px-4 py-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find this order.</p>
        <Button onClick={() => navigate({ to: '/orders' })}>View My Orders</Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 mx-auto text-primary" />
          <div>
            <h1 className="text-2xl font-serif font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">Thank you for your purchase</p>
          </div>
          <div className="bg-background rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Order ID</p>
            <p className="font-mono font-semibold">{order.id}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{formatDate(order.placedTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button size="lg" className="w-full" onClick={() => navigate({ to: '/orders/$orderId', params: { orderId } })}>
          View Order Details
        </Button>
        <Button size="lg" variant="outline" className="w-full" onClick={() => navigate({ to: '/products' })}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
