import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ExamForm = () => {
  const [examDetails, setExamDetails] = useState({
    Exam_Desc: '',
    Difficulty_Level: '',
    Subject: '',
    Exam_Category: '',
    No_of_Questions: '',
    Exam_Duration: '',
    Question_Duration: '',
    Author_Name: '',
    Exam_Valid_Upto: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExamDetails({
      ...examDetails,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/exams', examDetails);
      console.log('Exam details saved:', response.data);
      toast.success('Exam details saved');
    } catch (error) {
      console.error('Error saving exam details:', error);
      toast.error('Error saving exam details');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Exam Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Exam Description</label>
          <input
            type="text"
            className="form-control"
            name="Exam_Desc"
            value={examDetails.Exam_Desc}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Difficulty Level</label>
          <input
            type="number"
            className="form-control"
            name="Difficulty_Level"
            value={examDetails.Difficulty_Level}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Subject</label>
          <input
            type="text"
            className="form-control"
            name="Subject"
            value={examDetails.Subject}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Exam Category</label>
          <input
            type="text"
            className="form-control"
            name="Exam_Category"
            value={examDetails.Exam_Category}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Number of Questions</label>
          <input
            type="number"
            className="form-control"
            name="No_of_Questions"
            value={examDetails.No_of_Questions}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Exam Duration (minutes)</label>
          <input
            type="number"
            className="form-control"
            name="Exam_Duration"
            value={examDetails.Exam_Duration}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Question Duration (minutes)</label>
          <input
            type="number"
            className="form-control"
            name="Question_Duration"
            value={examDetails.Question_Duration}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Author Name</label>
          <input
            type="text"
            className="form-control"
            name="Author_Name"
            value={examDetails.Author_Name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Exam Valid Up To</label>
          <input
            type="datetime-local"
            className="form-control"
            name="Exam_Valid_Upto"
            value={examDetails.Exam_Valid_Upto}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default ExamForm;
