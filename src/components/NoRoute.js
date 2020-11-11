import { Container, Typography, Box } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';

const NoRoute = () => {
  return (
    <Container>
      <Typography variant="h1" style={{ textAlign: 'center' }}>
        404
      </Typography>
      <Box style={{ display: 'flex', justifyContent: 'center' }}>
        <Link to="/admin">Admin</Link>
      </Box>
    </Container>
  );
};

export default NoRoute;
