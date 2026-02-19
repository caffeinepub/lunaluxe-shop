const PENDING_ORDER_KEY = 'lunaluxe-pending-order';

export function setPendingOrderId(orderId: string): void {
  try {
    sessionStorage.setItem(PENDING_ORDER_KEY, orderId);
  } catch (error) {
    console.warn('Failed to store pending order:', error);
  }
}

export function getPendingOrderId(): string | null {
  try {
    return sessionStorage.getItem(PENDING_ORDER_KEY);
  } catch (error) {
    console.warn('Failed to retrieve pending order:', error);
    return null;
  }
}

export function clearPendingOrderId(): void {
  try {
    sessionStorage.removeItem(PENDING_ORDER_KEY);
  } catch (error) {
    console.warn('Failed to clear pending order:', error);
  }
}
