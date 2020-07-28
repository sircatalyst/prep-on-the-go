import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import * as mongoosePaginate from "mongoose-paginate"

export const UserSchema = new mongoose.Schema({
	first_name: {
		type: String,
		required: true
	},
	last_name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	phone: {
		type: String,
		required: true,
		unique: true
	},
	is_activated: {
		type: Boolean
	},
	activation_code: {
		type: String
	},
	reset_password: {
		type: String,
		default: null
	},
	password_expire: {
		type: Number,
		default: null
	},
	is_used_password: {
		type: Boolean,
		default: false
	},
	is_deleted: {
		type: Boolean,
		default: false
	},
	avatar: {
		type: String,
		default: null
	},
	role: {
		type: String,
		default: "user"
	},
	created: {
		type: Date,
		default: Date.now
	}
});

UserSchema.pre("save", async function(next: mongoose.HookNextFunction) {
	try {
		if (!this.isModified("password")) {
			return next();
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(this["password"], salt);
		this["password"] = hashedPassword;
		return next();
	} catch (err) {
		return next(err);
	}
});
UserSchema.plugin(mongoosePaginate);