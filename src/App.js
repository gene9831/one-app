import React from 'react';
import MiniDrawer from './components/MiniDrawer';

function App() {
  return <MiniDrawer />;
}

export default App;

// const OD_API = 'http://localhost:5000/api/od';
const OD_ADMIN_API = 'http://localhost:5000/api/admin/od';

export { OD_ADMIN_API };
