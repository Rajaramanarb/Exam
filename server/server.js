require('dotenv').config();

const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment-timezone');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const app = express();
const router = express.Router();
const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 9000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Exam',
});

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  photo: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
});

const User = mongoose.model('User', UserSchema);

const LicenseSchema = new mongoose.Schema({
  text: String,
  version: { type: Number, default: 1 },
});

const License = mongoose.model('License', LicenseSchema);

const ExamMasterSchema = new mongoose.Schema({
  Exam_Id: { type: Number, unique: true },
  Exam_Desc: { type: String, required: true },
  Difficulty_Level: { type: String, required: true },
  Subject: { type: String, required: true },
  Exam_Category: { type: String, required: true },
  No_of_Questions: { type: Number, required: true, min: 1, max: 9999 },
  Questions_To_Attend: { type: Number, required: true, min: 1, max: 9999 },
  Exam_Duration: { type: Number, required: true },
  Question_Duration: { type: Number, required: true },
  Author_Name: { type: String, required: true },
  Author_Id: { type: String, required: true },
  Audit_Details: {
    type: String,
    default: () => moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm A')
  },
  Publish_Date: { type: String, required: true },
  Exam_Valid_Upto: { type: String, required: true },
  Negative_Marking: { type: Boolean, required: true }
});

ExamMasterSchema.plugin(AutoIncrement, { inc_field: 'Exam_Id', start_seq: 1 });

const Exam_Master = mongoose.model('Exam_Master', ExamMasterSchema);

const QuestionMasterSchema = new mongoose.Schema({
  Exam_ID: { type: [Number], required: true, ref: 'Exam_Master' },
  Author_Id: { type: String, required: true },
  Question_ID: { type: Number, unique: true },
  Question: { type: String },
  Answer_1: { type: String },
  Answer_2: { type: String },
  Answer_3: { type: String },
  Answer_4: { type: String },
  Correct_Answer: { type: Number, min: 1, max: 4 },
  Difficulty_Level: { type: String }
});

QuestionMasterSchema.plugin(AutoIncrement, { inc_field: 'Question_ID', start_seq: 1 });

const Question_Master = mongoose.model('Question_Master', QuestionMasterSchema);

const ExamResultSchema = new mongoose.Schema({
  Exam_ID: { type: Number, required: true, ref: 'Exam_Master' },
  Author_Id: { type: String, required: true },
  Author_Name: { type: String, required: true },
  Score: { type: Number, required: true },
  Responses: [
    {
      Question_ID: { type: Number, required: true, ref: 'Question_Master' },
      Selected_Option: { type: Number, required: true },
      Correct_Answer: { type: Number, required: true },
      Is_Correct: { type: Boolean, required: true }
    }
  ],
  Rating: { type: Number, default: 0 }
});

const Exam_Result = mongoose.model('Exam_Result', ExamResultSchema);

router.get('/license', async (req, res) => {
  try {
    const license = await License.findOne();
    if (license) {
      res.json({ text: license.text, version: license.version });
    } else {
      res.status(404).json({ error: 'License and Agreement not found' });
    }
  } catch (error) {
    console.error('Error fetching license:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/license', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'License text is required' });
  }

  try {
    let license = await License.findOne();

    if (license) {
      license.text = text;
      license.version += 1;
      await license.save();
    } else {
      license = new License({ text, version: 1 });
      await license.save();
    }

    res.status(200).json({ message: 'License and Agreement updated successfully' });
  } catch (error) {
    console.error('Error updating license:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/exams', async (req, res) => {
  try {
    const examData = req.body;

    const newExam = new Exam_Master(examData);
    await newExam.save();
    res.status(201).json(newExam);
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/exams', async (req, res) => {
  try {
    const exams = await Exam_Master.find();
    res.status(200).json(exams);
  } catch (error) {
    console.error('Error retrieving exams:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const questionData = req.body;

    const newQuestion = new Question_Master(questionData);
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/questions/:examId/:index', async (req, res) => {
  try {
    const { examId, index } = req.params;
    const question = await Question_Master.findOne({ Exam_ID: examId }).skip(index);
    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/questions/:examId/:index', async (req, res) => {
  try {
    const { examId, index } = req.params;
    const questionData = req.body;

    const question = await Question_Master.findOne({ Exam_ID: examId }).skip(index);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    Object.assign(question, questionData);
    await question.save();
    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/questions/:examId', async (req, res) => {
  try {
    const { examId } = req.params;
    const question = await Question_Master.find({ Exam_ID: examId });
    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/author-questions/:authorId', async (req, res) => {
  try {
    const { authorId } = req.params;
    const question = await Question_Master.find({ Author_Id: authorId });
    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/questions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const questionData = req.body;

    const updatedQuestion = await Question_Master.findOneAndUpdate({ Question_ID : questionId }, questionData, { new: true });

    if (!updatedQuestion) {
      return res.status(404).send({ message: 'Question not found' });
    }

    res.status(200).send({ message: 'Question updated successfully', question: updatedQuestion });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).send({ message: 'Failed to update question' });
  }
});

router.put('/exams/:examId', async (req, res) => {
  try {
    const { examId } = req.params;
    const examData = req.body;
    
    const updatedExam = await Exam_Master.findOneAndUpdate({ Exam_Id: examId }, examData, { new: true });

    if (!updatedExam) {
      return res.status(404).send({ message: 'Exam not found' });
    }

    res.status(200).send({ message: 'Exam updated successfully', exam: updatedExam });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).send({ message: 'Failed to update exam' });
  }
});

router.get('/exams/:examId', async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam_Master.findOne({ Exam_Id: examId });

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.status(200).json(exam);
  } catch (error) {
    console.error('Error retrieving exam:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/exam-results', async (req, res) => {
  try {
    const examResult = new Exam_Result(req.body);
    await examResult.save();
    res.status(201).send(examResult);
  } catch (error) {
    console.error('Error saving exam result:', error.message);
    res.status(500).send({ message: 'Error saving exam result' });
  }
});

router.get('/exam-results/:authorId', async (req, res) => {
  try {
    const { authorId } = req.params;
    const results = await Exam_Result.find({ Author_Id: authorId });
    res.json(results);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).send('Error fetching exam results');
  }
});

router.get('/examresults/:examId', async (req, res) => {
  try {
    const { examId } = req.params;
    const results = await Exam_Result.findOne({ Exam_ID: examId });
    res.json(results);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).send('Error fetching exam results');
  }
});

router.get('/rating/:examId', async (req, res) => {
  try {
    const { examId } = req.params;
    const result = await Exam_Result.aggregate([
      { $match: { Exam_ID: Number(examId) } },
      { $group: { _id: '$Exam_Id', averageRating: { $avg: '$Rating' } } }
    ]);
    res.json(result);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    res.status(500).send('Error fetching exam results');
  }
});

router.get('/hosted-exams/:authorId', async (req, res) => {
  try {
    const { authorId } = req.params;
    const exams = await Exam_Master.find({ Author_Id: authorId });

    if (!exams) {
      return res.status(404).json({ error: 'No exams found for this user' });
    }

    res.status(200).json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.use('/', router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

mongoose.connection.on('connected', () => {
  console.log('🚀 Connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

module.exports.handler = serverless(app);