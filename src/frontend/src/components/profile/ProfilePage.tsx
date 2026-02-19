import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useCurrentUserProfile';
import { useSaveUserProfile } from '../../hooks/useSaveUserProfile';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { parsePhoneNumber, formatPhoneNumber, validatePhoneNumber } from '../../utils/phone';

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { identity, clear, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveUserProfile();

  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      const parsed = parsePhoneNumber(userProfile.phoneNumber);
      if (parsed) {
        setCountryCode(parsed.countryCode);
        setPhoneNumber(parsed.nationalNumber);
      }
      setAddress(userProfile.address || '');
    }
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
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
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    toast.success('Logged out successfully');
    navigate({ to: '/' });
  };

  if (!isAuthenticated) {
    return (
      <div className="container px-4 py-12 text-center">
        <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="text-2xl font-semibold mb-2">Please Log In</h2>
        <p className="text-muted-foreground">You need to be logged in to view your profile</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container px-4 py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 space-y-6">
      <h1 className="text-2xl font-serif font-bold">My Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Shipping Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your shipping address"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saveProfile.isPending}>
                  {saveProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={saveProfile.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{userProfile?.name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{userProfile?.phoneNumber || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{userProfile?.address || 'Not set'}</p>
              </div>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
            disabled={loginStatus === 'logging-in'}
          >
            {loginStatus === 'logging-in' ? 'Logging out...' : 'Log Out'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
