import * as mongoose from "mongoose";

export interface ExamSubject extends mongoose.Document {
	id?: string;
	name: string;
	is_activate?: boolean;
	description: string;
	time: string;
	created: Date;
}
