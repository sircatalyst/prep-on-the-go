import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PaginateModel } from "mongoose";
import * as uuid from "uuid";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./interface/user.interface";

import {
	UpdateUserProfileDTO,
	CreateUserDTO,
	FindOneDTO
} from "./dto/user.dto";
import { log } from "../middleware/log";
import ShortUniqueId from "short-unique-id";
import { Email } from "../utils/email";
import { appConfig } from "../config";
import { queryPayloadType } from "../utils/types/types";

const uniqueId = new ShortUniqueId();
const reqId = uniqueId();

@Injectable()
export class UserService {
	constructor(@InjectModel("User") private userModel: PaginateModel<User>) {}

	/**
	 * @desc creates a user
	 * @param createUserPayload {}
	 * @returns createdUser {}
	 */
	async createUser(createUserPayload: CreateUserDTO): Promise<User> {
		const logData = `PAYLOAD: ${JSON.stringify(createUserPayload)}, User: ${
			createUserPayload.email
		}`;

		log.info(
			`UserService - CREATE - Request ID: ${reqId} - started the process of creating a user - ${logData}`
		);

		const { email, phone } = createUserPayload;
		const userEmail = await this.userModel.findOne({ email });

		if (userEmail) {
			if (!userEmail.is_activated) {
				log.error(
					`UserService - CREATE - Request ID: ${reqId} - Found an existing user with same email: ${createUserPayload.email} - Message: "User already exists, Please kindly verify your account"`
				);
				throw new HttpException(
					"User already exists, Please kindly verify your account",
					HttpStatus.BAD_REQUEST
				);
			}
			log.error(
				`UserService - CREATE - Request ID: ${reqId} - Found an existing user: ${createUserPayload.email} - Message: "User already exists"`
			);
			throw new HttpException(
				"User already exists",
				HttpStatus.BAD_REQUEST
			);
		}

		const userPhone = await this.userModel.findOne({ phone });
		if (userPhone) {
			log.error(
				`UserService - CREATE - Request ID: ${reqId} - Found an existing user with same phone: ${createUserPayload.phone} - Message: "User with this phone number already exists"`
			);
			throw new HttpException(
				"User with this phone number already exists",
				HttpStatus.BAD_REQUEST
			);
		}

		const activationCode: string = uuid.v4();
		const refreshToken: string = uuid.v4();
		createUserPayload.refreshToken = refreshToken;
		createUserPayload.is_activated = 0;
		createUserPayload.activation_code = activationCode;
		const createUser = new this.userModel(createUserPayload);
		const createdUser = await createUser.save();

		log.info(
			`UserService - CREATE - Request ID: ${reqId} - Successfully created a new user - ${logData}`
		);
		 
		const sanitizedUser =this.sanitizeUserResponse(createdUser);
		const emailData: any = {};
		emailData.user = sanitizedUser;
		emailData.reqId = reqId;
		emailData.emailType = "welcome";
		Email.send(emailData);
		return sanitizedUser;
	}

	/**
	 * @desc finds a user
	 * @param param {param object}
	 * @returns createdUser {found user}
	 */
	async findOneUser(param: FindOneDTO): Promise<User> {
		const logData = `PARAM: ${JSON.stringify(param)}`;

		log.info(
			`UserService - FIND ONE USER - Request ID: ${reqId} - started the process of find a user - ${logData}`
		);

		try {
			const { id } = param;
			const user = await this.userModel.findOne({ _id: id }, { is_deleted: 0});
			if (!user) {
				log.error(
					`UserService - FIND ONE USER - Request ID: ${reqId} - Found no user - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.info(
				`UserService - FIND ONE USER - Request ID: ${reqId} - Successfully found a user - ${user}`
			);
			return this.sanitizeUserResponse(user);
		} catch (error) {
			if (
				error.message === "Not Found" ||
				/Cast to ObjectId/g.test(error.message)
			) {
				log.error(
					`UserService - FIND ONE USER - Request ID: ${reqId} - Found no user - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.error(
				`UserService - FIND ONE USER - Request ID: ${reqId} - Internal Server Error - Message: ${error.message}`
			);
			throw new HttpException(
				error.message,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * @desc finds all users
	 * @param param? {limit or offset}
	 * @returns users {}
	 */
	async findAllUsers(queryPayload: queryPayloadType): Promise<any> {
		const logData = `PARAM: ${JSON.stringify(queryPayload)}`;

		log.info(
			`UserService - FIND ALL USER - Request ID: ${reqId} - started the process of find all users - ${logData}`
		);

		const { limit, offset } = queryPayload;
		const offsetPayload: number =
			parseInt(offset, 10) || appConfig.paginationOffset;
		const limitPayload: number =
			parseInt(limit, 10) || appConfig.paginationLimit;
		const users = await this.userModel.paginate(
			{ is_deleted: 0},
			{ offset: offsetPayload, limit: limitPayload, sort: { created: -1 } }
		);
		if (!users) {
			log.error(
				`UserService - FIND ALL USER - Request ID: ${reqId} - Found no user - Message: "NOT_FOUND"`
			);
			throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
		}

		log.info(
			`UserService - FIND ALL USER - Request ID: ${reqId} - Successfully found all users - ${users}`
		);
		return users;
	}

	/**
	 * @desc updates a user
	 * @param param {contains user id to update}
	 * @param updatePayload {contains the data to be updated}
	 * @returns updatedUser {}
	 */
	async updateUserProfile(
		updatePayload: UpdateUserProfileDTO,
		param: User | FindOneDTO
	): Promise<User> {
		const logData = `PARAM: ${JSON.stringify(
			param
		)}, PAYLOAD: ${JSON.stringify(updatePayload)}`;

		log.info(
			`UserService - UPDATE A USER - Request ID: ${reqId} - started the process of updating a users - ${logData}`
		);

		try {
			const { id } = param;
			const updatedUser = await this.userModel.findOneAndUpdate(
				{ _id: id },
				updatePayload,
				{
					new: true
				}
			);
			if (!updatedUser) {
				log.error(
					`UserService - UPDATE A USER - Request ID: ${reqId} - Found and Updated no user - Message: "NOT_FOUND"`
				);
				throw new HttpException("NOT_FOUND", HttpStatus.NOT_FOUND);
			}

			log.info(
				`UserService - UPDATE A USER - Request ID: ${reqId} - Successfully found and updated a user - ${updatedUser}`
			);

			log.info(
				`UserService - UPDATE A USER - Request ID: ${reqId} - Successfully found and updated a user - ${updatedUser}`
			);
			return this.sanitizeUserResponse(updatedUser);
		} catch (error) {
			if (
				error.message === "Not Found" ||
				/Cast to ObjectId/g.test(error.message)
			) {
				log.error(
					`UserService - UPDATE A USER - Request ID: ${reqId} - Found and Updated no user - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.error(
				`UserService - UPDATE A USER - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
			);
			throw new HttpException(
				error.message,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * @desc DELETE a user
	 * @param param {contains user id to update}
	 * @returns success
	 */
	async deleteAUser(param: FindOneDTO): Promise<string> {
		const logData = `PARAM: ${JSON.stringify(param)}`;

		log.info(
			`UserService - DELETE A USER - Request ID: ${reqId} - started the process of deleting a user - ${logData}`
		);

		try {
			const { id } = param;
			const user = await this.userModel.findOneAndUpdate({ _id: id }, { is_deleted: 1});
			if (!user) {
				log.error(
					`UserService - DELETE A USER - Request ID: ${reqId} - Found and Deleted no user - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			return "success";
		} catch (error) {
			if (
				error.message === "Not Found" ||
				/Cast to ObjectId/g.test(error.message)
			) {
				log.error(
					`UserService - DELETE A USER - Request ID: ${reqId} - Found and Deleted no user - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}

			log.error(
				`UserService - UPDATE A USER - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
			);

			throw new HttpException(
				error.message,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * @desc removes password string from user object
	 * @param param {user}
	 * @returns user object without password {}
	 */
	private sanitizeUserResponse(user: any) {
		log.info(
			`UseService - Request ID: - Successfully sanitize User: ${user.email}`
		);
		user = user.toObject();
		delete user.password;
		return user;
	}
}
