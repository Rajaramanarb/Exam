import React, { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import '../css/RegistrationForm.css'; // Import custom CSS for LoginForm styling
import { toast } from 'react-toastify';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [nameError, setNameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check if the input field is the password field and remove spaces and emojis
    if (name === 'password') {
      const trimmedValue = value.replace(/\s/g, ''); // Remove spaces
      const filteredValue = trimmedValue.replace(/[\uD800-\uDFFF].|[\u2702-\u27B0]|[\u2934\u2935]|[\u2B05-\u2B07\u2B1B\u2B1C\u2B50]|[\u3297\u3299\u303D\u00A9\u00AE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA]|[\u25AA-\u25AB\u25B6\u25C0\u25FB-\u25FE]|[\u2600-\u26FF]|[\u2708-\u2764]|[\u2795-\u2797\u27A1\u27B0]|[\u27BF]|[\uE000-\uF8FF]/g, ''); // Remove emojis
      setFormData({ ...formData, [name]: filteredValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };  

  const handleNameBlur = (e) => {
    const { value } = e.target;
    if (!/^[A-Za-z\s]+$/.test(value)) {
      setNameError(true);
    } else {
      setNameError(false);
    }
  };

  const handleEmailBlur = (e) => {
    const { value } = e.target;
    // Add email validation if necessary
  };

  const handlePasswordBlur = (e) => {
    const { value } = e.target;
    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(value)) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameError && !passwordError) {
      try {
        const response = await fetch('http://localhost:5000/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          console.log('User registered successfully');
          toast.success('User registered successfully');
        } else {
          console.error('Registration failed');
        }
      } catch (error) {
        console.error('Error during registration:', error);
      }
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <fieldset className="login-form-container">
            <div className="registration-container">
              <div className="registration-box">
                <h2 className="text-center mb-4">Registration</h2>
                <Form onSubmit={handleSubmit} className="login-form">
                  <Form.Group controlId="formGroupName" className="form-group">
                    <Form.Label className="form-label">Name:<span style={{ color: 'red' }}>*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleNameBlur}
                      required
                    />
                    {nameError && <Alert variant="danger">Name can only contain alphabetic characters and spaces.</Alert>}
                  </Form.Group>

                  <Form.Group controlId="formGroupEmail" className="form-group">
                    <Form.Label className="form-label">Email address:<span style={{ color: 'red' }}>*</span></Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleEmailBlur}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="formGroupPassword" className="form-group">
                    <Form.Label className="form-label">Password:<span style={{ color: 'red' }}>*</span></Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handlePasswordBlur}
                      minLength={8}
                      maxLength={20}
                      required
                    />
                    {passwordError && <Alert variant="danger">Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 special character, and 1 number.</Alert>}
                    <Form.Text className="text-muted">
                      Your password must be 8-20 characters long, contain letters and numbers, and must not contain spaces or emojis.
                    </Form.Text>
                  </Form.Group>

                  <div className="text-center">
                    <Button variant="primary" type="submit">
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
  );
};

export default RegistrationForm;
