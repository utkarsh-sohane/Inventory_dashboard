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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Store {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: string; // e.g., 'Enable', 'Disable'
}

const initialStore: Store = {
  id: 0,
  name: '',
  phone: '',
  email: '',
  status: 'Enable',
};

export default function Store() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store>(initialStore);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Load stores from localStorage on component mount
  useEffect(() => {
    const savedStores = localStorage.getItem('stores');
    if (savedStores) {
      setStores(JSON.parse(savedStores));
    } else {
      // Initialize with mock data if no stores exist
      const mockStores: Store[] = [
        { id: 1, name: 'Store 1', phone: '123-456-7890', email: 'store1@example.com', status: 'Enable' },
        { id: 2, name: 'Store 2', phone: '987-654-3210', email: 'store2@example.com', status: 'Enable' },
        { id: 3, name: 'Warehouse', phone: '555-555-5555', email: 'warehouse@example.com', status: 'Enable' },
      ];
      setStores(mockStores);
      localStorage.setItem('stores', JSON.stringify(mockStores));
    }
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (store?: Store) => {
    if (store) {
      setCurrentStore(store);
      setIsEditing(true);
    } else {
      setCurrentStore(initialStore);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentStore(initialStore);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setCurrentStore(prev => ({
      ...prev,
      [name as keyof Store]: value,
    }));
  };

  const handleSaveStore = () => {
    if (!currentStore.name || !currentStore.phone || !currentStore.email || !currentStore.status) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    let updatedStores: Store[];
    if (isEditing) {
      updatedStores = stores.map(store => 
        store.id === currentStore.id ? currentStore : store
      );
    } else {
      const newStore = {
        ...currentStore,
        id: stores.length > 0 ? Math.max(...stores.map(store => store.id)) + 1 : 1,
      };
      updatedStores = [...stores, newStore];
    }

    setStores(updatedStores);
    localStorage.setItem('stores', JSON.stringify(updatedStores));
    handleCloseDialog();
    setSnackbar({
      open: true,
      message: `Store ${isEditing ? 'updated' : 'added'} successfully`,
      severity: 'success'
    });
  };

  const handleDeleteStore = (id: number) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      const updatedStores = stores.filter(store => store.id !== id);
      setStores(updatedStores);
      localStorage.setItem('stores', JSON.stringify(updatedStores));
      setSnackbar({
        open: true,
        message: 'Store deleted successfully',
        severity: 'success'
      });
    }
  };

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Store List
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Store
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search stores..."
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
                <TableCell>Store Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStores
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>{store.name}</TableCell>
                    <TableCell>{store.phone}</TableCell>
                    <TableCell>{store.email}</TableCell>
                    <TableCell>{store.status}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(store)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteStore(store.id)}
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
          count={filteredStores.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Store Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Store' : 'Add New Store'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="name"
              label="Store Name"
              value={currentStore.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="phone"
              label="Phone"
              value={currentStore.phone}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="email"
              label="Email"
              value={currentStore.email}
              onChange={handleInputChange}
              fullWidth
              required
            />
             <FormControl fullWidth required>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={currentStore.status}
                label="Status"
                onChange={handleInputChange}
              >
                <MenuItem value="Enable">Enable</MenuItem>
                <MenuItem value="Disable">Disable</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveStore} variant="contained">
            {isEditing ? 'Update' : 'Add'} Store
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