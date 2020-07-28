import * as mongoose from "mongoose";

export interface ExamName extends mongoose.Document {
	id?: string;
	is_activate?: boolean;
	description: string;
	created: Date;
}
