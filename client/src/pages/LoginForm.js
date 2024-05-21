import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/LoginForm.css'; // Import custom CSS for LoginForm styling

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/login', formData);

      if (response.status === 200) {
        const { name, email } = response.data;
        // Store user info in local storage
        localStorage.setItem('user', JSON.stringify({ name, email }));
        toast.success('Login successful');
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const handleCreateAccount = () => {
    navigate('/Registration');
  };

  const handleForgetPassword = () => {
    navigate('/forget-password');
  };

  return (
    <fieldset className="login-form-container">
      <h2 className="text-center mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group d-flex justify-content-between">
          <div>
            <button type="button" onClick={handleCreateAccount} className="btn btn-link">
              Create Account
            </button>
          </div>
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </div>
        <button type="button" onClick={handleForgetPassword} className="btn btn-link">
          Forget Password
        </button>
      </form>
    </fieldset>
  );
};

export default LoginForm;
