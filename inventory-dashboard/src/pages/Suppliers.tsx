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
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

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

const initialSupplier: Supplier = {
  id: 0,
  name: '',
  email: '',
  phone: '',
  address: '',
  contactPerson: '',
  totalOrders: 0,
  totalSpent: 0,
  status: 'Active',
  paymentTerms: 'Net 30',
};

export default function Suppliers() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier>(initialSupplier);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Load suppliers from localStorage
  useEffect(() => {
    const savedSuppliers = localStorage.getItem('suppliers');
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    } else {
      // Initialize with mock data if no suppliers exist
      const mockSuppliers: Supplier[] = [
        {
          id: 1,
          name: 'Tech Supplies Inc.',
          email: 'contact@techsupplies.com',
          phone: '555-0101',
          address: '123 Tech Park, Silicon Valley, CA 94025',
          contactPerson: 'John Smith',
          totalOrders: 15,
          totalSpent: 24999.99,
          status: 'Active',
          lastOrderDate: '2024-03-15',
          paymentTerms: 'Net 30',
        },
        {
          id: 2,
          name: 'Office Depot',
          email: 'orders@officedepot.com',
          phone: '555-0102',
          address: '456 Business Ave, New York, NY 10001',
          contactPerson: 'Sarah Johnson',
          totalOrders: 8,
          totalSpent: 14999.99,
          status: 'Active',
          lastOrderDate: '2024-03-14',
          paymentTerms: 'Net 45',
        },
        {
          id: 3,
          name: 'Global Electronics',
          email: 'sales@globalelectronics.com',
          phone: '555-0103',
          address: '789 Industrial Zone, Chicago, IL 60601',
          contactPerson: 'Mike Brown',
          totalOrders: 5,
          totalSpent: 7999.99,
          status: 'Inactive',
          lastOrderDate: '2024-02-28',
          paymentTerms: 'Net 60',
        },
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

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setCurrentSupplier(supplier);
      setIsEditing(true);
    } else {
      setCurrentSupplier(initialSupplier);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentSupplier(initialSupplier);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentSupplier(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveSupplier = () => {
    if (!currentSupplier.name || !currentSupplier.email || !currentSupplier.phone || !currentSupplier.contactPerson) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    let updatedSuppliers: Supplier[];
    if (isEditing) {
      updatedSuppliers = suppliers.map(s => 
        s.id === currentSupplier.id ? currentSupplier : s
      );
    } else {
      const newSupplier = {
        ...currentSupplier,
        id: Math.max(...suppliers.map(s => s.id)) + 1,
      };
      updatedSuppliers = [...suppliers, newSupplier];
    }

    setSuppliers(updatedSuppliers);
    localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
    handleCloseDialog();
    setSnackbar({
      open: true,
      message: `Supplier ${isEditing ? 'updated' : 'added'} successfully`,
      severity: 'success'
    });
  };

  const handleDeleteSupplier = (id: number) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      const updatedSuppliers = suppliers.filter(s => s.id !== id);
      setSuppliers(updatedSuppliers);
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      setSnackbar({
        open: true,
        message: 'Supplier deleted successfully',
        severity: 'success'
      });
    }
  };

  const handleViewSupplier = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setViewDialog(true);
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone.includes(searchQuery) ||
    supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Suppliers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Supplier
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search suppliers..."
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
                <TableCell>Name</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Orders</TableCell>
                <TableCell align="right">Total Spent</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell align="right">{supplier.totalOrders || 0}</TableCell>
                    <TableCell align="right">${(supplier.totalSpent || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={supplier.status}
                        color={supplier.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewSupplier(supplier)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(supplier)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteSupplier(supplier.id)}
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
          count={filteredSuppliers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="name"
              label="Company Name"
              value={currentSupplier.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="contactPerson"
              label="Contact Person"
              value={currentSupplier.contactPerson}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              value={currentSupplier.email}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="phone"
              label="Phone"
              value={currentSupplier.phone}
              onChange={handleInputChange}
              required
            />
            <TextField
              name="address"
              label="Address"
              multiline
              rows={3}
              value={currentSupplier.address}
              onChange={handleInputChange}
            />
            <TextField
              name="paymentTerms"
              label="Payment Terms"
              value={currentSupplier.paymentTerms}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveSupplier} variant="contained">
            {isEditing ? 'Update' : 'Add'} Supplier
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Supplier Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Supplier Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon color="action" />
                  <Typography variant="h6">{currentSupplier.name}</Typography>
                </Box>
                <Chip
                  label={currentSupplier.status}
                  color={currentSupplier.status === 'Active' ? 'success' : 'default'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Contact Information</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <EmailIcon color="action" />
                  <Typography>{currentSupplier.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <PhoneIcon color="action" />
                  <Typography>{currentSupplier.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1 }}>
                  <LocationIcon color="action" sx={{ mt: 0.5 }} />
                  <Typography>{currentSupplier.address}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Business Details</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, mt: 1 }}>
                  <Typography>Contact Person:</Typography>
                  <Typography>{currentSupplier.contactPerson}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Payment Terms:</Typography>
                  <Typography>{currentSupplier.paymentTerms}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Order History</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, mt: 1 }}>
                  <Typography>Total Orders:</Typography>
                  <Typography>{currentSupplier.totalOrders || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Total Spent:</Typography>
                  <Typography>${(currentSupplier.totalSpent || 0).toFixed(2)}</Typography>
                </Box>
                {currentSupplier.lastOrderDate && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Last Order:</Typography>
                    <Typography>{currentSupplier.lastOrderDate}</Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setViewDialog(false);
              handleOpenDialog(currentSupplier);
            }}
          >
            Edit Supplier
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