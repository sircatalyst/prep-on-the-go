import * as mongoose from "mongoose";
import * as mongoosePaginate from "mongoose-paginate";

export const RecordSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	is_started: {
		type: Boolean,
		required: true
	},
	is_completed: {
		type: Boolean,
		default: false
	},
	time_started: {
		type: Date
	},
	time_completed: {
		type: Date
	},
	score: {
		type: Number,
		default: 0
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
	created: {
		type: Date,
		default: Date.now
	}
});

RecordSchema.plugin(mongoosePaginate);
