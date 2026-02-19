import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import AdminGuard from './AdminGuard';
import ProductEditor from './ProductEditor';
import { useProducts } from '../../hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingBag, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '../../utils/format';

export default function AdminProductsPage() {
  const { data: products, isLoading } = useProducts();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="container px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold">Manage Products</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              <ProductEditor onSuccess={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0].getDirectURL()}
                      alt={product.name}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-square w-full bg-muted flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
                    <p className="text-primary font-semibold">{formatPrice(product.price)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No products yet</p>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
