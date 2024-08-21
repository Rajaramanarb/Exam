import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainContent = () => {
  const [mainContentTitle, setMainContentTitle] = useState('');
  const [mainContentText, setMainContentText] = useState('');
  const [version, setVersion] = useState(null);
  const [newTitle, setNewTitle] = useState('');
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
    // Fetch the existing main content when the component mounts
    const fetchMainContent = async () => {
      try {
        const response = await axios.get(`${apiUrl}/mainContent`);
        setMainContentTitle(response.data.title);
        setMainContentText(response.data.text);
        setVersion(response.data.version);
      } catch (error) {
        toast.error('Error fetching main content');
      }
    };

    fetchMainContent();
  }, [apiUrl]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!newTitle || !newText) {
      toast.error('Please fill in both title and text fields.');
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/mainContent`, {
        title: newTitle,
        text: newText,
      });
      toast.success(response.data.message);

      // Optionally, refresh the main content data
      setMainContentTitle(newTitle);
      setMainContentText(newText);
      setVersion((prev) => prev + 1);
    } catch (error) {
      toast.error('Error updating main content');
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
      <h1><center>Main Content</center></h1>
      <Container className="mt-4">
        <Row>
          <Col md={6} className="border-end">
            {mainContentText && (
              <div className="mb-5">
                <h3 className="text-center">Current Main Content (Version {version})</h3>
                <h4 className="text-center mt-3">{mainContentTitle}</h4>
                <p className="text-center">{mainContentText}</p>
              </div>
            )}
          </Col>
          <Col md={6}>
            <Form onSubmit={handleUpdate} className="mx-auto">
              <h3 className="text-center mb-4">Update Main Content</h3>
              <Form.Group controlId="mainContentTitle">
                <Form.Label><strong>New Title</strong></Form.Label>
                <Form.Control
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter new main content title"
                  required
                />
              </Form.Group>
              <Form.Group controlId="mainContentText" className="mt-3">
                <Form.Label><strong>New Text</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Enter new main content text"
                  required
                />
              </Form.Group>
              <div className="text-center">
                <Button variant="primary" type="submit" className="mt-3">
                  Update Main Content
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainContent;
