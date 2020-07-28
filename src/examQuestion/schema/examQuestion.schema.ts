import * as mongoose from "mongoose";
import * as mongoosePaginate from "mongoose-paginate";

export const ExamQuestionSchema = new mongoose.Schema({
	question: {
		type: String,
		required: true
	},
	question_number: {
		type: Number,
		required: true
	},
	exam_name_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "ExamName",
		required: true
	},
	exam_type_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "ExamType",
		required: true
	},
	exam_paper_type_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "ExamPaperType"
	},
	exam_year_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "ExamYear",
		required: true
	},
	exam_subject_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "ExamSubject",
		required: true
	},
	answer: {
		type: String,
		required: true
	},
	optionA: {
		type: String,
		required: true
	},
	optionB: {
		type: String,
		required: true
	},
	optionC: {
		type: String,
		required: true
	},
	optionD: {
		type: String,
		required: true
	},
	optionE: {
		type: String,
		default: null
	},
	description: {
		type: String,
		default: null
	},
	created: {
		type: Date,
		default: Date.now
	}
});

ExamQuestionSchema.plugin(mongoosePaginate);
