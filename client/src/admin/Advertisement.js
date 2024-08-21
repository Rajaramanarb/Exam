import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Importing necessary hooks
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Advertisement = () => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [adFile, setAdFile] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL_DEVELOPMENT;
  const location = useLocation(); // Getting the current location
  const navigate = useNavigate(); // Hook for programmatic navigation

  useEffect(() => {
    // Check if the previous page is not '/Admin', redirect to '/Admin'
    if (location.state?.from !== '/Admin') {
      navigate('/Admin');
    }
  }, [location, navigate]);

  const handleFileChange = (e) => {
    setAdFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !time || !adFile) {
      toast.error('Please fill in all fields and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('time', time);
    formData.append('adFile', adFile);

    try {
      const response = await axios.post(`${apiUrl}/advertisements`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(`Ad uploaded successfully`);
      setTitle('');
      setTime('');
      setAdFile(null);
    } catch (error) {
      console.error('Error uploading advertisement:', error);
      toast.error('Failed to upload the advertisement.');
    }
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="/">Home</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <a className="nav-link" href="/TakeExam">Take Exam</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/HostedExam">My Exam <span className="sr-only">(current)</span></a>
            </li>
          </ul>

          <div className="collapse navbar-collapse justify-content-end">
            <span className="navbar-text">
              Welcome, Admin
            </span>
          </div>
        </div>
      </nav>
      <div className="container mt-5">
        <h2 className="mb-4 text-center">Upload Advertisement</h2>
        <form onSubmit={handleSubmit} className="w-50 mx-auto">
          <div className="form-group">
            <label htmlFor="title"><b>Title</b></label>
            <input
              type="text"
              className="form-control form-control-sm"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="time"><b>Time (in seconds)</b></label>
            <input
              type="number"
              className="form-control form-control-sm"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Enter a time"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="adFile"><b>Upload Ad (Image or Video)</b></label>
            <input
              type="file"
              className="form-control-file"
              id="adFile"
              accept="image/*,video/*"
              onChange={handleFileChange}
              required
            />
          </div>
          <div className="text-center">
            <button type="submit" className="btn btn-primary mt-3">
              Upload Advertisement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Advertisement;
