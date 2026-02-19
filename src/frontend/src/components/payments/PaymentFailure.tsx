import { useNavigate } from '@tanstack/react-router';
import { clearPendingOrderId } from '../../state/pendingPayment';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailure() {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate({ to: '/cart' });
  };

  const handleViewOrders = () => {
    clearPendingOrderId();
    navigate({ to: '/orders' });
  };

  return (
    <div className="container px-4 py-12 text-center">
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-6 space-y-4">
          <XCircle className="h-16 w-16 mx-auto text-destructive" />
          <h2 className="text-2xl font-semibold">Payment Cancelled</h2>
          <p className="text-muted-foreground">
            Your payment was not completed. You can try again or view your orders.
          </p>
          <div className="flex flex-col gap-3 mt-6">
            <Button onClick={handleRetry}>Try Again</Button>
            <Button variant="outline" onClick={handleViewOrders}>
              View My Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
