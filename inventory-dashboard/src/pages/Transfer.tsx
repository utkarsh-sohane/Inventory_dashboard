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
import type { SelectChangeEvent } from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Transfer {
  id: number;
  date: string;
  reference: string;
  fromLocation: string;
  toLocation: string;
  status: string;
}

const initialTransfer: Transfer = {
  id: 0,
  date: new Date().toISOString().split('T')[0],
  reference: '',
  fromLocation: '',
  toLocation: '',
  status: 'Pending',
};

export default function Transfer() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTransfer, setCurrentTransfer] = useState<Transfer>(initialTransfer);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    const savedTransfers = localStorage.getItem('transfers');
    if (savedTransfers) {
      setTransfers(JSON.parse(savedTransfers));
    } else {
      const mockTransfers: Transfer[] = [
        { id: 1, date: '2024-03-22', reference: 'TRF001', fromLocation: 'Warehouse A', toLocation: 'Store 1', status: 'Completed' },
        { id: 2, date: '2024-03-21', reference: 'TRF002', fromLocation: 'Store 2', toLocation: 'Warehouse B', status: 'Pending' },
        { id: 3, date: '2024-03-20', reference: 'TRF003', fromLocation: 'Warehouse A', toLocation: 'Warehouse B', status: 'Completed' },
      ];
      setTransfers(mockTransfers);
      localStorage.setItem('transfers', JSON.stringify(mockTransfers));
    }
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (transfer?: Transfer) => {
    if (transfer) {
      setCurrentTransfer(transfer);
      setIsEditing(true);
    } else {
      setCurrentTransfer(initialTransfer);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTransfer(initialTransfer);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setCurrentTransfer(prev => ({
      ...prev,
      [name as keyof Transfer]: value,
    }));
  };

  const handleSaveTransfer = () => {
    if (!currentTransfer.date || !currentTransfer.reference || !currentTransfer.fromLocation || !currentTransfer.toLocation || !currentTransfer.status) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    let updatedTransfers: Transfer[];
    if (isEditing) {
      updatedTransfers = transfers.map(trf => 
        trf.id === currentTransfer.id ? currentTransfer : trf
      );
    } else {
      const newTransfer = {
        ...currentTransfer,
        id: transfers.length > 0 ? Math.max(...transfers.map(trf => trf.id)) + 1 : 1,
      };
      updatedTransfers = [...transfers, newTransfer];
    }

    setTransfers(updatedTransfers);
    localStorage.setItem('transfers', JSON.stringify(updatedTransfers));
    handleCloseDialog();
    setSnackbar({
      open: true,
      message: `Transfer ${isEditing ? 'updated' : 'added'} successfully`,
      severity: 'success'
    });
  };

  const handleDeleteTransfer = (id: number) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      const updatedTransfers = transfers.filter(trf => trf.id !== id);
      setTransfers(updatedTransfers);
      localStorage.setItem('transfers', JSON.stringify(updatedTransfers));
      setSnackbar({
        open: true,
        message: 'Transfer deleted successfully',
        severity: 'success'
      });
    }
  };

  const filteredTransfers = transfers.filter((transfer) =>
    transfer.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transfer.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transfer.toLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transfer.date.includes(searchQuery) ||
    transfer.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Transfer List
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Transfer
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search transfers..."
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
                <TableCell>From Location</TableCell>
                <TableCell>To Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransfers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>{transfer.date}</TableCell>
                    <TableCell>{transfer.reference}</TableCell>
                    <TableCell>{transfer.fromLocation}</TableCell>
                    <TableCell>{transfer.toLocation}</TableCell>
                    <TableCell>{transfer.status}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(transfer)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteTransfer(transfer.id)}
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
          count={filteredTransfers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Transfer' : 'Add New Transfer'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="date"
              label="Date"
              type="date"
              value={currentTransfer.date}
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
              value={currentTransfer.reference}
              onChange={handleInputChange}
              fullWidth
              required
            />
             <TextField
              name="fromLocation"
              label="From Location"
              value={currentTransfer.fromLocation}
              onChange={handleInputChange}
              fullWidth
              required
            />
             <TextField
              name="toLocation"
              label="To Location"
              value={currentTransfer.toLocation}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={currentTransfer.status}
                label="Status"
                onChange={handleInputChange}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Canceled">Canceled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveTransfer} variant="contained">
            {isEditing ? 'Update' : 'Add'} Transfer
          </Button>
        </DialogActions>
      </Dialog>

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