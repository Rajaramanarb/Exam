import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";

const HomePage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [licenseText, setLicenseText] = useState(localStorage.getItem('license') || '');
  const [licenseVersion, setLicenseVersion] = useState(localStorage.getItem('licenseVersion') || 0);
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL_PRODUCTION
    : process.env.REACT_APP_API_URL_DEVELOPMENT;

  useEffect(() => {
    const fetchLicense = async () => {
      try {
        const response = await fetch(`http://localhost:9000/license`);
        if (response.ok) {
          const data = await response.json();
          if (data.version > licenseVersion) {
            localStorage.setItem('license', data.text);
            localStorage.setItem('licenseVersion', data.version);
            setLicenseText(data.text);
            setLicenseVersion(data.version);
          }
        } else {
          console.error('Failed to fetch license:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching license:', error);
      }
    };

    fetchLicense();
  }, [licenseVersion]);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">Home</Link>
          <div className="collapse navbar-collapse justify-content-end">
            <Dropdown>
              <Dropdown.Toggle variant="btn btn-primary me-2" id="dropdown-basic">
                Welcome, {user?.firstName || 'Guest'} 
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="statistics">Statistics</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <SignedOut>
              <SignInButton mode='modal' className="btn btn-primary me-2" />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid" style={{ height: '70cm', display: 'flex' }}>
        {/* Left Sidebar */}
        <div style={{ width: '20cm', backgroundColor: '#e9ecef', padding: '10px' }}>
          <ul className="list-group">
            <SignedIn>
              <li className="list-group-item"><Link to="/TakeExam">Take an Exam</Link></li>
              <li className="list-group-item"><Link to="/ExamForm">Host an Exam</Link></li>
            </SignedIn>
            <SignedOut>
              <li className="list-group-item" onClick={() => alert('Please sign in to take an exam.')}>Take an Exam</li>
              <li className="list-group-item" onClick={() => alert('Please sign in to host an exam.')}>Host an Exam</li>
            </SignedOut>
          </ul>
          <div className="mt-3">
            <p>Ad Space</p>
          </div>
        </div>
        
        {/* Middle Content */}
        <div style={{ width: '60cm', height: '70cm', overflowY: 'auto', padding: '10px' }}>
          <div>
            {/* Your main content goes here */}
            <p>Main content area</p>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ width: '20cm', backgroundColor: '#e9ecef', padding: '10px' }}>
          <ul className="list-group">
            <SignedIn>
              <li className="list-group-item"><Link to="/HostedExam">My Exams</Link></li>
            </SignedIn>
            <SignedOut>
              <li className="list-group-item" onClick={() => alert('Please sign in to see my exams.')}>My Exams</li>
            </SignedOut>
          </ul>
          <div className="mt-3">
            <p>Ad Space</p>
          </div>
        </div>
      </div>

      {/* Footer */}
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
