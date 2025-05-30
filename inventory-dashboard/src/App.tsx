import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { useMemo, useState } from 'react';

// Helper function to get settings from localStorage
const getAppSettings = () => {
  const savedSettings = localStorage.getItem('appSettings');
  // Provide default appearance settings if none are saved or appearance is missing
  const defaultAppearance = { darkMode: false, compactMode: false, fontSize: 'medium' };
  const settings = savedSettings ? JSON.parse(savedSettings) : {};
  return { ...settings, appearance: { ...defaultAppearance, ...settings.appearance } };
};

function App() {
  const appSettings = getAppSettings();
  const [darkMode, setDarkMode] = useState(appSettings.appearance.darkMode);
  const [compactMode, setCompactMode] = useState(appSettings.appearance.compactMode);
  const [fontSize, setFontSize] = useState(appSettings.appearance.fontSize);

  // Use useMemo to create theme based on appearance settings state
  const theme = useMemo(() => {
    const baseFontSize = 14; // Base font size for 'medium'
    let currentFontSize = baseFontSize;
    if (fontSize === 'small') {
      currentFontSize = baseFontSize * 0.9; // Reduce font size for 'small'
    } else if (fontSize === 'large') {
      currentFontSize = baseFontSize * 1.1; // Increase font size for 'large'
    }

    const spacingUnit = compactMode ? 6 : 8; // Reduce spacing unit for compact mode (default is 8px)

    return createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: {
          main: '#2196f3',
        },
        secondary: {
          main: '#f50057',
        },
      },
      typography: {
        fontSize: currentFontSize,
        // You might want to adjust other typography variants as well
        // h1, h2, etc. based on the currentFontSize
      },
      spacing: (factor: number) => `${spacingUnit * factor}px`, // Custom spacing
      components: {
        // Example: Adjust padding in compact mode for MuiTableCell
        MuiTableCell: {
          styleOverrides: {
            root: {
              padding: compactMode ? '6px 16px' : '16px', // Reduced padding for compact mode
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              padding: compactMode ? '4px 12px' : '6px 16px', // Reduced padding for buttons
            },
          },
        },
        // You can add more component overrides for a more comprehensive compact mode
      },
    });
  }, [darkMode, compactMode, fontSize]);

  // Although the Settings page saves to localStorage, React won't re-render App
  // automatically when localStorage changes. For this simple app, a page reload
  // after saving settings will apply the theme change.
  // A more advanced solution would involve a React Context and/or listening
  // to 'storage' events, which is beyond the current scope.

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
