import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

const Navigation = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/"
            color="inherit"
          >
            정보입력
          </Button>
          <Button
            component={RouterLink}
            to="/data"
            color="inherit"
          >
            데이터조회
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 