import { Link } from 'react-router-dom';
import { Container, Button, Navbar, Nav, Modal, Form } from 'react-bootstrap';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";

const Admin = () => {
  const { user } = useUser();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(true);
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL_DEVELOPMENT;

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${apiUrl}/login`, { password });
      if (response.status === 200) {
        handleClose();
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/');
      } else if (err.response && err.response.status === 404) {
        setError('User not found');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(); 
    }
  };

  return (
    <div>
      {user?.id && user?.id !== process.env.REACT_APP_ADMIN_ID ? (
      <Modal show={show} onHide={handleClose} backdrop="static" size="sm">
        <Modal.Header>
          <Modal.Title>Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formPassword">
              <Form.Label><b>Password</b></Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={handleKeyDown}
              />
            </Form.Group> 
            {error && <p className="text-danger">{error}</p>}           
          </Form>
        </Modal.Body>
        <Modal.Footer>       
          <Button variant="primary" onClick={handleSubmit}>
            Verify
          </Button>
        </Modal.Footer>
      </Modal>
      ) : null} 

      <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand href="/">Home</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link href="/TakeExam">Take Exam</Nav.Link>
              <Nav.Link href="/HostedExam">My Exam</Nav.Link>
            </Nav>
            <Nav className="ml-auto">
              <Navbar.Text className="text-secondary">Welcome, Admin</Navbar.Text>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="d-flex flex-column justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="text-center">
          <h1 className="display-4 mb-4">Admin Dashboard</h1>
          <p className="lead mb-5">Manage your content with the options below</p>
          <div className="d-flex justify-content-center">
            <Button as={Link} to="/Advertisement" variant="primary" className="mx-2" size="lg" state={{ from: '/Admin' }}>
              Advertisement
            </Button>
            <Button as={Link} to="/MainContent" variant="warning" className="mx-2" size="lg" style={{ color: '#fff' }} state={{ from: '/Admin' }}>
              Main Content
            </Button>
            <Button as={Link} to="/License" variant="danger" className="mx-2" size="lg" state={{ from: '/Admin' }}>
              License
            </Button>
            <Button as={Link} to="/AdminPassword" variant="info" className="mx-2" size="lg" state={{ from: '/Admin' }}>
              Admin Password
            </Button>
            <Button as={Link} to="/AdTime" variant="success" className="mx-2" size="lg" state={{ from: '/Admin' }}>
              Set Ad Time
            </Button><Button as={Link} to="/ListExam" variant="secondary" className="mx-2" size="lg" state={{ from: '/Admin' }}>
              Approve Exam
            </Button>
            <Button as={Link} to="/HostedExam" variant="dark" className="mx-2" size="lg" state={{ from: '/Admin' }}>
              Hosted Exam
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Admin;
