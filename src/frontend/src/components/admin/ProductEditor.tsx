import { useState } from 'react';
import { useCreateProduct } from '../../hooks/useAdminProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../../backend';

interface ProductEditorProps {
  onSuccess?: () => void;
}

export default function ProductEditor({ onSuccess }: ProductEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<ExternalBlob[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const createProduct = useCreateProduct();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ExternalBlob[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress((prev) => ({ ...prev, [images.length + i]: percentage }));
      });
      newImages.push(blob);
    }

    setImages([...images, ...newImages]);
    toast.success(`${newImages.length} image(s) added`);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (!category) {
      toast.error('Please select a category');
      return;
    }

    try {
      const priceInCents = BigInt(Math.round(priceNum * 100));
      const fullDescription = `${description} [Category: ${category}]`;
      
      await createProduct.mutateAsync({
        name: name.trim(),
        description: fullDescription,
        price: priceInCents,
        images,
      });

      toast.success('Product created successfully');
      setName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setImages([]);
      onSuccess?.();
    } catch (error: any) {
      console.error('Product creation error:', error);
      toast.error(error.message || 'Failed to create product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter product name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter product description"
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (USD) *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select value={category} onValueChange={setCategory} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clothing">Women's Clothing</SelectItem>
            <SelectItem value="jewelry">Jewelry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Product Images</Label>
        <div className="grid grid-cols-3 gap-2">
          {images.map((image, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-0">
                <img
                  src={image.getDirectURL()}
                  alt={`Product ${index + 1}`}
                  className="aspect-square w-full object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <span className="text-white text-sm">{uploadProgress[index]}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Upload</span>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={createProduct.isPending}>
        {createProduct.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Create Product'
        )}
      </Button>
    </form>
  );
}
