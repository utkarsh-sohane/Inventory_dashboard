import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  List as ListIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
  },
  {
    title: 'Products',
    icon: <InventoryIcon />,
    children: [
      { title: 'Add Product', icon: <AddIcon />, path: '/products/add' },
      { title: 'Product List', icon: <ListIcon />, path: '/products' },
    ],
  },
  {
    title: 'Sales',
    icon: <ShoppingCartIcon />,
    children: [
      { title: 'Add Sale', icon: <AddIcon />, path: '/sales/add' },
      { title: 'Sales List', icon: <ListIcon />, path: '/sales' },
    ],
  },
  {
    title: 'Customers',
    icon: <PeopleIcon />,
    children: [
      { title: 'Add Customer', icon: <AddIcon />, path: '/customers/add' },
      { title: 'Customer List', icon: <ListIcon />, path: '/customers' },
    ],
  },
  {
    title: 'Categories',
    icon: <CategoryIcon />,
    children: [
      { title: 'Add Category', icon: <AddIcon />, path: '/categories/add' },
      { title: 'Category List', icon: <ListIcon />, path: '/categories' },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});

  const handleClick = (title: string) => {
    setOpen((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: 8,
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <div key={item.title}>
              <ListItemButton
                onClick={() =>
                  item.children ? handleClick(item.title) : handleNavigate(item.path)
                }
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
                {item.children && (open[item.title] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
              {item.children && (
                <Collapse in={open[item.title]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.title}
                        onClick={() => handleNavigate(child.path)}
                        selected={location.pathname === child.path}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.title} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </div>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 