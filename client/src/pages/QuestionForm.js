import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from 'react-router-dom';

const QuestionForm = () => {
  const { examId, noOfQuestions } = useParams();
  const navigate = useNavigate();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionDetails, setQuestionDetails] = useState({
    Question: '',
    Answer_1: '',
    Answer_2: '',
    Answer_3: '',
    Answer_4: '',
    Correct_Answer: ''
  });
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    if (isUpdate) {
      fetchQuestionDetails(questionIndex);
    }
  }, [questionIndex]);

  const fetchQuestionDetails = async (index) => {
    try {
      const response = await axios.get(`http://localhost:5000/questions/${examId}/${index}`);
      setQuestionDetails(response.data);
    } catch (error) {
      console.error('Error fetching question details:', error);
      toast.error('Error fetching question details');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestionDetails({
      ...questionDetails,
      [name]: value,
    });
  };

  const handleNext = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        Exam_ID: examId,
        ...questionDetails
      };

      if (isUpdate) {
        await axios.put(`http://localhost:5000/questions/${examId}/${questionIndex}`, questionData);
      } else {
        await axios.post('http://localhost:5000/questions', questionData);
      }

      if (questionIndex + 1 < noOfQuestions) {
        setQuestionIndex(questionIndex + 1);
        setQuestionDetails({
          Question: '',
          Answer_1: '',
          Answer_2: '',
          Answer_3: '',
          Answer_4: '',
          Correct_Answer: ''
        });
        toast.success('Question saved, please enter the next question');
      } else {
        toast.success('All questions saved');
        navigate('/');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Error saving question');
    }
  };

  const handlePrevious = async (e) => {
    e.preventDefault();
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
      setIsUpdate(true);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Question Form ({questionIndex + 1} of {noOfQuestions})</h2>
      <form onSubmit={handleNext}>
        <div className="mb-3">
          <label className="form-label">Question</label>
          <input
            type="text"
            className="form-control"
            name="Question"
            value={questionDetails.Question}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Answer 1</label>
          <input
            type="text"
            className="form-control"
            name="Answer_1"
            value={questionDetails.Answer_1}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Answer 2</label>
          <input
            type="text"
            className="form-control"
            name="Answer_2"
            value={questionDetails.Answer_2}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Answer 3</label>
          <input
            type="text"
            className="form-control"
            name="Answer_3"
            value={questionDetails.Answer_3}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Answer 4</label>
          <input
            type="text"
            className="form-control"
            name="Answer_4"
            value={questionDetails.Answer_4}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Correct Answer</label>
          <select
            className="form-control"
            name="Correct_Answer"
            value={questionDetails.Correct_Answer}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select the correct answer</option>
            <option value="1">Answer 1</option>
            <option value="2">Answer 2</option>
            <option value="3">Answer 3</option>
            <option value="4">Answer 4</option>
          </select>
        </div>
        <div className="d-flex justify-content-between">
          {questionIndex > 0 && (
            <button type="button" className="btn btn-secondary" onClick={handlePrevious}>
              Previous
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {questionIndex + 1 < noOfQuestions ? 'Next' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
