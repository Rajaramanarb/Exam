import React from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const HomePage = () => {

  const userName = "John Doe"; // Replace with dynamic user name

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/HomePage">Home</Link>
          <div className="collapse navbar-collapse justify-content-end">
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                Welcome, {userName}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item href="#/action-1">Statistics</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Profile</Dropdown.Item>
                <Dropdown.Item href="/">Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid" style={{ height: '70cm', display: 'flex' }}>
        {/* Left Sidebar */}
        <div style={{ width: '20cm', backgroundColor: '#e9ecef', padding: '10px' }}>
          <ul className="list-group">
            <li className="list-group-item"><Link to="/take-exam">Take an Exam</Link></li>
            <li className="list-group-item"><Link to="/host-exam">Host an Exam</Link></li>
          </ul>
          <div className="mt-3">
            <p>Ad Space</p>
          </div>
        </div>
        
        {/* Middle Content */}
        <div style={{ width: '60cm', height: '70cm', overflowY: 'auto', padding: '10px' }}>
          <div>
            {/* Your main content goes here */}
            <p>Main content area with scroll bar</p>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ width: '20cm', backgroundColor: '#e9ecef', padding: '10px' }}>
          <ul className="list-group">
            <li className="list-group-item"><Link to="/Registration">Sign Up</Link></li>
            <li className="list-group-item"><Link to="/">Login</Link></li>
          </ul>
          <div className="mt-3">
            <p>Ad Space</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-light text-center text-lg-start" style={{ height: '10cm' }}>
        <div className="container p-4">
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
              <h5 className="text-uppercase">License & Agreement</h5>
              <p>Details about license and agreement.</p>
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
