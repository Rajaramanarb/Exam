import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import RegistrationForm from './pages/RegistrationForm';
import LoginForm from './pages/LoginForm';
import HomePage from './pages/HomePage';
import PasswordReset from './pages/PasswordReset';
import ExamForm from './pages/ExamForm';
import QuestionForm from './pages/QuestionForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    
  return (
    <div>
      <center>
        <h1>Title</h1>
      </center>
      <Routes>
        <Route path="/" element={<Outlet />}>
          <Route path="login" element ={<LoginForm />} />
          <Route index element={<HomePage />} />
          <Route path="Registration" element={<RegistrationForm />} />
          <Route path="forget-password" element={<PasswordReset />} />
          <Route path="ExamForm" element={<ExamForm />} />
          <Route path="/questions/:examId/:noOfQuestions" element={<QuestionForm />} />
        </Route>
      </Routes>
      <hr />
      <ToastContainer />
    </div>
  );
};

export default App;