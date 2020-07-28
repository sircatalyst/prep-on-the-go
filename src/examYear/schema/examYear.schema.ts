import * as mongoose from "mongoose";
import * as mongoosePaginate from "mongoose-paginate";

export const ExamYearSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	is_activated: {
		type: String,
		default: true
	},
	description: {
		type: String,
		required: true
	},
	created: {
		type: Date,
		default: Date.now
	}
});

ExamYearSchema.plugin(mongoosePaginate);
