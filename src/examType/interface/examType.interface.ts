import * as mongoose from "mongoose";

export interface ExamType extends mongoose.Document {
	id?: string;
	name: string;
	is_activate?: boolean;
	description: string;
	created: Date;
}
