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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';

interface SalesReturn {
  id: number;
  productName: string;
  date: string;
  customer: string;
  status: string; // e.g., 'Received', 'Pending'
  grandTotal: number;
  paid: number;
  due: number;
  paymentStatus: string; // e.g., 'Paid', 'Unpaid', 'Partial'
}

const initialSalesReturn: SalesReturn = {
  id: 0,
  productName: '',
  date: new Date().toISOString().split('T')[0],
  customer: '',
  status: 'Pending',
  grandTotal: 0,
  paid: 0,
  due: 0,
  paymentStatus: 'Unpaid',
};

export default function SalesReturn() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSalesReturn, setCurrentSalesReturn] = useState<SalesReturn>(initialSalesReturn);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Load sales returns from localStorage on component mount
  useEffect(() => {
    const savedSalesReturns = localStorage.getItem('salesReturns');
    if (savedSalesReturns) {
      setSalesReturns(JSON.parse(savedSalesReturns));
    } else {
      // Initialize with mock data if no sales returns exist
      const mockSalesReturns: SalesReturn[] = [
        { id: 1, productName: 'Macbook Pro', date: '2024-03-15', customer: 'Thomas', status: 'Received', grandTotal: 550, paid: 120, due: 430, paymentStatus: 'Partial' },
        { id: 2, productName: 'Orange', date: '2024-03-14', customer: 'Benjamin', status: 'Pending', grandTotal: 50, paid: 0, due: 50, paymentStatus: 'Unpaid' },
        { id: 3, productName: 'Pineapple', date: '2024-03-13', customer: 'James', status: 'Pending', grandTotal: 30, paid: 30, due: 0, paymentStatus: 'Paid' },
      ];
      setSalesReturns(mockSalesReturns);
      localStorage.setItem('salesReturns', JSON.stringify(mockSalesReturns));
    }
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (salesReturn?: SalesReturn) => {
    if (salesReturn) {
      setCurrentSalesReturn(salesReturn);
      setIsEditing(true);
    } else {
      setCurrentSalesReturn(initialSalesReturn);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSalesReturn(initialSalesReturn);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setCurrentSalesReturn(prev => ({
      ...prev,
      [name as keyof SalesReturn]: name === 'grandTotal' || name === 'paid' || name === 'due' ? parseFloat(value as string) || 0 : value,
    }));
  };

  const handleSaveSalesReturn = () => {
    if (!currentSalesReturn.productName || !currentSalesReturn.date || !currentSalesReturn.customer || !currentSalesReturn.status || currentSalesReturn.grandTotal <= 0 || currentSalesReturn.paid < 0 || currentSalesReturn.due < 0 || !currentSalesReturn.paymentStatus) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields and ensure amounts are valid.',
        severity: 'error'
      });
      return;
    }

    let updatedSalesReturns: SalesReturn[];
    if (isEditing) {
      updatedSalesReturns = salesReturns.map(sr => 
        sr.id === currentSalesReturn.id ? currentSalesReturn : sr
      );
    } else {
      const newSalesReturn = {
        ...currentSalesReturn,
        id: salesReturns.length > 0 ? Math.max(...salesReturns.map(sr => sr.id)) + 1 : 1,
      };
      updatedSalesReturns = [...salesReturns, newSalesReturn];
    }

    setSalesReturns(updatedSalesReturns);
    localStorage.setItem('salesReturns', JSON.stringify(updatedSalesReturns));
    handleCloseDialog();
    setSnackbar({
      open: true,
      message: `Sales Return ${isEditing ? 'updated' : 'added'} successfully`,
      severity: 'success'
    });
  };

  const handleDeleteSalesReturn = (id: number) => {
    if (window.confirm('Are you sure you want to delete this sales return?')) {
      const updatedSalesReturns = salesReturns.filter(sr => sr.id !== id);
      setSalesReturns(updatedSalesReturns);
      localStorage.setItem('salesReturns', JSON.stringify(updatedSalesReturns));
      setSnackbar({
        open: true,
        message: 'Sales Return deleted successfully',
        severity: 'success'
      });
    }
  };

  const filteredSalesReturns = salesReturns.filter((salesReturn) =>
    salesReturn.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    salesReturn.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    salesReturn.date.includes(searchQuery) ||
    salesReturn.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(salesReturn.grandTotal).includes(searchQuery) ||
    String(salesReturn.paid).includes(searchQuery) ||
    String(salesReturn.due).includes(searchQuery) ||
    salesReturn.paymentStatus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Sales Return List
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >\n          Add New Sales Return
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search sales returns..."
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
                <TableCell>Product Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Grand Total ($)</TableCell>
                <TableCell align="right">Paid ($)</TableCell>
                <TableCell align="right">Due ($)</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSalesReturns
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((salesReturn) => (
                  <TableRow key={salesReturn.id}>
                    <TableCell>{salesReturn.productName}</TableCell>
                    <TableCell>{salesReturn.date}</TableCell>
                    <TableCell>{salesReturn.customer}</TableCell>
                    <TableCell>{salesReturn.status}</TableCell>
                    <TableCell align="right">{(salesReturn.grandTotal || 0).toFixed(2)}</TableCell>
                    <TableCell align="right">{(salesReturn.paid || 0).toFixed(2)}</TableCell>
                    <TableCell align="right">{(salesReturn.due || 0).toFixed(2)}</TableCell>
                    <TableCell>{salesReturn.paymentStatus}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(salesReturn)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteSalesReturn(salesReturn.id)}
                      >
                        <DeleteIcon />
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
          count={filteredSalesReturns.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Sales Return Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Sales Return' : 'Add New Sales Return'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="productName"
              label="Product Name"
              value={currentSalesReturn.productName}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="date"
              label="Date"
              type="date"
              value={currentSalesReturn.date}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              name="customer"
              label="Customer"
              value={currentSalesReturn.customer}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={currentSalesReturn.status}
                label="Status"
                onChange={handleInputChange}
              >
                <MenuItem value="Received">Received</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>
            <TextField
              name="grandTotal"
              label="Grand Total"
              type="number"
              value={currentSalesReturn.grandTotal}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              required
            />
            <TextField
              name="paid"
              label="Paid"
              type="number"
              value={currentSalesReturn.paid}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              required
            />
            <TextField
              name="due"
              label="Due"
              type="number"
              value={currentSalesReturn.due}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              required
            />
             <FormControl fullWidth required>
              <InputLabel id="payment-status-label">Payment Status</InputLabel>
              <Select
                labelId="payment-status-label"
                name="paymentStatus"
                value={currentSalesReturn.paymentStatus}
                label="Payment Status"
                onChange={handleInputChange}
              >
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Unpaid">Unpaid</MenuItem>
                <MenuItem value="Partial">Partial</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveSalesReturn} variant="contained">
            {isEditing ? 'Update' : 'Add'} Sales Return
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