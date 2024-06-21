// exam/components/HomePage.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Container,
  Grid,
  Box,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
} from '@mui/material';
import { useUser, UserButton } from '@clerk/nextjs';

const HomePage: React.FC = () => {
  const router = useRouter();
  const [licenseText, setLicenseText] = useState<string>('');
  const [licenseVersion, setLicenseVersion] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isLoaded, user } = useUser();

  useEffect(() => {
    const fetchLicense = async () => {
      try {
        const response = await fetch('/api/license');
        if (response.ok) {
          const data = await response.json();
          const storedVersion = localStorage.getItem('licenseVersion');
          const storedText = localStorage.getItem('licenseText');

          if (!storedVersion || parseInt(storedVersion) !== data.version) {
            localStorage.setItem('licenseText', data.text);
            localStorage.setItem('licenseVersion', data.version.toString());
            setLicenseText(data.text);
            setLicenseVersion(data.version);
          } else {
            setLicenseText(storedText || '');
            setLicenseVersion(parseInt(storedVersion));
          }
        } else {
          console.error('Failed to fetch license:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching license:', error);
      }
    };

    fetchLicense();
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          </Typography>
          {isLoaded && user ? (
            <>
              <Button color="inherit" onClick={handleMenuClick}>Welcome, {user.firstName}</Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}><Link href="#/action-1">Statistics</Link></MenuItem>
                <MenuItem onClick={handleMenuClose}><Link href="#/action-2">Profile</Link></MenuItem>
              </Menu>
              <UserButton afterSignOutUrl='/' />
            </>
          ) : (
            <Button color="inherit" onClick={() => router.push('/login')}>Login</Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ display: 'flex', height: '100vh', mt: 2 }}>
        <Box sx={{ width: '20%', bgcolor: '#e9ecef', p: 2 }}>
          <Typography variant="h6">Options</Typography>
          <List>
            <ListItem button component={Link} href="/take-exam">
              <ListItemText primary="Take an Exam" />
            </ListItem>
            <ListItem button component={Link} href="/ExamForm">
              <ListItemText primary="Host an Exam" />
            </ListItem>
          </List>
          <Box mt={3}>
            <Typography>Ad Space</Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          <Typography>Main content area</Typography>
        </Box>

        <Box sx={{ width: '20%', bgcolor: '#e9ecef', p: 2 }}>
          <Typography variant="h6">User Links</Typography>
          <List>
            <ListItem button component={Link} href="/Registration">
              <ListItemText primary="Sign Up" />
            </ListItem>
            <ListItem button component={Link} href="/login">
              <ListItemText primary="Login" />
            </ListItem>
          </List>
          <Box mt={3}>
            <Typography>Ad Space</Typography>
          </Box>
        </Box>
      </Container>

      <Box component="footer" sx={{ bgcolor: 'lightgray', textAlign: 'center', p: 4 }}>
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">License & Agreement</Typography>
              <Typography>{licenseText || 'Loading...'}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">Contact Us</Typography>
              <Typography>Details about how to contact us.</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">About Us</Typography>
              <Typography>Information about us.</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </div>
  );
};

export default HomePage;
