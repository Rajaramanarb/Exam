import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';

const Advertisement = () => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [adFile, setAdFile] = useState(null);
  const [type, setType] = useState('Sequential'); // Default to 'Sequential'
  const [publishDate, setPublishDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const adFileInputRef = useRef(null); // Reference for the file input

  const apiUrl = process.env.REACT_APP_API_URL_DEVELOPMENT;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.from !== '/Admin') {
      navigate('/Admin');
    }
  }, [location, navigate]);

  const handleFileChange = (e) => {
    setAdFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !time || !adFile || !publishDate || !expiryDate) {
      toast.error('Please fill in all fields and select a file.');
      return;
    }

    // Format publishDate and expiryDate to 'YYYY-MM-DD hh:mm A'
    const formattedPublishDate = moment(publishDate).format('YYYY-MM-DD hh:mm A');
    const formattedExpiryDate = moment(expiryDate).format('YYYY-MM-DD hh:mm A');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('time', time);
    formData.append('adFile', adFile);
    formData.append('type', type);
    formData.append('publishDate', formattedPublishDate);
    formData.append('expiryDate', formattedExpiryDate);

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
      setType('Sequential');
      setPublishDate('');
      setExpiryDate('');

      // Reset the file input
      if (adFileInputRef.current) {
        adFileInputRef.current.value = null;
      }
    } catch (error) {
      console.error('Error uploading advertisement:', error);
      toast.error('Failed to upload the advertisement.');
    }
  };

  return (
    <div>
      {/* Navigation and UI code remains unchanged */}
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
              ref={adFileInputRef} // Attach ref to the file input
              required
            />
          </div>
          <div className="form-group">
            <label style={{ marginBottom: '10px', display: 'block' }}>
              <b>Type</b>
            </label>
            <div className="btn-group btn-group-toggle" data-toggle="buttons">
              <label
                className={`btn ${type === 'Sequential' ? 'btn-primary' : 'btn-light'} ${type === 'Sequential' ? 'active' : ''}`}
                style={{
                  borderTopLeftRadius: '20px',
                  borderBottomLeftRadius: '20px',
                  border: '1px solid #007bff',
                  borderRightWidth: '1px',
                  marginRight: '-1px', // Slight overlap to maintain the connected look
                  zIndex: type === 'Sequential' ? 1 : 0, // Elevate the active button
                  position: 'relative', // Required for zIndex to take effect
                }}
              >
                <input
                  type="radio"
                  name="typeOptions"
                  id="sequential"
                  value="Sequential"
                  autoComplete="off"
                  checked={type === 'Sequential'}
                  onChange={(e) => setType(e.target.value)}
                  style={{ display: 'none' }} // Hide the input field
                />
                Sequential
              </label>
              <label
                className={`btn ${type === 'Monthly' ? 'btn-primary' : 'btn-light'} ${type === 'Monthly' ? 'active' : ''}`}
                style={{
                  borderTopRightRadius: '20px',
                  borderBottomRightRadius: '20px',
                  border: '1px solid #007bff',
                  zIndex: type === 'Monthly' ? 1 : 0, // Elevate the active button
                  position: 'relative', // Required for zIndex to take effect
                }}
              >
                <input
                  type="radio"
                  name="typeOptions"
                  id="monthly"
                  value="Monthly"
                  autoComplete="off"
                  checked={type === 'Monthly'}
                  onChange={(e) => setType(e.target.value)}
                  style={{ display: 'none' }} // Hide the input field
                />
                Monthly
              </label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="publishDate"><b>Publish Date</b></label>
            <input
              type="datetime-local"
              className="form-control"
              id="publishDate"
              value={publishDate}
              onChange={(e) => {
                setPublishDate(e.target.value);
                e.target.blur();
              }}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="expiryDate"><b>Expiry Date</b></label>
            <input
              type="datetime-local"
              className="form-control"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => {
              setExpiryDate(e.target.value); 
              e.target.blur();
              }}
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
