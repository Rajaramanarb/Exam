// app/homepage/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const HomePage: React.FC = () => {
  const router = useRouter();
  const [licenseText, setLicenseText] = useState<string>('');
  const [licenseVersion, setLicenseVersion] = useState<number>(0);

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  const userName = user ? user.name : 'Guest';

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  useEffect(() => {
    const fetchLicense = async () => {
      try {
        const response = await fetch('/api/license');
        if (response.ok) {
          const data = await response.json();
          setLicenseText(data.text);
          setLicenseVersion(data.version);
        } else {
          console.error('Failed to fetch license:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching license:', error);
      }
    };

    fetchLicense();
  }, []);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <Link className="navbar-brand" href="/">Home</Link>
          <div className="collapse navbar-collapse justify-content-end">
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                Welcome, {userName}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="#/action-1">Statistics</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Profile</Dropdown.Item>
                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </nav>

      <div className="container-fluid" style={{ height: '70cm', display: 'flex' }}>
        <div style={{ width: '20cm', backgroundColor: '#e9ecef', padding: '10px' }}>
          <ul className="list-group">
            <li className="list-group-item"><Link href="/take-exam">Take an Exam</Link></li>
            <li className="list-group-item"><Link href="/ExamForm">Host an Exam</Link></li>
          </ul>
          <div className="mt-3">
            <p>Ad Space</p>
          </div>
        </div>

        <div style={{ width: '60cm', height: '70cm', overflowY: 'auto', padding: '10px' }}>
          <div>
            <p>Main content area</p>
          </div>
        </div>

        <div style={{ width: '20cm', backgroundColor: '#e9ecef', padding: '10px' }}>
          <ul className="list-group">
            <li className="list-group-item"><Link href="/Registration">Sign Up</Link></li>
            <li className="list-group-item"><Link href="/login">Login</Link></li>
          </ul>
          <div className="mt-3">
            <p>Ad Space</p>
          </div>
        </div>
      </div>

      <footer className="bg-light text-center text-lg-start" style={{ height: '5cm' }}>
        <div className="container p-4">
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
              <h5 className="text-uppercase">License & Agreement</h5>
              <p>{licenseText || 'Loading...'}</p>
            </div>
            <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
              <h5 className="text-uppercase">Contact Us</h5>
              <p>Details about how to contact us.</p>
            </div>
            <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
              <h5 className="text-uppercase">About Us</h5>
              <p>Information about us.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
