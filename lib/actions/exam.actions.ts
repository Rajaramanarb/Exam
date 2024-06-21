import ExamMaster, { ExamMasterDocument } from "../database/models/exam.models";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// CREATE
export async function createExam(examData: ExamMasterDocument) {
  try {
    await connectToDatabase();

    const newExam = await ExamMaster.create(examData);

    return JSON.parse(JSON.stringify(newExam));
  } catch (error) {
    handleError(error);
  }
}

// READ
export async function getExams() {
  try {
    await connectToDatabase();

    const exams = await ExamMaster.find();

    return JSON.parse(JSON.stringify(exams));
  } catch (error) {
    handleError(error);
  }
}

// UPDATE and DELETE can be added similarly based on requirements
