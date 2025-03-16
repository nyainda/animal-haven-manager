import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

interface SettingsPanelProps {
  emailNotifications: boolean;
  setEmailNotifications: (value: boolean) => void;
  mobileNotifications: boolean;
  setMobileNotifications: (value: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  emailNotifications,
  setEmailNotifications,
  mobileNotifications,
  setMobileNotifications,
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium text-lg">Notifications</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Mobile Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
              <Switch checked={mobileNotifications} onCheckedChange={setMobileNotifications} />
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium text-lg">Appearance</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle dark theme</p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </div>
        </div>
        <Button onClick={() => toast.success('Settings saved')}>Save Settings</Button>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;