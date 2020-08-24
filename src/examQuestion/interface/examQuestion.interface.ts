import * as mongoose from "mongoose";

export interface ExamQuestion extends mongoose.Document {
	id?: string;
	question: string;
	instruction?: string;
	image?: string;
	question_number: number;
	exam_question_number: number;
	exam_type_id: string;
	exam_paper_type_id: string;
	exam_year_id: string;
	exam_name_id: string;
	exam_answer: string;
	optionA: string;
	optionB: string;
	optionC: string;
	optionD: string;
	optionE: string;
	description: string;
	created: Date;
}
