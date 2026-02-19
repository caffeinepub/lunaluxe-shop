import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../../state/cart';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import { useCreateOrder } from '../../hooks/useQueries';
import { useCreateCheckoutSession } from '../../hooks/useCreateCheckoutSession';
import { setPendingOrderId } from '../../state/pendingPayment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { toast } from 'sonner';
import type { ShoppingItem } from '../../backend';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const { data: userProfile } = useGetCallerUserProfile();
  const createOrder = useCreateOrder();
  const createCheckoutSession = useCreateCheckoutSession();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!userProfile) {
      toast.error('Please complete your profile first');
      navigate({ to: '/profile' });
      return;
    }

    setIsProcessing(true);

    try {
      const productIds = items.map((item) => item.product.id);
      const orderId = await createOrder.mutateAsync(productIds);

      setPendingOrderId(orderId);

      const shoppingItems: ShoppingItem[] = items.map((item) => ({
        productName: item.product.name,
        productDescription: item.product.description,
        priceInCents: BigInt(Number(item.product.price)),
        quantity: BigInt(item.quantity),
        currency: 'usd',
      }));

      const session = await createCheckoutSession.mutateAsync(shoppingItems);

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      clearCart();
      window.location.href = session.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to process checkout');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some items to checkout</p>
        <Button onClick={() => navigate({ to: '/products' })}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 space-y-6">
      <h1 className="text-2xl font-serif font-bold">Checkout</h1>

      {/* Shipping Info */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {userProfile ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{userProfile.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{userProfile.phoneNumber}</p>
              </div>
              {userProfile.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{userProfile.address}</p>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: '/profile' })}
                className="mt-2"
              >
                Edit Profile
              </Button>
            </>
          ) : (
            <div>
              <p className="text-muted-foreground mb-4">Please complete your profile to continue</p>
              <Button onClick={() => navigate({ to: '/profile' })}>Complete Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between">
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold">
                {formatPrice(Number(item.product.price) * item.quantity)}
              </p>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-primary">{formatPrice(getTotal())}</span>
          </div>
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="w-full"
        onClick={handlePlaceOrder}
        disabled={isProcessing || !userProfile}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          'Proceed to Payment'
        )}
      </Button>
    </div>
  );
}
