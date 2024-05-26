require('dotenv').config();

const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'Title',
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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
  Difficulty_Level: { type: Number, required: true, min: 0, max: 99 },
  Subject: { type: String, required: true },
  Exam_Category: { type: String, required: true },
  No_of_Questions: { type: Number, required: true, min: 0, max: 9999 },
  Exam_Duration: { type: Number, required: true },
  Question_Duration: { type: Number, required: true },
  Author_Name: { type: String, required: true },
  Audit_Details_UST: { type: Date, default: Date.now },
  Exam_Valid_Upto: { type: Date, required: true }
});

ExamMasterSchema.plugin(AutoIncrement, { inc_field: 'Exam_Id', start_seq: 1 });

const Exam_Master = mongoose.model('Exam_Master', ExamMasterSchema);

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({
      message: 'Login successful',
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/forget-password', async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateRandomOTP();
    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent to email. Please check your email.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    if (updatedUser) {
      return res.json({ message: 'Password reset successful' });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const emailConfig = {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
};

const smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

function generateRandomOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp) {
  try {
    const mailOptions = {
      to: email,
      from: '"Family Tree" <rajaramanarbpubg@gmail.com>',
      subject: 'Password Reset OTP',
      html: `<p>Your OTP for password reset is: <strong>${otp}</strong>. This OTP is valid for a short period.</p>`,
    };

    const info = await smtpTransport.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
}

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

router.get('/exams', async (req, res) => {
  try {
    const exams = await Exam_Master.find();

    const examsWithIST = exams.map(exam => {
      const examObj = exam.toObject();
      examObj.Audit_Details_IST = moment(exam.Audit_Details).tz('Asia/Kolkata').toDate();
      return examObj;
    });

    res.status(200).json(examsWithIST);
  } catch (error) {
    console.error('Error retrieving exams:', error);
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