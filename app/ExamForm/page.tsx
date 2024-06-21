"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation'; // Import from next/navigation instead of next/router
import moment from 'moment';
import { Container, TextField, Button, Typography } from '@mui/material';

const ExamForm: React.FC = () => {
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

  const router = useRouter(); // Use useRouter from next/navigation

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExamDetails({
      ...examDetails,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const examData = {
        ...examDetails,
        Exam_Valid_Upto: moment(examDetails.Exam_Valid_Upto).format('YYYY-MM-DD hh:mm A')
      };

      const response = await axios.post('/api/exam', examData);
      console.log('Exam details saved:', response.data);
      toast.success('Exam details saved');
      //router.push(`/QuestionForm/${response.data.Exam_Id}/${examDetails.No_of_Questions}`);
    } catch (error) {
      console.error('Error saving exam details:', error);
      toast.error('Error saving exam details');
    }
  };

  return (
    <Container maxWidth="sm" className="mt-5">
      <Typography variant="h2" gutterBottom>Exam Form</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Exam Description"
          name="Exam_Desc"
          value={examDetails.Exam_Desc}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          type="number"
          label="Difficulty Level"
          name="Difficulty_Level"
          value={examDetails.Difficulty_Level}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Subject"
          name="Subject"
          value={examDetails.Subject}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Exam Category"
          name="Exam_Category"
          value={examDetails.Exam_Category}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          type="number"
          label="Number of Questions"
          name="No_of_Questions"
          value={examDetails.No_of_Questions}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          type="number"
          label="Exam Duration (minutes)"
          name="Exam_Duration"
          value={examDetails.Exam_Duration}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          type="number"
          label="Question Duration (minutes)"
          name="Question_Duration"
          value={examDetails.Question_Duration}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Author Name"
          name="Author_Name"
          value={examDetails.Author_Name}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          type="datetime-local"
          label="Exam Valid Up To"
          name="Exam_Valid_Upto"
          value={examDetails.Exam_Valid_Upto}
          onChange={handleChange}
          required
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 4 }}
        />
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
    </Container>
  );
};

export default ExamForm;
