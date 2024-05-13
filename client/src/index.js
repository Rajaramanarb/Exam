import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; 
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router } from 'react-router-dom';

document.title = 'Youtube Comments Spam Detection with Augmented Data';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Router>,
);

