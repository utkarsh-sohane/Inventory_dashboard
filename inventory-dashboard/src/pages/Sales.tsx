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

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

const initialSale: Sale = {
  id: 0,
  invoiceNo: '',
  customer: '',
  date: new Date().toISOString().split('T')[0],
  total: 0,
  status: 'Pending',
  items: [],
};

export default function Sales() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale>(initialSale);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Load sales and products from localStorage
  useEffect(() => {
    const savedSales = localStorage.getItem('sales');
    const savedProducts = localStorage.getItem('products');
    
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    } else {
      // Initialize with mock data if no sales exist
      const mockSales: Sale[] = [
        { 
          id: 1, 
          invoiceNo: 'INV001', 
          customer: 'John Doe', 
          date: '2024-03-15', 
          total: 1299.98, 
          status: 'Completed',
          items: [
            { productId: 1, name: 'Laptop', quantity: 1, price: 999.99 },
            { productId: 3, name: 'Headphones', quantity: 1, price: 99.99 }
          ]
        },
        { 
          id: 2, 
          invoiceNo: 'INV002', 
          customer: 'Jane Smith', 
          date: '2024-03-14', 
          total: 799.98, 
          status: 'Pending',
          items: [
            { productId: 2, name: 'Smartphone', quantity: 1, price: 699.99 },
            { productId: 5, name: 'Keyboard', quantity: 2, price: 49.99 }
          ]
        },
        { 
          id: 3, 
          invoiceNo: 'INV003', 
          customer: 'Mike Johnson', 
          date: '2024-03-13', 
          total: 149.98, 
          status: 'Cancelled',
          items: [
            { productId: 3, name: 'Headphones', quantity: 1, price: 99.99 },
            { productId: 5, name: 'Keyboard', quantity: 1, price: 49.99 }
          ]
        }
      ];
      setSales(mockSales);
      localStorage.setItem('sales', JSON.stringify(mockSales));
    }

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
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
      case 'completed':
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
    const newInvoiceNo = `INV${String(sales.length + 1).padStart(3, '0')}`;
    setCurrentSale({
      ...initialSale,
      invoiceNo: newInvoiceNo,
      date: new Date().toISOString().split('T')[0],
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSale(initialSale);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;

    const existingItemIndex = currentSale.items.findIndex(item => item.productId === selectedProduct.id);
    let updatedItems: SaleItem[];

    if (existingItemIndex > -1) {
      // If item exists, update quantity
      updatedItems = currentSale.items.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // If item does not exist, add new item
      updatedItems = [
        ...currentSale.items,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          quantity,
          price: selectedProduct.price,
        },
      ];
    }

    const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCurrentSale(prev => ({
      ...prev,
      items: updatedItems,
      total,
    }));

    // Reset selected product and quantity after adding
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleRemoveItem = (productId: number) => {
    const updatedItems = currentSale.items.filter(item => item.productId !== productId);
    const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setCurrentSale(prev => ({
      ...prev,
      items: updatedItems,
      total,
    }));
  };

  const handleSaveSale = () => {
    if (!currentSale.customer || currentSale.items.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please add customer and at least one item',
        severity: 'error'
      });
      return;
    }

    let updatedSales: Sale[];
    // Check if sales array is empty before calculating max id
    const newId = sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1;

    const newSale = {
      ...currentSale,
      id: newId,
    };

    updatedSales = [...sales, newSale];

    setSales(updatedSales);
    localStorage.setItem('sales', JSON.stringify(updatedSales));
    handleCloseDialog();
    setSnackbar({
      open: true,
      message: 'Sale created successfully',
      severity: 'success'
    });
  };

  const handleViewSale = (sale: Sale) => {
    setCurrentSale(sale);
    setViewDialog(true);
  };

  const handlePrintInvoice = (sale: Sale) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${sale.invoiceNo}</title>
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
              <h1>Invoice ${sale.invoiceNo}</h1>
            </div>
            <div class="details">
              <p><strong>Customer:</strong> ${sale.customer}</p>
              <p><strong>Date:</strong> ${sale.date}</p>
              <p><strong>Status:</strong> ${sale.status}</p>
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
                ${sale.items.map(item => `
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
              <h3>Total: $${sale.total.toFixed(2)}</h3>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const filteredSales = sales.filter((sale) =>
    sale.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sale.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Sales
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New Sale
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search sales..."
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
                <TableCell>Invoice No</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.invoiceNo}</TableCell>
                    <TableCell>{sale.customer}</TableCell>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell align="right">{sale.items.length}</TableCell>
                    <TableCell align="right">${sale.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={sale.status} 
                        color={getStatusColor(sale.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewSale(sale)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handlePrintInvoice(sale)}
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
          count={filteredSales.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* New Sale Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>New Sale</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Invoice No"
                  value={currentSale.invoiceNo}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={currentSale.date}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Customer"
                  value={currentSale.customer}
                  onChange={(e) => setCurrentSale(prev => ({ ...prev, customer: e.target.value }))}
                  required
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
                    {currentSale.items.map((item) => (
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
                  Total: ${currentSale.total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveSale} variant="contained">
            Create Sale
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Sale Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Sale Details - {currentSale.invoiceNo}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Customer:</strong> {currentSale.customer}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Date:</strong> {currentSale.date}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Status:</strong> {currentSale.status}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Total:</strong> ${currentSale.total.toFixed(2)}</Typography>
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
                  {currentSale.items.map((item) => (
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
            onClick={() => handlePrintInvoice(currentSale)}
          >
            Print Invoice
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