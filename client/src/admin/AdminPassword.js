import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Importing necessary hooks
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';

const AdminPassword = () => {
  const [formData, setFormData] = useState({ password: '' });
  const [passwordError, setPasswordError] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL_DEVELOPMENT;
  const location = useLocation(); // Getting the current location
  const navigate = useNavigate(); // Hook for programmatic navigation

  useEffect(() => {
    // Check if the previous page is not '/Admin', redirect to '/Admin'
    if (location.state?.from !== '/Admin') {
      navigate('/Admin');
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') {
      const trimmedValue = value.replace(/\s/g, '').replace(/[\uD800-\uDFFF].|[\u2702-\u27B0]|[\u2934\u2935]|[\u2B05-\u2B07\u2B1B\u2B1C\u2B50]|[\u3297\u3299\u303D\u00A9\u00AE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA]|[\u25AA-\u25AB\u25B6\u25C0\u25FB-\u25FE]|[\u2600-\u26FF]|[\u2708-\u2764]|[\u2795-\u2797\u27A1\u27B0]|[\u27BF]|[\uE000-\uF8FF]/g, '');
      setFormData({ ...formData, [name]: trimmedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePasswordBlur = () => {
    const { password } = formData;
    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordError) {
      try {
        const response = await fetch(`${apiUrl}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          toast.success('User registered successfully');
          navigate('/Admin');
        } else {
          toast.error('Registration failed');
        }
      } catch (error) {
        toast.error('Error during registration');
      }
    } else {
      toast.error('Please correct the errors before submitting');
    }
  };

  return (
    <div>
      <Container>
        <Row className="justify-content-center">
          <Col md={6}>
            <fieldset className="login-form-container">
              <div className="registration-container">
                <div className="registration-box">
                  <h2 className="text-center mb-4">Admin Registration</h2>
                  <Form onSubmit={handleSubmit} className="login-form">
                    <Form.Group controlId="formGroupPassword" className="form-group">
                      <Form.Label><b>Password:</b><span style={{ color: 'red' }}>*</span></Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handlePasswordBlur}
                        minLength={8}
                        maxLength={20}
                        required
                        placeholder="Enter your password"
                      />
                      {passwordError && (
                        <Alert variant="danger" className="mt-2">
                          Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 special character, and 1 number.
                        </Alert>
                      )}
                      <Form.Text className="text-muted">
                        Your password must be 8-20 characters long, contain letters and numbers, and must not contain spaces or emojis.
                      </Form.Text>
                    </Form.Group>
                    <div className="text-center">
                      <Button variant="primary" type="submit" className="mt-3">
                        Register
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </fieldset>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminPassword;
