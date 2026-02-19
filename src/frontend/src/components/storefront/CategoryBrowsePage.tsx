import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function CategoryBrowsePage() {
  const categories = [
    {
      id: 'clothing',
      name: "Women's Clothing",
      description: 'Elegant dresses, tops, and more',
      gradient: 'from-rose-100 to-rose-200',
      iconColor: 'text-rose-600',
    },
    {
      id: 'jewelry',
      name: 'Jewelry',
      description: 'Beautiful necklaces, earrings, and accessories',
      gradient: 'from-amber-100 to-amber-200',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="container px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold mb-2">Shop by Category</h1>
        <p className="text-muted-foreground">Explore our curated collections</p>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to="/products"
            search={{ category: category.id }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  <div
                    className={`w-20 h-20 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center flex-shrink-0`}
                  >
                    <Sparkles className={`h-10 w-10 ${category.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
