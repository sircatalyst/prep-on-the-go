import * as mongoose from "mongoose";

export interface User extends mongoose.Document {
	id?: string;
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	phone: string;
	is_activated: number;
	activation_code: string;
	verification_code: string;
	reset_password: string;
	password_expire: number;
	is_used_password: number;
	refreshToken: string;
	avatar: string;
	role?: string;
	created: Date;
}
