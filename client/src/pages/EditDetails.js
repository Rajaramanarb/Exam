import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Alert } from 'react-bootstrap';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '@clerk/clerk-react';
import '../css/ExamForm.css';

const EditDetails = () => {
  const { user } = useUser();
  const { examId } = useParams();
  const navigate = useNavigate();
  const [examDetails, setExamDetails] = useState({});
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [questionDetails, setQuestionDetails] = useState({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [authoredQuestions, setAuthoredQuestions] = useState([]);
  const [error, setError] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [deletedQuestions, setDeletedQuestions] = useState([]);
  const [setQuestionSubject] = useState('');
  const questionSubjectOptions = {
    NEET: ['Physics', 'Chemistry', 'Botany', 'Zoology'],
    JEE: ['Physics', 'Chemistry', 'Maths']
  };

  const [examDetailsOriginal, setExamDetailsOriginal] = useState({});
  const [questionDetailsOriginal, setQuestionDetailsOriginal] = useState({});

  const apiUrl = process.env.REACT_APP_API_URL_DEVELOPMENT;

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const response = await axios.get(`${apiUrl}/exams/${examId}`);
        setExamDetails(response.data);
        setExamDetailsOriginal(response.data);
      } catch (error) {
        //toast.error('Error fetching exam details:');
        console.error('Error fetching exam details:', error);
      }
    };

    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${apiUrl}/questions/${examId}`);
        setQuestions(response.data);
        setQuestionDetailsOriginal(response.data);
      } catch (error) {
        //toast.error('Error fetching questions');
        console.error('Error fetching questions:', error);
      }
    };

    const fetchAuthoredQuestions = async () => {
      try {
        if (user && user.id) {
          const response = await axios.get(`${apiUrl}/author-questions/${user.id}`);
          const filteredQuestions = response.data.filter(q => q.Question && q.Question.trim() !== '');
          setAuthoredQuestions(filteredQuestions);
        }
      } catch (error) {
        //toast.error('Error fetching authored questions');
        console.error('Error fetching authored questions:', error);
      }
    };

    if (user) {
      fetchExamDetails();
      fetchQuestions();
      fetchAuthoredQuestions();
    }
  }, [examId, user]);

  useEffect(() => {
    if (examDetails.No_of_Questions) {
      setExamDetails((prevDetails) => ({
        ...prevDetails,
        Questions_To_Attend: prevDetails.No_of_Questions
      }));
    }
  }, [examDetails.No_of_Questions]);

  const [noOfQuestionsError, setNoOfQuestionsError] = useState('');
  const [questionsToAttendError, setQuestionsToAttendError] = useState('');

  const [subjects, setSubjects] = useState({});
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    // Fetch subjects when the component mounts
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`${apiUrl}/subjects`);
        setSubjects(response.data);        
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    const fetchChapters = async () => {
      if (examDetails.Subject) {
        const fetchedChapters = subjects[examDetails.Subject] || [];
        setChapters(fetchedChapters);
      }
    };

    fetchSubjects();
    fetchChapters();
  }, [apiUrl, examDetails.Subject, subjects]);

  const handleExamChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'Exam_Category') {
      setQuestionDetails(prevDetails => ({
        ...prevDetails,
        Subject: '',
        Chapter: '',
        Exam_Category: value
      }));
    }

    if (name === 'Subject') {
      // Update the chapters dropdown based on the selected subject
      setChapters(subjects[value] || []);
    }

    if (name === 'Questions_To_Attend') {
      const numValue = Number(value);
      if (numValue > examDetails.No_of_Questions) {
        setQuestionsToAttendError('Questions to attend cannot be more than the total number of questions.');
      } else if (numValue < 1) {
        setQuestionsToAttendError('Questions to attend cannot be less than 1.');
      } else {
        setQuestionsToAttendError(''); // Clear error if validation passes
      }
    }

    if (name === 'No_of_Questions') {
      const numValue = Number(value);
      if (numValue < 1) {
        setNoOfQuestionsError('Number of questions cannot be less than 1.');
      } else {
        setNoOfQuestionsError(''); // Clear error if validation passes
      }
    }

    setExamDetails({
      ...examDetails,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const getSubjects = () => {
    if (['NEET_Subjectwise', 'NEET_Chapterwise'].includes(examDetails.Exam_Category)) {
      return ['Physics', 'Chemistry', 'Botany', 'Zoology'];
    } else if (['JEE_Subjectwise', 'JEE_Chapterwise'].includes(examDetails.Exam_Category)) {
      return ['Physics', 'Chemistry', 'Maths'];
    }
    return [];
  };

  const handleQuestionChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'Image' && files.length > 0) {
      // Create a URL for the new image file to preview it immediately
      const imageUrl = URL.createObjectURL(files[0]);
      setQuestionDetails({
        ...questionDetails,
        Image: files[0],
        ImagePreview: imageUrl, // Add a new property for image preview
      });
    } else {
      setQuestionDetails({
        ...questionDetails,
        [name]: value,
      });
    }
  };

  const handleAuthoredQuestionSelect = (e) => {
    const selectedQuestionId = e.target.value;
    setSelectedQuestionId(selectedQuestionId);
    const selectedQuestion = authoredQuestions.find(question => question.Question_ID === parseInt(selectedQuestionId));
    if (selectedQuestion) {
      setQuestionDetails(selectedQuestion);
    } else {
      setQuestionDetails({
        Question: '',
        Answer_1: '',
        Answer_2: '',
        Answer_3: '',
        Answer_4: '',
        Correct_Answer: '',
        Difficulty_Level: '',
        Question_Subject: '', 
        Image: null        
      });
    }
  };

  const handleQuestionDelete = (index) => {
    const questionId = questions[index].Question_ID;
    setDeletedQuestions([...deletedQuestions, questionId]);

    setExamDetails(prevDetails => ({
      ...prevDetails,
      No_of_Questions: prevDetails.No_of_Questions - 1
    }));

    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };   

  const handleQuestionEdit = (index) => {
    setQuestionIndex(index);
    setQuestionDetails(questions[index]);
    setShowModal(true);
  };

  // const handleQuestionPrevious = () => {
  //   if (questionIndex > 0) {
  //     const prevIndex = questionIndex - 1;
  //     setQuestionIndex(prevIndex);
  //     setQuestionDetails(questions[prevIndex]);
  //   }
  // };

  // const handleQuestionNext = () => {
  //   if (questionIndex < questions.length - 1) {
  //     const nextIndex = questionIndex + 1;
  //     setQuestionIndex(nextIndex);
  //     setQuestionDetails(questions[nextIndex]);
  //   } else {
  //     setShowModal(false);
  //   }
  // };

  // const handleQuestionSave = () => {
  //   const updatedQuestions = [...questions];
  //   updatedQuestions[questionIndex] = questionDetails;
  //   setQuestions(updatedQuestions);
  //   setQuestionDetails({
  //     Question: '',
  //     Answer_1: '',
  //     Answer_2: '',
  //     Answer_3: '',
  //     Answer_4: '',
  //     Correct_Answer: '',
  //     Difficulty_Level: '',
  //     Question_Subject: '',
  //     Image: null 
  //   });
  //   setSelectedQuestionId('');
  //   setShowModal(false);
    
  //   setTimeout(() => {
  //     alert("Please click on update button to save your details.");
  //   }, 300);
  // };

  const saveCurrentQuestion = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = questionDetails;
    setQuestions(updatedQuestions);
  };
  
  const resetQuestionDetails = () => {
    setQuestionDetails({
      Question: '',
      Answer_1: '',
      Answer_2: '',
      Answer_3: '',
      Answer_4: '',
      Correct_Answer: '',
      Difficulty_Level: '',
      Question_Subject: '',
      Image: null 
    });
    setSelectedQuestionId('');
  };
  
  const handleQuestionPrevious = () => {
    if (questionIndex > 0) {
      saveCurrentQuestion();
      const prevIndex = questionIndex - 1;
      setQuestionIndex(prevIndex);
      setQuestionDetails(questions[prevIndex]);
    }
  };
  
  const handleQuestionNext = () => {
    if (questionIndex < questions.length - 1) {
      saveCurrentQuestion();
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setQuestionDetails(questions[nextIndex]);
    } else {
      setShowModal(false);
    }
  };
  
  const handleQuestionSave = () => {
    saveCurrentQuestion();
    resetQuestionDetails();
    setShowModal(false);
  
    setTimeout(() => {
      alert("Please click on update button to save your details.");
    }, 300);
  };  

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const examData = {
        ...examDetails,
        Exam_Valid_Upto: moment(examDetails.Exam_Valid_Upto).format('YYYY-MM-DD hh:mm A'),
        Publish_Date: moment(examDetails.Publish_Date).format('YYYY-MM-DD hh:mm A'),
      };
      if (examDetails !== examDetailsOriginal && questionDetails !== questionDetailsOriginal) {
        examData.isApproved = null;
      }
      await axios.put(`${apiUrl}/exams/${examId}`, examData);
  
      // Handle deleted questions
      for (let i = 0; i < deletedQuestions.length; i++) {
        await axios.delete(`${apiUrl}/questions/${deletedQuestions[i]}`);
      }
  
      for (let i = 0; i < questions.length; i++) {
        const formData = new FormData();
        if (questions[i].Question_ID) {
          const questionExists = authoredQuestions.find(q => q.Question_ID === questions[i].Question_ID);
          if (questionExists) {
            const updatedQuestion = {
              ...questions[i],
              Exam_ID: [...new Set([...questionExists.Exam_ID, parseInt(examId)])]
            };
            if (questions[i].Image instanceof File) {
              formData.append('Image', questions[i].Image);
            }
            formData.append('Question', updatedQuestion.Question);
            formData.append('Answer_1', updatedQuestion.Answer_1);
            formData.append('Answer_2', updatedQuestion.Answer_2);
            formData.append('Answer_3', updatedQuestion.Answer_3);
            formData.append('Answer_4', updatedQuestion.Answer_4);
            //formData.append('Correct_Answer', updatedQuestion.Correct_Answer);
            updatedQuestion.Correct_Answer === undefined
            ? formData.append('Correct_Answer', null)
            : formData.append('Correct_Answer', updatedQuestion.Correct_Answer);          
            formData.append('Difficulty_Level', updatedQuestion.Difficulty_Level);
            formData.append('Exam_ID', examId);
            formData.append('Author_Id', user.id);
            if (questions[i].Question_Subject) {
              formData.append('Question_Subject', questions[i].Question_Subject);
            }
  
            await axios.put(`${apiUrl}/questions/${questions[i].Question_ID}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
          } else {
            // Handle new questions
            formData.append('Exam_ID', examId);
            formData.append('Author_Id', user.id);
            formData.append('Question', questions[i].Question);
            formData.append('Answer_1', questions[i].Answer_1);
            formData.append('Answer_2', questions[i].Answer_2);
            formData.append('Answer_3', questions[i].Answer_3);
            formData.append('Answer_4', questions[i].Answer_4);
            //formData.append('Correct_Answer', parseInt(questions[i].Correct_Answer));
            questions[i].Correct_Answer === undefined
            ? formData.append('Correct_Answer', null)
            : formData.append('Correct_Answer', parseInt(questions[i].Correct_Answer));    
            formData.append('Difficulty_Level', questions[i].Difficulty_Level);
            if (questions[i].Question_Subject) {
              formData.append('Question_Subject', questions[i].Question_Subject);
            }
            if (questions[i].Image) {
              formData.append('Image', questions[i].Image);
            }
  
            await axios.post(`${apiUrl}/questions`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
          }
        } else {
          // Handle new questions
          formData.append('Exam_ID', examId);
          formData.append('Author_Id', user.id);
          formData.append('Question', questions[i].Question);
          formData.append('Answer_1', questions[i].Answer_1);
          formData.append('Answer_2', questions[i].Answer_2);
          formData.append('Answer_3', questions[i].Answer_3);
          formData.append('Answer_4', questions[i].Answer_4);
          //formData.append('Correct_Answer', parseInt(questions[i].Correct_Answer));
          questions[i].Correct_Answer === undefined
            ? formData.append('Correct_Answer', null)
            : formData.append('Correct_Answer', questions[i].Correct_Answer);    
          formData.append('Difficulty_Level', parseInt(questions[i].Correct_Answer));
          if (questions[i].Question_Subject) {
            formData.append('Question_Subject', questions[i].Question_Subject);
          }
          if (questions[i].Image) {
            formData.append('Image', questions[i].Image);
          }
  
          await axios.post(`${apiUrl}/questions`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
      }
      toast.success('Exam and questions updated successfully');
      navigate('/');
    } catch (error) {
      //toast.error('Error updating exam and questions');
      console.error('Error updating exam and questions:', error);
    } finally {
      setIsSubmitting(false); // Re-enable the button after request completion
    }
  };  

  useEffect(() => {
    setExamDetails(prevDetails => ({
      ...prevDetails,
      Question_Duration: (prevDetails.Exam_Duration / prevDetails.Questions_To_Attend).toFixed(1),
    }));
  }, [examDetails.Exam_Duration, examDetails.Questions_To_Attend]);

  useEffect(() => {
    if (examDetails.No_of_Questions > questions.length) {
      const newQuestions = Array(examDetails.No_of_Questions - questions.length).fill({
        Question: '',
        Answer_1: '',
        Answer_2: '',
        Answer_3: '',
        Answer_4: '',
        Correct_Answer: '',
        Difficulty_Level: '',
        Question_Subject: '',
        Image: null 
      });
      setQuestions([...questions, ...newQuestions]);
    }
  }, [examDetails.No_of_Questions, questions]);

  const handleCloseModal = () => {
    setShowModal(false);
    setQuestionDetails({});
    setQuestionIndex(0);
  };

  useEffect(() => {
    if ((examDetails.Author_Id && examDetails.Author_Id !== user.id) && (user?.id && user?.id !== process.env.REACT_APP_ADMIN_ID)) {
      navigate('/Unauthorized', { state: { from: `/EditDetails/${examDetails.Exam_Id}` } }); // Redirect to an unauthorized or error page
    }
  }, [examDetails, user, navigate]);  

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <a className="navbar-brand" href="/">Home</a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <a className="nav-link" href="/TakeExam">Take Exam</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/HostedExam">My Exam <span className="sr-only">(current)</span></a>
              </li>
            </ul>

            <div className="collapse navbar-collapse justify-content-end">
              <span className="navbar-text">
                Welcome, {user?.firstName || 'Guest'} 
              </span>
            </div>
          </div>
        </nav>
      <div className="container">
        <h2>Edit Exam Details</h2>
        <form onSubmit={handleExamSubmit} className="p-4 border rounded shadow-sm">
          <div className="row">
            <div className="col-md-6">
            <div className="mb-3 d-flex align-items-center">
              <div className="me-0">
                <label className="form-label fw-bold">Exam Category<span style={{ color: 'red' }}>*</span></label>
                  <select
                    className="form-control"
                    name="Exam_Category"
                    value={examDetails.Exam_Category}
                    onChange={handleExamChange}
                    required
                    style={{ width: '290px' }} 
                  >
                    <option value="">Select Category</option>
                    <option value="LowerGrade">Lower Grade</option>
                    <option value="College">College</option>
                    <option value="NEET">NEET</option>
                    <option value="NEET_Chapterwise">NEET Chapterwise</option>
                    <option value="NEET_Subjectwise">NEET Subjectwise</option>
                    <option value="JEE">JEE</option>                
                    <option value="JEE_Chapterwise">JEE Chapterwise</option>
                    <option value="JEE_Subjectwise">JEE Subjectwise</option>
                    <option value="Others">Others</option>
                  </select>
              </div>            
              <div className="form-check mb-0">               
                <label className="form-label fw-bold">Exam Description<span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="Exam_Desc"
                  placeholder="Enter the exam description"
                  value={examDetails.Exam_Desc}
                  onChange={handleExamChange}
                  required
                  style={{ width: '290px' }} 
                />
              </div>
            </div>
            <div className="mb-3 d-flex align-items-center">
              {['NEET_Subjectwise', 'NEET_Chapterwise', 'JEE_Subjectwise', 'JEE_Chapterwise'].includes(examDetails.Exam_Category) ? (
                <div className="me-0">
                  <label className="form-label fw-bold">
                    Subject<span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    className="form-control"
                    name="Subject"
                    value={examDetails.Subject}
                    onChange={handleExamChange}
                    required
                    style={{ width: '130px' }} 
                  >
                    <option value="">Select Subject</option>
                    {getSubjects().map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              ) : examDetails.Exam_Category === 'NEET' || examDetails.Exam_Category === 'JEE' ? (
                <div></div>
              ) : (
                <div className="me-3">
                  <label className="form-label fw-bold">Subject<span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="Subject"
                    placeholder="Enter the subject"
                    value={examDetails.Subject}
                    onChange={handleExamChange}
                    required
                    style={{ width: '290px' }} 
                  />
                </div>
              )}
              {['NEET_Chapterwise', 'JEE_Chapterwise'].includes(examDetails.Exam_Category) && (
                <div className="form-check mb-0">
                  <label className="form-label fw-bold">
                    Chapter<span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    className="form-control"
                    name="Chapter"
                    value={examDetails.Chapter}
                    onChange={handleExamChange}
                    required
                    style={{ width: '450px' }} 
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map((chapter, index) => (
                      <option key={index} value={chapter}>
                        {chapter}
                      </option>
                    ))}
                  </select>
                </div>
              )}    
            </div>                     
            <div className="mb-3">
              <label className="form-check-label fw-bold me-4" htmlFor="flexCheckbox">Negative Marking</label>
                <input
                  type="checkbox"
                  className="form-check-input custom-checkbox"
                  id="flexCheckbox"
                  name="Negative_Marking"
                  checked={examDetails.Negative_Marking}
                  onChange={handleExamChange}
                />
            </div>
            </div>
            {/* <div className="mb-3">
              <label className="form-label fw-bold">Question Duration (minutes)<span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                className="form-control"
                name="Question_Duration"                
                value={examDetails.Question_Duration}
                readOnly
                required
              />
            </div>   */}         
          <div className="col-md-6">
            <div className="mb-3 d-flex align-items-center">
              <div className="mb-0">
                  <label className="form-label fw-bold">Exam Duration (minutes)<span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    name="Exam_Duration"
                    placeholder="Enter the exam duration in minutes"
                    value={examDetails.Exam_Duration}
                    onChange={handleExamChange}
                    required
                    style={{ width: '290px' }} 
                  />               
              </div>
              <div className="form-check mb-0">
                <label className="form-label fw-bold">Difficulty Level<span style={{ color: 'red' }}>*</span></label>
                <select
                  className="form-control"
                  name="Difficulty_Level"
                  value={examDetails.Difficulty_Level}
                  onChange={handleExamChange}
                  required
                  style={{ width: '290px' }} 
                >
                  <option value="">Select Difficulty Level</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>       
            </div>
            <div className="mb-3 d-flex align-items-center">     
              <div className="mb-0">
                <label className="form-label fw-bold">
                  Number of Questions<span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="No_of_Questions"
                  placeholder="Enter the number of questions"
                  value={examDetails.No_of_Questions}
                  onChange={handleExamChange}
                  required
                  style={{ width: '290px' }}
                />
                {noOfQuestionsError && <Alert variant="danger">{noOfQuestionsError}</Alert>}
              </div>
              <div className="form-check mb-0">
                <label className="form-label fw-bold">
                  Questions To Attend<span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="Questions_To_Attend"
                  placeholder="Enter no of questions to attend"
                  value={examDetails.Questions_To_Attend}
                  onChange={handleExamChange}
                  required
                  style={{ width: '290px' }}
                />
                {questionsToAttendError && <Alert variant="danger">{questionsToAttendError}</Alert>}
              </div>
            </div>
            <div className="mb-3 d-flex align-items-center">
              <div className="mb-0">
                  <label className="form-label fw-bold">Publish Date<span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="Publish_Date"
                    value={moment(examDetails.Publish_Date).format('YYYY-MM-DDTHH:mm')}
                    onChange={(e) => {
                    handleExamChange(e);
                    e.target.blur(); // Force the calendar to close after selection
                    }}
                    required
                    style={{ width: '290px' }}
                  />
              </div>  
              <div className="form-check mb-0">
                <label className="form-label fw-bold">Exam Valid Up To<span style={{ color: 'red' }}>*</span></label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="Exam_Valid_Upto"
                  value={moment(examDetails.Exam_Valid_Upto).format('YYYY-MM-DDTHH:mm')}
                  onChange={(e) => {
                    handleExamChange(e);
                    e.target.blur(); // Force the calendar to close after selection
                  }}
                  required
                  style={{ width: '290px' }}
                />
              </div>
            </div>                      
          </div>
        </div>
          <div className="text-center">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update'}
          </button>
          </div>
        </form>

        <h2 className="mt-4">Edit Questions</h2>
        <Table className="table table-hover">
          <thead className="thead-dark">
            <tr>
              <th>Question</th>
              <th>Answer 1</th>
              <th>Answer 2</th>
              <th>Answer 3</th>
              <th>Answer 4</th>
              <th>Correct Answer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <tr key={index}>
                <td>{question.Question}</td>
                <td>{question.Answer_1}</td>
                <td>{question.Answer_2}</td>
                <td>{question.Answer_3}</td>
                <td>{question.Answer_4}</td>
                <td>{question.Correct_Answer}</td>
                <td>
                  <Button variant="warning" className="me-2 mb-2" onClick={() => handleQuestionEdit(index)}>✏️ Edit</Button>
                  <Button variant="danger" className="me-2 mb-2" onClick={() => handleQuestionDelete(index)}>🗑️ Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Edit Question</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
            <div className="mb-3">
                <label className="form-label fw-bold">Your Question</label>
                <select
                  className="form-control"
                  id="authoredQuestions"
                  name="authoredQuestions"
                  value={selectedQuestionId}
                  onChange={handleAuthoredQuestionSelect}
                >
                  <option value="">Select a question</option>
                  {authoredQuestions.map((q) => (
                    <option key={q.Question_ID} value={q.Question_ID}>
                      {q.Question}
                    </option>
                  ))}
                </select>
              </div>
              {examDetails.Exam_Category === 'NEET' || examDetails.Exam_Category === 'JEE' ? (
                <div className="mb-3">
                  <label className="form-label fw-bold">Question Subject<span style={{ color: 'red' }}>*</span></label>
                  <select
                    className="form-control"
                    name="Question_Subject"
                    value={questionDetails.Question_Subject}
                    onChange={handleQuestionChange}
                    //required
                  >
                    <option value="">Select Subject</option>
                    {questionSubjectOptions[examDetails.Exam_Category].map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div className="mb-3">
                <label className="form-label fw-bold">Question<span style={{ color: 'red' }}>*</span></label>
                <textarea
                  type="text"
                  className="form-control"
                  name="Question"
                  placeholder="Enter the question"
                  value={questionDetails.Question}
                  onChange={handleQuestionChange}
                  rows="3"
                  //required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Answer 1<span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="Answer_1"
                  placeholder="Enter answer 1"
                  value={questionDetails.Answer_1}
                  onChange={handleQuestionChange}
                  //required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Answer 2<span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="Answer_2"
                  placeholder="Enter answer 2" 
                  value={questionDetails.Answer_2}
                  onChange={handleQuestionChange}
                  //required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Answer 3<span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="Answer_3"
                  placeholder="Enter answer 3" 
                  value={questionDetails.Answer_3}
                  onChange={handleQuestionChange}
                  //required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Answer 4<span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="Answer_4"
                  placeholder="Enter answer 4" 
                  value={questionDetails.Answer_4}
                  onChange={handleQuestionChange}
                  //required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Correct Answer <span style={{ color: 'red' }}>*</span></label>
                <select
                  className="form-control"
                  name="Correct_Answer"
                  value={questionDetails.Correct_Answer}
                  onChange={(e) => setQuestionDetails({
                    ...questionDetails,
                    Correct_Answer: parseInt(e.target.value) // Convert to number
                  })}
                  //required
                >
                  <option value="">Select Correct Answer</option>
                  <option value="1">Answer 1</option>
                  <option value="2">Answer 2</option>
                  <option value="3">Answer 3</option>
                  <option value="4">Answer 4</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Difficulty Level<span style={{ color: 'red' }}>*</span></label>
                <select
                  className="form-control"
                  name="Difficulty_Level"
                  value={questionDetails.Difficulty_Level}
                  onChange={handleQuestionChange}
                  //required
                >
                  <option value="">Select Difficulty Level</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Add image</label>
                <input
                  className="form-control"
                  type="file"
                  name="Image"                
                  onChange={handleQuestionChange}
                />
              </div>
              {questionDetails.Image && (
                <div className="question-image mb-3">
                  <img 
                    src={questionDetails.ImagePreview || `${apiUrl}/${questionDetails.Image}`} 
                    alt="Question" 
                    className="img-fluid" 
                    style={{ maxWidth: '300px', maxHeight: '300px' }}
                  />
                </div>
              )}
            </form>
          </Modal.Body>
          <Modal.Footer>          
            {questionIndex > 0 && (
              <Button variant="secondary" onClick={handleQuestionPrevious}>
                Previous
              </Button>
            )}
            {questionIndex < questions.length - 1 && (
              <Button variant="primary" onClick={handleQuestionNext}>
              Next
            </Button>
            )}
            <Button variant="success" onClick={handleQuestionSave}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default EditDetails;
