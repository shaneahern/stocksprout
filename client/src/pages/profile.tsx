import MobileLayout from "@/components/mobile-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, HelpCircle, Shield, LogOut, Edit3, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    bankAccountNumber: user?.bankAccountNumber || '',
    profileImageUrl: user?.profileImageUrl || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleEditSubmit = async () => {
    setIsLoading(true);
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettings = () => {
    alert("Settings functionality would be implemented here");
  };

  const handleHelp = () => {
    alert("Help functionality would be implemented here");
  };

  const handleSecurity = () => {
    alert("Security settings would be implemented here");
  };

  return (
    <MobileLayout currentTab="profile">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0"
                    variant="secondary"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="profileImageUrl">Image URL</Label>
                      <Input
                        id="profileImageUrl"
                        value={editData.profileImageUrl}
                        onChange={(e) => handleEditChange('profileImageUrl', e.target.value)}
                        placeholder="Enter image URL"
                      />
                    </div>
                    <Button onClick={handleEditSubmit} disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Picture'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <h2 className="text-2xl font-bold mb-2">{user?.name || 'User'}</h2>
            <p className="text-muted-foreground">Parent Account</p>
            <p className="text-sm text-muted-foreground">{user?.email || 'user@email.com'}</p>
            {user?.bankAccountNumber && (
              <p className="text-sm text-muted-foreground mt-1">
                Bank Account: {user.bankAccountNumber}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">2</p>
                <p className="text-sm text-muted-foreground">Children</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">$7,759</p>
                <p className="text-sm text-muted-foreground">Total Portfolio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Options */}
        <div className="space-y-2">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                data-testid="button-edit-profile"
              >
                <Edit3 className="w-5 h-5 mr-3" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={editData.name}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-bank">Bank Account Number</Label>
                  <Input
                    id="edit-bank"
                    value={editData.bankAccountNumber}
                    onChange={(e) => handleEditChange('bankAccountNumber', e.target.value)}
                    placeholder="Enter bank account number"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEditSubmit} disabled={isLoading} className="flex-1">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleSettings}
            data-testid="button-settings"
          >
            <Settings className="w-5 h-5 mr-3" />
            Account Settings
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleSecurity}
            data-testid="button-security"
          >
            <Shield className="w-5 h-5 mr-3" />
            Security & Privacy
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleHelp}
            data-testid="button-help"
          >
            <HelpCircle className="w-5 h-5 mr-3" />
            Help & Support
          </Button>
        </div>

        {/* App Info */}
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="font-bold text-lg mb-2">StockSprout</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Growing their future, one gift at a time
            </p>
            <p className="text-xs text-muted-foreground">Version 1.0.0</p>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </MobileLayout>
  );
}
