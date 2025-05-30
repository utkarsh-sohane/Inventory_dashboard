import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';

interface NotificationSettings {
  emailNotifications: boolean;
  lowStockAlerts: boolean;
  salesReports: boolean;
  purchaseReports: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: string;
  passwordExpiry: string;
}

interface BusinessSettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
}

interface AppearanceSettings {
  darkMode: boolean;
  compactMode: boolean;
  fontSize: string;
}

interface AppSettings {
  notifications: NotificationSettings;
  security: SecuritySettings;
  business: BusinessSettings;
  appearance: AppearanceSettings;
}

const initialSettings: AppSettings = {
  notifications: {
    emailNotifications: true,
    lowStockAlerts: true,
    salesReports: true,
    purchaseReports: true,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
  },
  business: {
    companyName: 'My Company',
    address: '123 Business St, City, Country',
    phone: '+1 234-567-8900',
    email: 'contact@mycompany.com',
    currency: 'USD',
    timezone: 'UTC',
  },
  appearance: {
    darkMode: false,
    compactMode: false,
    fontSize: 'medium',
  },
};

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (category: keyof AppSettings, setting: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleSave = () => {
    try {
      // Save settings to localStorage
      localStorage.setItem('appSettings', JSON.stringify(settings));
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save settings.', // Generic error message
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const SettingCard = ({ title, icon: Icon, children }: any) => (
    <Card>
      <CardHeader
        avatar={<Icon color="primary" />}
        title={title}
      />
      <Divider />
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Button
          variant="contained"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <SettingCard title="Notifications" icon={NotificationsIcon}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.lowStockAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'lowStockAlerts', e.target.checked)}
                    />
                  }
                  label="Low Stock Alerts"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.salesReports}
                      onChange={(e) => handleSettingChange('notifications', 'salesReports', e.target.checked)}
                    />
                  }
                  label="Sales Reports"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.purchaseReports}
                      onChange={(e) => handleSettingChange('notifications', 'purchaseReports', e.target.checked)}
                    />
                  }
                  label="Purchase Reports"
                />
              </Grid>
            </Grid>
          </SettingCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <SettingCard title="Security" icon={SecurityIcon}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                    />
                  }
                  label="Two-Factor Authentication"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Session Timeout (minutes)</InputLabel>
                  <Select
                    value={settings.security.sessionTimeout}
                    label="Session Timeout (minutes)"
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                  >
                    <MenuItem value="15">15 minutes</MenuItem>
                    <MenuItem value="30">30 minutes</MenuItem>
                    <MenuItem value="60">1 hour</MenuItem>
                    <MenuItem value="120">2 hours</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Password Expiry (days)</InputLabel>
                  <Select
                    value={settings.security.passwordExpiry}
                    label="Password Expiry (days)"
                    onChange={(e) => handleSettingChange('security', 'passwordExpiry', e.target.value)}
                  >
                    <MenuItem value="30">30 days</MenuItem>
                    <MenuItem value="60">60 days</MenuItem>
                    <MenuItem value="90">90 days</MenuItem>
                    <MenuItem value="180">180 days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </SettingCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <SettingCard title="Business Information" icon={BusinessIcon}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={settings.business.companyName}
                  onChange={(e) => handleSettingChange('business', 'companyName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={settings.business.address}
                  onChange={(e) => handleSettingChange('business', 'address', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={settings.business.phone}
                  onChange={(e) => handleSettingChange('business', 'phone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={settings.business.email}
                  onChange={(e) => handleSettingChange('business', 'email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={settings.business.currency}
                    label="Currency"
                    onChange={(e) => handleSettingChange('business', 'currency', e.target.value)}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.business.timezone}
                    label="Timezone"
                    onChange={(e) => handleSettingChange('business', 'timezone', e.target.value)}
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="GMT">GMT</MenuItem>
                    {/* Add more timezones as needed */}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </SettingCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <SettingCard title="Appearance" icon={PaletteIcon}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.appearance.darkMode}
                      onChange={(e) => handleSettingChange('appearance', 'darkMode', e.target.checked)}
                    />
                  }
                  label="Dark Mode"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.appearance.compactMode}
                      onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
                    />
                  }
                  label="Compact Mode"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Font Size</InputLabel>
                  <Select
                    value={settings.appearance.fontSize}
                    label="Font Size"
                    onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </SettingCard>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 