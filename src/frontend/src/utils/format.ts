export function formatPrice(priceInCents: number | bigint): string {
  const price = typeof priceInCents === 'bigint' ? Number(priceInCents) : priceInCents;
  return `$${(price / 100).toFixed(2)}`;
}

export function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatOrderStatus(status: string): string {
  switch (status) {
    case 'pendingPayment':
      return 'Pending Payment';
    case 'paid':
      return 'Paid';
    case 'shipped':
      return 'Shipped';
    default:
      return status;
  }
}
