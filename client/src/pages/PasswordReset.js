import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from React Router
import axios from 'axios';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isForgetPassword, setIsForgetPassword] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    else if (name === 'newPassword') setNewPassword(value);
    else if (name === 'otp') setOtp(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isForgetPassword) {
        await axios.post('http://localhost:5000/forget-password', { email });
        alert('Password reset email sent. Please check your email.');
        setIsForgetPassword(false);
      } else {
        await axios.post('http://localhost:5000/reset-password', { email, otp, newPassword });
        alert('Password reset successful. You can now log in with your new password.');
        setIsForgetPassword(true);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error. Please try again.');

      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request made, but no response received. Request:', error.request);
      } else {
        console.error('Error setting up the request:', error.message);
      }
    }
  };

  return (
    <div className="registration-form-container">
      <h2>{isForgetPassword ? 'Forget Password' : 'Password Reset'}</h2>
      <form onSubmit={handleSubmit} className="login-form">
        {isForgetPassword ? (
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email:</label>
            <input type="email" name="email" value={email} onChange={handleChange} className="form-control" />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="otp" className="form-label">OTP:</label>
              <input type="text" name="otp" value={otp} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">New Password:</label>
              <input type="password" name="newPassword" value={newPassword} onChange={handleChange} className="form-control" />
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary">
          {isForgetPassword ? 'Submit' : 'Reset Password'}
        </button>
      </form>
      <p className="mt-3">
        {isForgetPassword
          ? "Remember your password? Go back to "
          : "Want to reset a different email? Go back to "}
        <Link
          to="/" // Specify the path to the login form
          style={{ color: "blue", cursor: "pointer" }}
          className="btn-link"
        >
          {isForgetPassword ? "Login" : "Forget Password"}
        </Link>
      </p>
    </div>
  );
};

export default PasswordReset;
