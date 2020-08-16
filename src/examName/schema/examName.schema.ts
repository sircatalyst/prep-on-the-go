import * as mongoose from "mongoose";
import * as mongoosePaginate from "mongoose-paginate"

export const ExamNameSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	is_activated: {
		type: String,
		default: true
	},
	created: {
		type: Date,
		default: Date.now
	}
});

ExamNameSchema.plugin(mongoosePaginate);