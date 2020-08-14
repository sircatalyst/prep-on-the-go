import * as uuid from "uuid";
import * as bcrypt from "bcrypt";
import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { Model } from "mongoose";
import { sign } from "jsonwebtoken";
import { InjectModel } from "@nestjs/mongoose";
import ShortUniqueId from "short-unique-id";

import { LoginDTO, VerifyBodyDTO, ChangePasswordBodyDTO } from "./dto/auth.dto";
import { User } from "../user/interface/user.interface";
import { log } from "../middleware/log";
import { Amazon } from "../utils/upload";
import { Email } from "../utils/email";
import { appConfig } from "../config";

const uniqueId = new ShortUniqueId();
const reqId = uniqueId();

@Injectable()
export class AuthService {
	constructor(@InjectModel("User") private userModel: Model<User>) {}

	/**
	 * @desc LOGIN a registered user
	 * @param loginPayload {}
	 * @returns user {}
	 */
	async login(loginPayload: LoginDTO): Promise<User> {
		const logData = `PAYLOAD: ${JSON.stringify(loginPayload)}, User: ${
			loginPayload.email
		}`;

		log.info(
			`AuthService - LOGIN - Request ID: ${reqId} - started the process of login a user - ${logData}`
		);

		const { email, password } = loginPayload;
		const user = await this.userModel.findOne({ email });

		if (!user) {
			log.error(
				`AuthService - LOGIN - Request ID: ${reqId} - Error in finding User: ${loginPayload.email} - MESSAGE: "Invalid Credentials"`
			);

			throw new HttpException(
				"Invalid Credentials",
				HttpStatus.UNAUTHORIZED
			);
		}

		log.info(
			`AuthService - LOGIN - Request ID: ${reqId} - Successfully found a User: ${loginPayload.email}`
		);

		if (await bcrypt.compare(password, user.password)) {
			log.info(
				`AuthService - LOGIN - Request ID: ${reqId} - Successfully compare password of User: ${loginPayload.email}`
			);

			if (!user.is_activated) {
				log.error(
					`AuthService - LOGIN - Request ID: ${reqId} - Unactivated account of User: ${loginPayload.email}`
				);

				throw new HttpException(
					"Please kindly verify your account to login",
					HttpStatus.UNAUTHORIZED
				);
			}

			log.info(
				`AuthService - LOGIN - Request ID: ${reqId} - Successfully found a User: ${loginPayload.email}`
			);

			return this.sanitizeAuthResponse(user);
		} else {
			log.error(
				`AuthService - LOGIN - Request ID: ${reqId} - Invalid password for User: ${loginPayload.email}`
			);

			throw new HttpException(
				"Invalid Credentials",
				HttpStatus.UNAUTHORIZED
			);
		}
	}

	/**
	 * @desc ACTIVATES a registered user's account
	 * @param payload {}
	 * @returns activated user {}
	 */
	async activate(payload: any): Promise<User> {
		const logData = `PAYLOAD: ${JSON.stringify(payload)}`;

		log.info(
			`AuthService - ACTIVATE - Request ID: ${reqId} - started the process of activating a user - ${logData}`
		);

		const { activation_code } = payload;
		const user = await this.userModel.findOne({ activation_code });

		if (!user) {
			log.error(
				`AuthService - ACTIVATE - Request ID: ${reqId} - Error in finding User: ${logData} - MESSAGE: "Forbidden Attempt"`
			);

			throw new HttpException("Forbidden Attempt", HttpStatus.FORBIDDEN);
		}

		log.info(
			`AuthService - ACTIVATE - Request ID: ${reqId} - Successfully found a User: ${user.email}`
		);

		const updatedUser = await this.userModel.findOneAndUpdate(
			{ _id: user._id },
			{ is_activated: 1, is_used_password: 1 },
			{
				new: true
			}
		);
		if (!updatedUser) {
			log.error(
				`AuthService - ACTIVATE - Request ID: ${reqId} - Error in activating a User: ${logData} - MESSAGE: "Internal Server Error""`
			);

			throw new HttpException(
				"Internal Server Error",
				HttpStatus.FORBIDDEN
			);
		}

		log.info(
			`AuthService - ACTIVATE - Request ID: ${reqId} - Successfully activated User: ${user.email}`
		);

		const sanitizedUser = this.sanitizeAuthResponse(updatedUser);
		const emailData: any = {};
		emailData.user = sanitizedUser;
		emailData.reqId = reqId;
		emailData.emailType = "activated";
		Email.send(emailData);
		return sanitizedUser;
	}

	/**
	 * @desc INITIATES reset password process
	 * @param payload {}
	 * @returns user {}
	 */
	async forget(payload: any): Promise<any> {
		const logData = `PAYLOAD: ${JSON.stringify(payload)}`;

		log.info(
			`AuthService - FORGET - Request ID: ${reqId} - started the process for forgetting a user's password - ${logData}`
		);

		const { email } = payload;
		const user = await this.userModel.findOne({ email });

		if (!user) {
			log.error(
				`AuthService - FORGET - Request ID: ${reqId} - Error in finding User: - ${logData} - Message: "Forbidden Attempt"`
			);

			throw new HttpException("Forbidden Attempt", HttpStatus.FORBIDDEN);
		}

		log.info(
			`AuthService - FORGET - Request ID: ${reqId} - Successfully found a User: ${logData}`
		);

		const resetCode: string = uuid.v4();
		const dateNow: number = Date.now() + 42300;

		const updatedUser = await this.userModel.findOneAndUpdate(
			{ _id: user._id },
			{
				reset_password: resetCode,
				is_used_password: 0,
				password_expire: dateNow
			},
			{
				new: true
			}
		);

		if (!updatedUser) {
			log.error(
				`AuthService - FORGET - Request ID: ${reqId} - Error will updating User profile: ${logData}`
			);

			throw new HttpException(
				"Internal Server Error",
				HttpStatus.FORBIDDEN
			);
		}

		log.info(
			`AuthService - FORGET - Request ID: ${reqId} - Successfully reset a User password: ${logData}`
		);

		const emailData: any = {};
		emailData.user = updatedUser;
		emailData.emailType = "forget";
		Email.send(emailData);
		return "success";
	}

	/**
	 * @desc RESET not logged in user's password
	 * @param paramPayload String
	 * @param bodyPayload {}
	 * @returns success
	 */
	async activateResetPassword(paramPayload: string): Promise<string> {
		const logData = `PARAM: ${JSON.stringify(paramPayload)}`;

		log.info(
			`AuthService - RESET PASSWORD - Request ID: ${reqId} - started the process of resetting a user's password - ${logData}`
		);

		const updatedUser = await this.userModel.findOneAndUpdate(
			{
				reset_password: paramPayload,
				is_used_password: 0,
				password_expire: { $gt: Date.now() }
			},
			{ is_used_password: 1, reset_password: null },
			{
				new: true
			}
		);

		if (!updatedUser) {
			log.error(
				`AuthService - RESET PASSWORD - Request ID: ${reqId} - Error in finding and updating a User: - ${logData} - Message: "Forbidden Attempt"`
			);

			throw new HttpException("Forbidden Attempt", HttpStatus.FORBIDDEN);
		}

		log.info(
			`AuthService - RESET PASSWORD - Request ID: ${reqId} - Successfully found and updated password for USER: ${updatedUser.email}`
		);
		return this.sanitizeAuthResponse(updatedUser);
	}

	/**
	 * @desc reset password for non logged in user
	 * @param bodyPayload {}
	 * @returns user with changed password {}
	 */
	async resetPassword(bodyPayload: VerifyBodyDTO, user: any): Promise<any> {
		const logData = `PAYLOAD: ${JSON.stringify(
			bodyPayload
		)}, USER: ${JSON.stringify(user.email)}`;

		log.info(
			`AuthService - CHANGE PASSWORD - Request ID: ${reqId} - started the process of changing a user's password - ${logData}`
		);

		const { new_password } = bodyPayload;

		if (!user.is_activated) {
			log.error(
				`AuthService - RESET PASSWORD - Request ID: ${reqId} - Account is not activated - Message: "Please kindly verify your account to login"`
			);

			throw new HttpException(
				"Please kindly verify your account to login",
				HttpStatus.UNAUTHORIZED
			);
		}
		const hashedPassword = await bcrypt.hash(new_password, 10);
		const updatedUser = await this.userModel.updateOne(
			{ _id: user._id },
			{
				is_used_password: 1,
				reset_password: null,
				password: hashedPassword
			}
		);

		log.info(
			`AuthService - CHANGE PASSWORD - Request ID: ${reqId} - Successfully updated new for password - ${logData}: User: ${user.email}`
		);

		const sanitizedUser = this.sanitizeAuthResponse(user);
		const emailData: any = {};
		emailData.user = sanitizedUser;
		emailData.reqId = reqId;
		emailData.emailType = "reset_successfully";
		Email.send(emailData);

		return "success";
	}

	/**
	 * @desc CHANGE reset password process
	 * @param bodyPayload {}
	 * @returns user with changed password {}
	 */
	async changePassword(
		bodyPayload: ChangePasswordBodyDTO,
		user: any
	): Promise<any> {
		const logData = `PAYLOAD: ${JSON.stringify(
			bodyPayload
		)}, USER: ${JSON.stringify(user.email)}`;

		log.info(
			`AuthService - CHANGE PASSWORD - Request ID: ${reqId} - started the process of changing a user's password - ${logData}`
		);

		const { new_password, old_password } = bodyPayload;

		if (await bcrypt.compare(old_password, user.password)) {
			log.info(
				`AuthService - CHANGE PASSWORD - Request ID: ${reqId} - Successfully compare user old password - ${logData}`
			);

			if (!user.is_activated) {
				log.error(
					`AuthService - RESET PASSWORD - Request ID: ${reqId} - Account is not activated - Message: "Please kindly verify your account to login"`
				);

				throw new HttpException(
					"Please kindly verify your account to login",
					HttpStatus.UNAUTHORIZED
				);
			}
			const hashedPassword = await bcrypt.hash(new_password, 10);
			const updatedUser = await this.userModel.updateOne(
				{ _id: user._id },
				{
					is_used_password: 1,
					reset_password: null,
					password: hashedPassword
				}
			);

			log.info(
				`AuthService - CHANGE PASSWORD - Request ID: ${reqId} - Successfully updated new for password - ${logData}: User: ${user.email}`
			);

			const sanitizedUser = this.sanitizeAuthResponse(user);
			const emailData: any = {};
			emailData.user = sanitizedUser;
			emailData.reqId = reqId;
			emailData.emailType = "reset_successfully";
			Email.send(emailData);

			return "success";
		} else {
			log.error(
				`AuthService - RESET PASSWORD - Request ID: ${reqId} Error while comparing old password - Message: "Invalid Old Password"`
			);

			throw new HttpException(
				"Invalid Old Password",
				HttpStatus.UNPROCESSABLE_ENTITY
			);
		}
	}

	/**
	 * @desc UPDATES user's avatar
	 * @param image {}
	 * @param user {}
	 * @returns user with updated avatar {}
	 */
	async uploadAvatar(image: any, user: any): Promise<any> {
		const logData = `IMAGE: ${JSON.stringify(
			image.originalname
		)}, User: ${JSON.stringify(user.email)}`;

		log.info(
			`AuthService - UPLOAD AVATAR - Request ID: ${reqId} - started the process of uploading an avatar - ${logData}`
		);

		try {
			const avatarUrl = await Amazon.upload(image);
			if (!avatarUrl) {
				log.error(
					`AuthService - UPLOAD AVATAR - Request ID: ${reqId} - Error uploading image to AWS S3 `
				);
				throw new HttpException(
					"Not Found",
					HttpStatus.UNPROCESSABLE_ENTITY
				);
			}
			log.info(
				`AuthService - UPLOAD AVATAR - Request ID: ${reqId} - Successfully uploaded to AWS S3`
			);

			const updatedUser = await this.userModel.findOneAndUpdate(
				{ _id: user._id },
				{ avatar: avatarUrl },
				{
					new: true
				}
			);
			if (!updatedUser) {
				log.error(
					`AuthService - UPLOAD AVATAR - Request ID: ${reqId} - Error in finding and updating a User: - ${logData} - Message: "UNPROCESSABLE ENTITY"`
				);
				throw new HttpException(
					"UNPROCESSABLE ENTITY",
					HttpStatus.UNPROCESSABLE_ENTITY
				);
			}

			log.info(
				`AuthService - UPLOAD AVATAR - Request ID: ${reqId} - Successfully updated Database - ${updatedUser}`
			);

			return updatedUser;
		} catch (error) {
			log.error(
				`AuthService - UPLOAD AVATAR - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
			);
			throw new HttpException(
				error.message,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * @desc creates a new token for user to stay logged in
	 * @param user {}
	 * @returns token
	 */
	async createToken(user: any) {
		const logData = `PAYLOAD: ${JSON.stringify(user)}`;

		log.info(
			`AuthService - CREATE TOKEN - Request ID: ${reqId} - Successfully created token fot User:${user.email} - ${logData}`
		);

		return sign(user, appConfig.secretKey, { expiresIn: "12h" });
	}

	/**
	 * @desc removes password string from user object
	 * @param param {user}
	 * @returns user object without password {}
	 */
	async sanitizeAuthResponse(user: any) {
		log.info(
			`AuthService - Request ID: - Successfully sanitize User: ${user.email}`
		);

		user = user.toObject();
		delete user.password;
		return user;
	}
}
