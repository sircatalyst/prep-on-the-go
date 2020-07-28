import * as mongoose from "mongoose";

export interface Record extends mongoose.Document {
	id?: string;
	user_id: string;
	is_started: boolean;
	is_completed: boolean;
	time_started: Date;
	time_completed: Date;
	score: number;
	exam_name_id: string;
	exam_type_id: string;
	exam_paper_type_id: string;
	exam_year_id: string;
	exam_subject_id: number;
	created: Date;
}