import { Schema, model, models, Document, Model } from "mongoose";
import AutoIncrementFactory from 'mongoose-sequence';
import moment from 'moment-timezone';

const AutoIncrement = AutoIncrementFactory(require('mongoose'));

export interface ExamMasterDocument extends Document {
  Exam_Id: number;
  Exam_Desc: string;
  Difficulty_Level: number;
  Subject: string;
  Exam_Category: string;
  No_of_Questions: number;
  Exam_Duration: number;
  Question_Duration: number;
  Author_Name: string;
  Audit_Details: string;
  Exam_Valid_Upto: string;
}

const ExamMasterSchema = new Schema<ExamMasterDocument>({
  Exam_Id: { type: Number, unique: true },
  Exam_Desc: { type: String, required: true },
  Difficulty_Level: { type: Number, required: true, min: 0, max: 99 },
  Subject: { type: String, required: true },
  Exam_Category: { type: String, required: true },
  No_of_Questions: { type: Number, required: true, min: 0, max: 9999 },
  Exam_Duration: { type: Number, required: true },
  Question_Duration: { type: Number, required: true },
  Author_Name: { type: String, required: true },
  Audit_Details: {
    type: String,
    default: () => moment().tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm A')
  },
  Exam_Valid_Upto: { type: String, required: true }
});

ExamMasterSchema.plugin(AutoIncrement as any, { inc_field: 'Exam_Id', start_seq: 1 });

const ExamMaster: Model<ExamMasterDocument> = models?.ExamMaster || model<ExamMasterDocument>("ExamMaster", ExamMasterSchema);

export default ExamMaster;
