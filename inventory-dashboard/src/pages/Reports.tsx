import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Interfaces (should match your data structures)
interface SaleItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

interface Sale {
  id: number;
  invoiceNo: string;
  customer: string;
  date: string;
  total: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
  items: SaleItem[];
}

interface PurchaseItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

interface Purchase {
  id: number;
  poNumber: string;
  supplier: string;
  date: string;
  total: number;
  status: 'Completed' | 'Pending' | 'Cancelled'
  items: PurchaseItem[];
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'Inactive';
  lastOrderDate?: string;
}

interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'Inactive';
  lastOrderDate?: string;
  paymentTerms: string;
}

export default function Reports() {
  const [timeRange, setTimeRange] = useState('month');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Load data from localStorage
  useEffect(() => {
    setLoading(true);
    const savedSales = localStorage.getItem('sales');
    const savedPurchases = localStorage.getItem('purchases');
    const savedProducts = localStorage.getItem('products');
    const savedCustomers = localStorage.getItem('customers');
    const savedSuppliers = localStorage.getItem('suppliers');

    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedPurchases) setPurchases(JSON.parse(savedPurchases));
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));

    setLoading(false);
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        break;
    }

    const filteredSales = sales.filter(sale => new Date(sale.date) >= startDate);
    const filteredPurchases = purchases.filter(purchase => new Date(purchase.date) >= startDate);
    // For customers and suppliers, we'll consider those active or added within the period,
    // or with activity (orders) within the period. For simplicity here, we'll just count them.
    // A more complex report might track new customers/suppliers in the period.
    const activeCustomers = customers.filter(customer => customer.status === 'Active'); // Simplified for now
    const activeSuppliers = suppliers.filter(supplier => supplier.status === 'Active'); // Simplified for now

    return {
      sales: filteredSales,
      purchases: filteredPurchases,
      customers: activeCustomers, // Using active count as a proxy
      suppliers: activeSuppliers, // Using active count as a proxy
    };
  }, [sales, purchases, customers, suppliers, timeRange]);

  // Calculate statistics
  const calculatedStats = useMemo(() => {
    const totalSalesAmount = filteredData.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalPurchasesAmount = filteredData.purchases.reduce((sum, purchase) => sum + purchase.total, 0);
    const totalCustomersCount = filteredData.customers.length;
    const totalProductsCount = products.length;

    // Basic trend calculation (comparing current period to previous same-length period)
    const now = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date(now);

    switch (timeRange) {
      case 'week':
        prevEndDate.setDate(now.getDate() - 7);
        prevStartDate.setDate(now.getDate() - 14);
        break;
      case 'month':
        prevEndDate.setMonth(now.getMonth() - 1);
        prevStartDate.setMonth(now.getMonth() - 2);
        break;
      case 'quarter':
        prevEndDate.setMonth(now.getMonth() - 3);
        prevStartDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        prevEndDate.setFullYear(now.getFullYear() - 1);
        prevStartDate.setFullYear(now.getFullYear() - 2);
        break;
      default:
        prevEndDate = new Date(now); // No previous period for 'all time' (default)
        prevStartDate = new Date(now); // No previous period for 'all time' (default)
        break;
    }

    const prevFilteredSales = sales.filter(sale => new Date(sale.date) >= prevStartDate && new Date(sale.date) < prevEndDate);
    const prevFilteredPurchases = purchases.filter(purchase => new Date(purchase.date) >= prevStartDate && new Date(purchase.date) < prevEndDate);

    const prevTotalSalesAmount = prevFilteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const prevTotalPurchasesAmount = prevFilteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const salesChange = calculateChange(totalSalesAmount, prevTotalSalesAmount);
    const purchasesChange = calculateChange(totalPurchasesAmount, prevTotalPurchasesAmount);
    // Trend for customer and product count is simpler, just show current state
    const customersChange = calculateChange(totalCustomersCount, customers.length); // Compare to total for a basic idea
    const productsChange = calculateChange(totalProductsCount, products.length); // Compare to total for a basic idea

    return {
      totalSales: {
        value: totalSalesAmount,
        change: salesChange,
        trend: salesChange >= 0 ? 'up' : 'down',
      },
      totalPurchases: {
        value: totalPurchasesAmount,
        change: purchasesChange,
        trend: purchasesChange >= 0 ? 'up' : 'down',
      },
      totalCustomers: {
        value: totalCustomersCount,
        change: customersChange,
        trend: customersChange >= 0 ? 'up' : 'down',
      },
      totalProducts: {
        value: totalProductsCount,
        change: productsChange,
        trend: productsChange >= 0 ? 'up' : 'down',
      },
    };
  }, [filteredData, sales, purchases, customers, products, timeRange]);

  // Calculate top selling products for the period
  const topSellingProducts = useMemo(() => {
    const productSalesMap = new Map<number, { name: string, sales: number, revenue: number }>();

    filteredData.sales.forEach(sale => {
      sale.items.forEach(item => {
        const current = productSalesMap.get(item.productId) || { name: item.name, sales: 0, revenue: 0 };
        current.sales += item.quantity;
        current.revenue += item.quantity * item.price;
        productSalesMap.set(item.productId, current);
      });
    });

    return Array.from(productSalesMap.values()).sort((a, b) => b.sales - a.sales).slice(0, 5);
  }, [filteredData]);

  // Get recent sales for the period
  const recentSales = useMemo(() => {
    return filteredData.sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [filteredData]);


  const handleExport = (format: string) => {
    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text('Sales Report', 14, 16);
      (doc as any).autoTable({
        startY: 20,
        head: [['Invoice No', 'Customer', 'Date', 'Items', 'Total', 'Status']],
        body: filteredData.sales.map(sale => [
          sale.invoiceNo,
          sale.customer,
          sale.date,
          sale.items.length,
          `$${sale.total.toFixed(2)}`,
          sale.status,
        ]),
      });
      doc.save('sales_report.pdf');
    } else if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(filteredData.sales.map(sale => ({
        'Invoice No': sale.invoiceNo,
        'Customer': sale.customer,
        'Date': sale.date,
        'Items': sale.items.length,
        'Total': sale.total,
        'Status': sale.status,
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');
      XLSX.writeFile(workbook, 'sales_report.xlsx');
    } else if (format === 'csv') {
      const csvContent = [
        ['Invoice No', 'Customer', 'Date', 'Items', 'Total', 'Status'].join(','),
        ...filteredData.sales.map(sale => [
          sale.invoiceNo,
          sale.customer,
          sale.date,
          sale.items.length,
          sale.total.toFixed(2),
          sale.status,
        ].join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'sales_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    handleMenuClose();
  };

  const StatCard = ({ title, value, change, trend, icon: Icon }: any) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {title.includes('Total Spent') ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value.toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {trend === 'up' ? (
                <TrendingUpIcon color="success" fontSize="small" />
              ) : (
                <TrendingDownIcon color="error" fontSize="small" />
              )}
              <Typography
                variant="body2"
                color={trend === 'up' ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5 }}
              >
                {change.toFixed(1)}%
              </Typography>
            </Box>
          </Box>
          <Icon sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Reports
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={handleMenuClick}
          >
            Export Sales
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
            <MenuItem onClick={() => handleExport('excel')}>Export as Excel</MenuItem>
            <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sales"
            value={calculatedStats.totalSales.value}
            change={calculatedStats.totalSales.change}
            trend={calculatedStats.totalSales.trend}
            icon={MoneyIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Purchases"
            value={calculatedStats.totalPurchases.value}
            change={calculatedStats.totalPurchases.change}
            trend={calculatedStats.totalPurchases.trend}
            icon={CartIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={calculatedStats.totalCustomers.value}
            change={calculatedStats.totalCustomers.change}
            trend={calculatedStats.totalCustomers.trend}
            icon={PeopleIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={calculatedStats.totalProducts.value}
            change={calculatedStats.totalProducts.change}
            trend={calculatedStats.totalProducts.trend}
            icon={InventoryIcon}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={`Top 5 Selling Products (${timeRange === 'all' ? 'All Time' : timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})`}
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardContent>
              {topSellingProducts.length > 0 ? (
                topSellingProducts.map((product, index) => (
                  <Box
                    key={product.name + index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: index < topSellingProducts.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography>{product.name}</Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="textSecondary">
                        {product.sales} units
                      </Typography>
                      <Typography variant="body2">
                        ${product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography>No product data for this period.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={`Recent Sales (${timeRange === 'all' ? 'All Time' : timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})`}
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardContent>
              {recentSales.length > 0 ? (
                recentSales.map((sale, index) => (
                  <Box
                    key={sale.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: index < recentSales.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography>{`Invoice: ${sale.invoiceNo}`}</Typography>
                      <Typography variant="body2" color="textSecondary">{`Customer: ${sale.customer}`}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color={sale.status === 'Completed' ? 'success.main' : sale.status === 'Pending' ? 'warning.main' : 'error.main'}>
                        {sale.status}
                      </Typography>
                      <Typography>${sale.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography>No sales data for this period.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Placeholder for other report sections */}

      </Grid>
    </Box>
  );
} 