import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const License = () => {
  const [licenseText, setLicenseText] = useState('');
  const [version, setVersion] = useState(null);
  const [newText, setNewText] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL_DEVELOPMENT;

  useEffect(() => {
    // Fetch the existing license when the component mounts
    const fetchLicense = async () => {
      try {
        const response = await axios.get(`${apiUrl}/license`);
        setLicenseText(response.data.text);
        setVersion(response.data.version);
      } catch (error) {
        setError('Error fetching license');
      }
    };

    fetchLicense();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${apiUrl}/license`, { text: newText });
      setMessage(response.data.message);
      setError('');
      // Optionally, refresh the license data
      setLicenseText(newText);
      setVersion((prev) => prev + 1);
    } catch (error) {
      setMessage('');
      setError('Error updating license');
    }
  };

  return (
    <Container className="mt-4">
      <h1>License and Agreement</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      {licenseText && (
        <>
          <h3>Current License (Version {version})</h3>
          <p>{licenseText}</p>
        </>
      )}

      <Form onSubmit={handleUpdate}>
        <Form.Group controlId="licenseText">
          <Form.Label>Update License Text</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter new license text"
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Update License
        </Button>
      </Form>
    </Container>
  );
};

export default License;
