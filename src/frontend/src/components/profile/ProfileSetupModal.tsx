import { useState } from 'react';
import { useSaveUserProfile } from '../../hooks/useSaveUserProfile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatPhoneNumber, validatePhoneNumber } from '../../utils/phone';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const saveProfile = useSaveUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const phone = { countryCode, nationalNumber: phoneNumber };
    if (!validatePhoneNumber(phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        phoneNumber: formatPhoneNumber(phone),
        address: address.trim() || undefined,
      });
      toast.success('Profile created successfully');
    } catch (error: any) {
      console.error('Profile setup error:', error);
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please provide your information to continue shopping
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number *</Label>
            <div className="flex gap-2">
              <Input
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.replace(/\D/g, ''))}
                placeholder="1"
                className="w-20"
                maxLength={3}
                required
              />
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Phone number"
                className="flex-1"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter country code and phone number (e.g., 1 for US)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Shipping Address (Optional)</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your shipping address"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
