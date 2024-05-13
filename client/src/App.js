import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import RegistrationForm from './pages/RegistrationForm';
import LoginForm from './pages/LoginForm';
import HomePage from './pages/HomePage';
import PasswordReset from './pages/PasswordReset';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    
  return (
    <div>
      <center>
        <h1>Youtube Comments Spam Detection with Augmented Data</h1>
      </center>
      <Routes>
        <Route path="/" element={<Outlet />}>
          <Route index element ={<LoginForm />} />
          <Route path="HomePage" element={<HomePage />} />
          <Route path="Registration" element={<RegistrationForm />} />
          <Route path="forget-password" element={<PasswordReset />} />
        </Route>
      </Routes>
      <hr />
      <ToastContainer />
    </div>
  );
};

export default App;