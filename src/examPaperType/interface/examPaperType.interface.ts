import * as mongoose from "mongoose";

export interface ExamPaperType extends mongoose.Document {
	id?: string;
	name: string;
	is_activate?: boolean;
	description: string;
	created: Date;
}
