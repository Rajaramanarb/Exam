import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExamForm from './pages/ExamForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    
  return (
    <div>
      <Routes>
        <Route path="/" element={<Outlet />}>
          <Route index element={<HomePage />} />
          <Route path="ExamForm" element={<ExamForm />} />
        </Route>
      </Routes>
      <hr />
      <ToastContainer />
    </div>
  );
};

export default App;