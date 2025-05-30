import { Box, Paper, Typography, Grid } from '@mui/material';
import {
  ShoppingCart as SalesIcon,
  Inventory as ProductsIcon,
  People as CustomersIcon,
  Category as CategoriesIcon,
  LocalShipping as PurchasesIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useState, useEffect, useMemo } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      height: 160,
      justifyContent: 'space-between',
      elevation: 6,
      borderRadius: '12px',
      backgroundColor: '#e3f2fd',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-5px)',
        elevation: 10,
      },
    }}
  >
    <Box sx={{ flexGrow: 1 }}>
      <Typography color="text.secondary" gutterBottom variant="subtitle2">
        {title}
      </Typography>
      <Typography component="p" variant="h5" sx={{ fontWeight: 'bold' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Typography>
    </Box>
    <Box sx={{ alignSelf: 'flex-end', color: 'primary.main' }}>
      {icon}
    </Box>
  </Paper>
);

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const savedSales = localStorage.getItem('sales');
    const savedPurchases = localStorage.getItem('purchases');
    const savedProducts = localStorage.getItem('products');
    const savedCustomers = localStorage.getItem('customers');

    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedPurchases) setPurchases(JSON.parse(savedPurchases));
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
  }, []);

  // Calculate statistics
  const totalProducts = products.length;
  const totalSalesAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalPurchasesAmount = purchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const totalCustomers = customers.length;

  // Prepare data for chart (by month)
  const chartData = useMemo(() => {
    // Only process data if sales or purchases arrays are not empty
    if (sales.length === 0 && purchases.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const salesByMonth: { [key: string]: number } = {};
    const purchasesByMonth: { [key: string]: number } = {};

    sales.forEach(sale => {
      const month = new Date(sale.date).toLocaleString('default', { month: 'short' });
      salesByMonth[month] = (salesByMonth[month] || 0) + sale.total;
    });

    purchases.forEach(purchase => {
      const month = new Date(purchase.date).toLocaleString('default', { month: 'short' });
      purchasesByMonth[month] = (purchasesByMonth[month] || 0) + purchase.total;
    });

    const months = Object.keys({ ...salesByMonth, ...purchasesByMonth }).sort((a, b) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames.indexOf(a) - monthNames.indexOf(b);
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Sales',
          data: months.map(month => salesByMonth[month] || 0),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
        {
          label: 'Purchases',
          data: months.map(month => purchasesByMonth[month] || 0),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1,
        },
      ],
    };
  }, [sales, purchases]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Products"
            value={totalProducts}
            icon={<ProductsIcon sx={{ fontSize: 48 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sales Amount"
            value={`$${totalSalesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<SalesIcon sx={{ fontSize: 48 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Purchases Amount"
            value={`$${totalPurchasesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<PurchasesIcon sx={{ fontSize: 48 }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={totalCustomers}
            icon={<CustomersIcon sx={{ fontSize: 48 }} />}
          />
        </Grid>
      </Grid>

      {/* Sales and Purchases Chart */}
      <Box sx={{ width: '100%', mt: 4 }}>
        <Paper sx={{ p: 3, width: '100%', elevation: 6, borderRadius: '12px', backgroundColor: '#e3f2fd' }}>
          <Typography variant="h6" gutterBottom>
            Sales and Purchases Overview (by Month)
          </Typography>
          <Box sx={{ height: 400 }}>
            <Line data={chartData} options={{ maintainAspectRatio: false }} />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}