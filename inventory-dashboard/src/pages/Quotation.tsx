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
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Quotation {
  id: number;
  date: string;
  reference: string;
  customerName: string;
  supplierName: string;
  amount: number;
  status: string; // e.g., 'Sent', 'Accepted', 'Rejected'
}

const initialQuotation: Quotation = {
  id: 0,
  date: new Date().toISOString().split('T')[0],
  reference: '',
  customerName: '',
  supplierName: '',
  amount: 0,
  status: 'Sent',
};

export default function Quotation() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentQuotation, setCurrentQuotation] = useState<Quotation>(initialQuotation);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Load quotations from localStorage on component mount
  useEffect(() => {
    const savedQuotations = localStorage.getItem('quotations');
    if (savedQuotations) {
      setQuotations(JSON.parse(savedQuotations));
    } else {
      // Initialize with mock data if no quotations exist
      const mockQuotations: Quotation[] = [
        { id: 1, date: '2024-03-20', reference: 'Q1001', customerName: 'Alpha Retail', supplierName: 'Beta Supply', amount: 1200.50, status: 'Sent' },
        { id: 2, date: '2024-03-19', reference: 'Q1002', customerName: 'Gamma Corp', supplierName: 'Delta Goods', amount: 3500.00, status: 'Accepted' },
        { id: 3, date: '2024-03-18', reference: 'Q1003', customerName: 'Alpha Retail', supplierName: 'Epsilon Mart', amount: 750.20, status: 'Rejected' },
      ];
      setQuotations(mockQuotations);
      localStorage.setItem('quotations', JSON.stringify(mockQuotations));
    }
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (quotation?: Quotation) => {
    if (quotation) {
      setCurrentQuotation(quotation);
      setIsEditing(true);
    } else {
      setCurrentQuotation(initialQuotation);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentQuotation(initialQuotation);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentQuotation(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveQuotation = () => {
    if (!currentQuotation.date || !currentQuotation.reference || !currentQuotation.customerName || !currentQuotation.amount || !currentQuotation.status) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    let updatedQuotations: Quotation[];
    if (isEditing) {
      updatedQuotations = quotations.map(quo => 
        quo.id === currentQuotation.id ? currentQuotation : quo
      );
    } else {
      const newQuotation = {
        ...currentQuotation,
        id: quotations.length > 0 ? Math.max(...quotations.map(quo => quo.id)) + 1 : 1,
      };
      updatedQuotations = [...quotations, newQuotation];
    }

    setQuotations(updatedQuotations);
    localStorage.setItem('quotations', JSON.stringify(updatedQuotations));
    handleCloseDialog();
    setSnackbar({
      open: true,
      message: `Quotation ${isEditing ? 'updated' : 'added'} successfully`,
      severity: 'success'
    });
  };

  const handleDeleteQuotation = (id: number) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      const updatedQuotations = quotations.filter(quo => quo.id !== id);
      setQuotations(updatedQuotations);
      localStorage.setItem('quotations', JSON.stringify(updatedQuotations));
      setSnackbar({
        open: true,
        message: 'Quotation deleted successfully',
        severity: 'success'
      });
    }
  };

  const filteredQuotations = quotations.filter((quotation) =>
    quotation.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quotation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quotation.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quotation.date.includes(searchQuery) ||
    String(quotation.amount).includes(searchQuery) ||
    quotation.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Quotation List
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Quotation
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search quotations..."
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
                <TableCell>Date</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQuotations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell>{quotation.date}</TableCell>
                    <TableCell>{quotation.reference}</TableCell>
                    <TableCell>{quotation.customerName}</TableCell>
                    <TableCell>{quotation.supplierName}</TableCell>
                    <TableCell align="right">${(quotation.amount || 0).toFixed(2)}</TableCell>
                    <TableCell>{quotation.status}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(quotation)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteQuotation(quotation.id)}
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
          count={filteredQuotations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Quotation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Quotation' : 'Add New Quotation'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="date"
              label="Date"
              type="date"
              value={currentQuotation.date}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              name="reference"
              label="Reference"
              value={currentQuotation.reference}
              onChange={handleInputChange}
              fullWidth
              required
            />
             <TextField
              name="customerName"
              label="Customer Name"
              value={currentQuotation.customerName}
              onChange={handleInputChange}
              fullWidth
              required
            />
             <TextField
              name="supplierName"
              label="Supplier Name"
              value={currentQuotation.supplierName}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="amount"
              label="Amount"
              type="number"
              value={currentQuotation.amount}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              required
            />
             <TextField
              name="status"
              label="Status"
              value={currentQuotation.status}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveQuotation} variant="contained">
            {isEditing ? 'Update' : 'Add'} Quotation
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