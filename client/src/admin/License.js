import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Importing necessary hooks
import axios from 'axios';
import { Container, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const License = () => {
  const [licenseText, setLicenseText] = useState('');
  const [version, setVersion] = useState(null);
  const [newText, setNewText] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL_DEVELOPMENT;
  const location = useLocation(); // Getting the current location
  const navigate = useNavigate(); // Hook for programmatic navigation

  useEffect(() => {
    // Check if the previous page is not '/Admin', redirect to '/Admin'
    if (location.state?.from !== '/Admin') {
      navigate('/Admin');
    }
  }, [location, navigate]);

  useEffect(() => {
    // Fetch the existing license when the component mounts
    const fetchLicense = async () => {
      try {
        const response = await axios.get(`${apiUrl}/license`);
        setLicenseText(response.data.text);
        setVersion(response.data.version);
      } catch (error) {
        toast.error('Error fetching license');
      }
    };

    fetchLicense();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${apiUrl}/license`, { text: newText });
      toast.success('License updated successfully');
      setLicenseText(newText);
      setVersion((prev) => prev + 1);
    } catch (error) {
      toast.error('Error updating license');
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

      <Container className="mt-5 license-container">
        <h1 className="text-center mb-4">License and Agreement</h1>

        {licenseText && (
          <>
            <h3>Current License (Version {version})</h3>
            <p className="license-text p-3 bg-light border rounded">{licenseText}</p>
          </>
        )}

        <Form onSubmit={handleUpdate} className="mt-4">
          <Form.Group controlId="licenseText">
            <Form.Label><b>Update License Text</b></Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Enter new license text"
              className="p-2"
              required
            />
          </Form.Group>
          <div className="text-center">
            <Button variant="primary" type="submit" className="mt-3">
              Update License
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default License;
