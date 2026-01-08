import React, { useEffect, useState } from 'react';
import { useAppContext } from './AppContext.tsx';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAppContext();
    const [readyToReturn, setReadyToReturn] = useState(false);

  
    if (loading) {
      return <div>Loading...</div>; // or a spinner
    }

    //find out why this no work
  
     return !loading && user ? children : <Navigate to="/" replace />;
};

  export default ProtectedRoute;
