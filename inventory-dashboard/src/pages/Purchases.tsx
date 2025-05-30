import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Grid,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  Add as AddItemIcon,
  Remove as RemoveItemIcon,
} from '@mui/icons-material';

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
  status: 'Received' | 'Pending' | 'Cancelled';
  items: PurchaseItem[];
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
}

const initialPurchase: Purchase = {
  id: 0,
  poNumber: '',
  supplier: '',
  date: new Date().toISOString().split('T')[0],
  total: 0,
  status: 'Pending',
  items: [],
};

export default function Purchases() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [currentPurchase, setCurrentPurchase] = useState<Purchase>(initialPurchase);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Load purchases, products, and suppliers from localStorage
  useEffect(() => {
    const savedPurchases = localStorage.getItem('purchases');
    const savedProducts = localStorage.getItem('products');
    const savedSuppliers = localStorage.getItem('suppliers');
    
    if (savedPurchases) {
      setPurchases(JSON.parse(savedPurchases));
    } else {
      // Initialize with mock data if no purchases exist
      const mockPurchases: Purchase[] = [
        { 
          id: 1, 
          poNumber: 'PO001', 
          supplier: 'Tech Supplies Inc.', 
          date: '2024-03-15', 
          total: 2499.99, 
          status: 'Received',
          items: [
            { productId: 1, name: 'Laptop', quantity: 2, price: 999.99 },
            { productId: 3, name: 'Headphones', quantity: 5, price: 99.99 }
          ]
        },
        { 
          id: 2, 
          poNumber: 'PO002', 
          supplier: 'Office Depot', 
          date: '2024-03-14', 
          total: 799.99, 
          status: 'Pending',
          items: [
            { productId: 2, name: 'Smartphone', quantity: 1, price: 699.99 },
            { productId: 5, name: 'Keyboard', quantity: 2, price: 49.99 }
          ]
        },
        { 
          id: 3, 
          poNumber: 'PO003', 
          supplier: 'Global Electronics', 
          date: '2024-03-13', 
          total: 1499.99, 
          status: 'Cancelled',
          items: [
            { productId: 4, name: 'Monitor', quantity: 3, price: 299.99 },
            { productId: 5, name: 'Keyboard', quantity: 4, price: 49.99 }
          ]
        }
      ];
      setPurchases(mockPurchases);
      localStorage.setItem('purchases', JSON.stringify(mockPurchases));
    }

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }

    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    } else {
      // Initialize with mock suppliers if none exist
      const mockSuppliers: Supplier[] = [
        { id: 1, name: 'Tech Supplies Inc.', email: 'contact@techsupplies.com', phone: '555-0101' },
        { id: 2, name: 'Office Depot', email: 'orders@officedepot.com', phone: '555-0102' },
        { id: 3, name: 'Global Electronics', email: 'sales@globalelectronics.com', phone: '555-0103' },
        { id: 4, name: 'Supply Chain Co.', email: 'info@supplychain.com', phone: '555-0104' },
        { id: 5, name: 'Tech Wholesale', email: 'orders@techwholesale.com', phone: '555-0105' },
      ];
      setSuppliers(mockSuppliers);
      localStorage.setItem('suppliers', JSON.stringify(mockSuppliers));
    }
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleOpenDialog = () => {
    const newPONumber = `PO${String(purchases.length + 1).padStart(3, '0')}`;
    setCurrentPurchase({
      ...initialPurchase,
      poNumber: newPONumber,
      date: new Date().toISOString().split('T')[0],
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentPurchase(initialPurchase);
    setSelectedProduct(null);
    setSelectedSupplier(null);
    setQuantity(1);
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;

    const existingItem = currentPurchase.items.find(item => item.productId === selectedProduct.id);
    let updatedItems: PurchaseItem[];

    if (existingItem) {
      updatedItems = currentPurchase.items.map(item =>
        item.productId === selectedProduct.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedItems = [
        ...currentPurchase.items,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          quantity,
          price: selectedProduct.price,
        },
      ];
    }

    const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCurrentPurchase(prev => ({
      ...prev,
      items: updatedItems,
      total,
    }));

    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleRemoveItem = (productId: number) => {
    const updatedItems = currentPurchase.items.filter(item => item.productId !== productId);
    const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCurrentPurchase(prev => ({
      ...prev,
      items: updatedItems,
      total,
    }));
  };

  const handleSavePurchase = () => {
    if (!currentPurchase.supplier || currentPurchase.items.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please add supplier and at least one item',
        severity: 'error'
      });
      return;
    }

    const newPurchase = {
      ...currentPurchase,
      id: Math.max(...purchases.map(p => p.id)) + 1,
    };

    const updatedPurchases = [...purchases, newPurchase];
    setPurchases(updatedPurchases);
    localStorage.setItem('purchases', JSON.stringify(updatedPurchases));
    handleCloseDialog();
    setSnackbar({
      open: true,
      message: 'Purchase order created successfully',
      severity: 'success'
    });
  };

  const handleViewPurchase = (purchase: Purchase) => {
    setCurrentPurchase(purchase);
    setViewDialog(true);
  };

  const handlePrintPO = (purchase: Purchase) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Purchase Order ${purchase.poNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .details { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .total { text-align: right; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Purchase Order ${purchase.poNumber}</h1>
            </div>
            <div class="details">
              <p><strong>Supplier:</strong> ${purchase.supplier}</p>
              <p><strong>Date:</strong> ${purchase.date}</p>
              <p><strong>Status:</strong> ${purchase.status}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${purchase.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">
              <h3>Total: $${purchase.total.toFixed(2)}</h3>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const filteredPurchases = purchases.filter((purchase) =>
    purchase.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    purchase.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Purchases
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New Purchase
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search purchases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>PO Number</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPurchases
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{purchase.poNumber}</TableCell>
                    <TableCell>{purchase.supplier}</TableCell>
                    <TableCell>{purchase.date}</TableCell>
                    <TableCell align="right">{purchase.items.length}</TableCell>
                    <TableCell align="right">${purchase.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={purchase.status} 
                        color={getStatusColor(purchase.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewPurchase(purchase)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handlePrintPO(purchase)}
                      >
                        <ReceiptIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPurchases.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* New Purchase Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>New Purchase Order</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PO Number"
                  value={currentPurchase.poNumber}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={currentPurchase.date}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={suppliers}
                  getOptionLabel={(option) => option.name}
                  value={suppliers.find(s => s.name === currentPurchase.supplier) || null}
                  onChange={(_, newValue) => {
                    setSelectedSupplier(newValue);
                    setCurrentPurchase(prev => ({
                      ...prev,
                      supplier: newValue?.name || '',
                    }));
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Supplier" required />
                  )}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Add Items</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <Autocomplete
                    options={products}
                    getOptionLabel={(option) => option.name}
                    value={selectedProduct}
                    onChange={(_, newValue) => setSelectedProduct(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Product" />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    InputProps={{
                      inputProps: { min: 1 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddItemIcon />}
                    onClick={handleAddItem}
                    disabled={!selectedProduct}
                  >
                    Add Item
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Items</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentPurchase.items.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                        <TableCell align="right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(item.productId)}
                          >
                            <RemoveItemIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Typography variant="h6">
                  Total: ${currentPurchase.total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSavePurchase} variant="contained">
            Create Purchase Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Purchase Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Purchase Order Details - {currentPurchase.poNumber}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Supplier:</strong> {currentPurchase.supplier}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Date:</strong> {currentPurchase.date}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Status:</strong> {currentPurchase.status}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Total:</strong> ${currentPurchase.total.toFixed(2)}</Typography>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>Items</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentPurchase.items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                      <TableCell align="right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<ReceiptIcon />}
            onClick={() => handlePrintPO(currentPurchase)}
          >
            Print PO
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 