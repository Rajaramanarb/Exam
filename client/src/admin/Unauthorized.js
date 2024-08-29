import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const apiUrl = process.env.REACT_APP_API_URL_DEVELOPMENT;

  useEffect(() => {
    const logUnauthorizedAccess = async () => {
        try {
          console.log('Logging unauthorized access');
          await axios.post(`${apiUrl}/unauthorized`, {
            clerkId: user.id,
            firstName: user.firstName,
            path: location.state?.from || 'Unknown'
          });
        } catch (error) {
          console.error('Error logging unauthorized access:', error);
        }
    };
  
    logUnauthorizedAccess();
  }, [])

  const handleGoBack = () => {
    navigate('/'); // Navigate to the homepage or any other route you prefer
  };

  return (
    <div className="container text-center mt-5">
      <h1 className="display-4 text-danger">Unauthorized Access</h1>
      <p className="lead">You do not have permission to view this page.</p>
      <button className="btn btn-primary mt-3" onClick={handleGoBack}>
        Go Back to Homepage
      </button>
    </div>
  );
};

export default Unauthorized;
