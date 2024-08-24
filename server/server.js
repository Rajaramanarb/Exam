require('dotenv').config();

const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment-timezone');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { title } = require('process');
const bcrypt = require('bcrypt');

const app = express();
const router = express.Router();
const PORT = process.env.PORT;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const adDir = path.join(__dirname, 'advertisements');
if (!fs.existsSync(adDir)) {
  fs.mkdirSync(adDir);
}

const adStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'advertisements/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const adUpload = multer({ storage: adStorage });
app.use('/advertisements', express.static(path.join(__dirname, 'advertisements')));


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

const MainContentSchema = new mongoose.Schema({
  title: String,
  text: String,
  version: { type: Number, default: 1 },
});

const MainContent = mongoose.model('MainContent', MainContentSchema);

const ExamMasterSchema = new mongoose.Schema({
  Exam_Id: { type: Number, unique: true },
  Exam_Desc: { type: String, required: true },
  Difficulty_Level: { type: String, required: true },
  Subject: String,
  Chapter: String,
  Exam_Category: { type: String, required: true },
  No_of_Questions: { type: Number, required: true, min: 1, max: 9999 },
  Questions_To_Attend: { type: Number, required: true, min: 1, max: 9999 },
  Exam_Duration: { type: Number, required: true },
  // Question_Duration: { type: Number, required: true },
  Author_Name: { type: String, required: true },
  Author_Id: { type: String, required: true },
  Audit_Details: {
    type: String,
    default: () => moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm A')
  },
  Publish_Date: { type: String, required: true },
  Exam_Valid_Upto: { type: String, required: true },
  Negative_Marking: { type: Boolean, required: true },
  isDeleted: { type: Boolean, required: true }
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
  Difficulty_Level: { type: String },
  Question_Subject: { type: String},
  Image: { type: String }
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

const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  time: {
    type: Number,
    required: true
  },
  adPath: {
    type: String,
    required: true
  }
});

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

const advertisementCounterSchema = new mongoose.Schema({
  adId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advertisement',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: String,
    default: () => moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm A')
  },
  username: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
});

const AdvertisementCounter = mongoose.model('AdvertisementCounter', advertisementCounterSchema);

const AdminPasswordSchema = new mongoose.Schema({
  password: String
});

const AdminPassword = mongoose.model('AdminPassword', AdminPasswordSchema);

const subjectSchema = new mongoose.Schema({
  Physics: [String],   
  Chemistry: [String],
  Maths: [String],
  Botany: [String],
  Zoology: [String]
});

const Subject = mongoose.model('Subject', subjectSchema);

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

router.post('/questions', upload.single('Image'), async (req, res) => {
  try {
    const questionData = req.body;
    if (req.file) {
      questionData.Image = req.file.path;
    }

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

router.put('/questions/:questionId', upload.single('Image'), async (req, res) => {
  try {
    const { questionId } = req.params;
    const questionData = req.body;

    const existingQuestion = await Question_Master.findOne({ Question_ID: questionId });

    if (!existingQuestion) {
      return res.status(404).send({ message: 'Question not found' });
    }

    if (req.file) {
      if (existingQuestion.Image) {
        const existingImagePath = path.resolve(existingQuestion.Image);
        fs.unlink(existingImagePath, (err) => {
          if (err) {
            console.error('Error deleting existing image:', err);
          }
        });
      }
      questionData.Image = req.file.path;
    }

    const updatedQuestion = await Question_Master.findOneAndUpdate({ Question_ID: questionId }, questionData, { new: true });

    res.status(200).send({ message: 'Question updated successfully', question: updatedQuestion });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).send({ message: 'Failed to update question' });
  }
});

router.delete('/questions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question_Master.findOne({ Question_ID: questionId });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.Image) {
      const imagePath = path.resolve(question.Image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image file:', err);
        }
      });
    }

    await Question_Master.deleteOne({ Question_ID: questionId });

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Failed to delete question' });
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
      { $sort: { Author_Id: 1, _id: -1 } },
      { 
        $group: {
          _id: '$Author_Id', 
          latestRating: { $first: '$Rating' } 
        }
      },
      
      { 
        $group: {
          _id: null, 
          averageRating: { $avg: '$latestRating' }
        }
      }
    ]);

    if (result.length > 0) {
      res.json({ averageRating: result[0].averageRating });
    } else {
      res.json({ averageRating: 0 });
    }

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

router.put('/exam-results/:examId/:authorId', async (req, res) => {
  try {
    const { examId, authorId } = req.params; 
    const { Rating } = req.body; 

    if (Rating < 1 || Rating > 5 || !Number.isInteger(Rating)) {
      return res.status(400).json({ error: 'Invalid rating. Rating must be an integer between 1 and 5.' });
    }

    const result = await Exam_Result.updateMany(
      { Exam_ID: Number(examId), Author_Id: authorId }, 
      { $set: { Rating } },
      { new: true }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Exam result not found' });
    }

    res.status(200).json({ message: 'Rating updated successfully', result });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/valid-questions/:examId', async (req, res) => {
  try {
    const { examId } = req.params;
    
    // Query to count only the documents where all the required fields are present
    const questionCount = await Question_Master.countDocuments({
      Exam_ID: examId,
      Question: { $exists: true, $ne: '' },
      Answer_1: { $exists: true, $ne: '' },
      Answer_2: { $exists: true, $ne: '' },
      Answer_3: { $exists: true, $ne: '' },
      Answer_4: { $exists: true, $ne: '' },
      Correct_Answer: { $exists: true, $gte: 1, $lte: 4 }
    });

    res.json(questionCount);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/mainContent', async (req, res) => {
  try {
    const mainContent = await MainContent.findOne();
    if (mainContent) {
      res.json({ title: mainContent.title, text: mainContent.text, version: mainContent.version });
    } else {
      res.status(404).json({ error: 'Main Content not found' });
    }
  } catch (error) {
    console.error('Error fetching Main Content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/mainContent', async (req, res) => {
  const { title, text } = req.body;

  if (!title && !text) {
    return res.status(400).json({ error: 'text is required' });
  }

  try {
    let mainContent = await MainContent.findOne();

    if (mainContent) {
      mainContent.title = text;
      mainContent.text = text;
      mainContent.version += 1;
      await mainContent.save();
    } else {
      mainContent = new MainContent({ text, version: 1 });
      await mainContent.save();
    }

    res.status(200).json({ message: 'Main Content updated successfully' });
  } catch (error) {
    console.error('Error updating Main Content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/advertisements', adUpload.single('adFile'), async (req, res) => {
  try {
    const { title, time } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'Advertisement file is required' });
    }

    const adPath = req.file.path;

    const newAdvertisement = new Advertisement({
      title,
      time,
      adPath
    });

    await newAdvertisement.save();
    res.status(201).json(newAdvertisement);
  } catch (error) {
    console.error('Error uploading advertisement:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/advertisements/random', async (req, res) => {
  try {
    // Use the findRandom method to get a random advertisement
    Advertisement.findRandom({}, {}, { limit: 1 }, (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).json({ error: 'No advertisements found' });
      }
      const randomAd = results[0];
      res.status(200).json(randomAd);
    });
  } catch (error) {
    console.error('Error fetching random advertisement:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/advertisement-counters', async (req, res) => {
  try {
    const { adId, username, userId } = req.body;

    // Validate the input
    if (!adId || !username || !userId) {
      return res.status(400).json({ error: 'adId, username, and userId are required' });
    }

    // Find the advertisement by adId
    const advertisement = await Advertisement.findById(adId);
    if (!advertisement) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }

    // Create a new advertisement counter entry
    const newCounter = new AdvertisementCounter({
      adId,
      title: advertisement.title,
      username,
      userId
    });

    // Save the counter entry to the database
    await newCounter.save();

    // Return the created entry
    res.status(201).json(newCounter);
  } catch (error) {
    console.error('Error recording advertisement interaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/register', async (req, res) => {
  const { password } = req.body;

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new AdminPassword({ password: hashedPassword });

    await newUser.save();

    res.status(201).json({ message: 'Registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
  const { password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    const user = await AdminPassword.findOne();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/subjects', async (req, res) => {
  try {
    const { Physics, Chemistry, Maths, Botany, Zoology } = req.body;

    // Assuming there's only one document in the collection
    let subject = await Subject.findOne();

    if (subject) {
      // Update the existing document
      subject.Physics = Physics || subject.Physics;
      subject.Chemistry = Chemistry || subject.Chemistry;
      subject.Maths = Maths || subject.Maths;
      subject.Botany = Botany || subject.Botany;
      subject.Zoology = Zoology || subject.Zoology;
    } else {
      // Create a new document
      subject = new Subject({ Physics, Chemistry, Maths, Botany, Zoology });
    }

    await subject.save();
    res.status(200).json(subject);
  } catch (error) {
    console.error('Error saving subject:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.findOne(); 
    if (subjects) {
      res.status(200).json(subjects);
    } else {
      res.status(404).json({ message: 'No subjects found' });
    }
  } catch (error) {
    console.error('Error retrieving subjects:', error);
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