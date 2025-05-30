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

interface Expense {
  id: number;
  date: string;
  category: string;
  amount: number;
  description: string;
}

const initialExpense: Expense = {
  id: 0,
  date: new Date().toISOString().split('T')[0],
  category: '',
  amount: 0,
  description: '',
};

export default function Expense() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense>(initialExpense);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Load expenses from localStorage on component mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    } else {
      // Initialize with mock data if no expenses exist
      const mockExpenses: Expense[] = [
        { id: 1, date: '2024-03-15', category: 'Office Supplies', amount: 150.75, description: 'Purchase of paper and pens' },
        { id: 2, date: '2024-03-14', category: 'Utilities', amount: 300.50, description: 'Monthly electricity bill' },
        { id: 3, date: '2024-03-13', category: 'Travel', amount: 500.00, description: 'Business trip to conference' },
        { id: 4, date: '2024-03-12', category: 'Marketing', amount: 200.00, description: 'Online ad campaign' },
        { id: 5, date: '2024-03-11', category: 'Salaries', amount: 5000.00, description: 'Monthly payroll' },
      ];
      setExpenses(mockExpenses);
      localStorage.setItem('expenses', JSON.stringify(mockExpenses));
    }
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setCurrentExpense(expense);
      setIsEditing(true);
    } else {
      setCurrentExpense(initialExpense);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentExpense(initialExpense);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentExpense(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveExpense = () => {
    if (!currentExpense.date || !currentExpense.category || !currentExpense.amount) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields (Date, Category, Amount)',
        severity: 'error'
      });
      return;
    }

    let updatedExpenses: Expense[];
    if (isEditing) {
      updatedExpenses = expenses.map(exp => 
        exp.id === currentExpense.id ? currentExpense : exp
      );
    } else {
      const newExpense = {
        ...currentExpense,
        id: expenses.length > 0 ? Math.max(...expenses.map(exp => exp.id)) + 1 : 1,
      };
      updatedExpenses = [...expenses, newExpense];
    }

    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    handleCloseDialog();
    setSnackbar({
      open: true,
      message: `Expense ${isEditing ? 'updated' : 'added'} successfully`,
      severity: 'success'
    });
  };

  const handleDeleteExpense = (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const updatedExpenses = expenses.filter(exp => exp.id !== id);
      setExpenses(updatedExpenses);
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      setSnackbar({
        open: true,
        message: 'Expense deleted successfully',
        severity: 'success'
      });
    }
  };

  const filteredExpenses = expenses.filter((expense) =>
    expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.date.includes(searchQuery) ||
    String(expense.amount).includes(searchQuery)
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Expense List
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Expense
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search expenses..."
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
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExpenses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell align="right">${(expense.amount || 0).toFixed(2)}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(expense)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteExpense(expense.id)}
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
          count={filteredExpenses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="date"
              label="Date"
              type="date"
              value={currentExpense.date}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              name="category"
              label="Category"
              value={currentExpense.category}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="amount"
              label="Amount"
              type="number"
              value={currentExpense.amount}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              required
            />
            <TextField
              name="description"
              label="Description"
              value={currentExpense.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveExpense} variant="contained">
            {isEditing ? 'Update' : 'Add'} Expense
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