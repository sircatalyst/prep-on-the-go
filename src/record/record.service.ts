import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PaginateModel } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import ShortUniqueId from "short-unique-id";

import { CreateRecordDTO } from "./dto/record.dto";
import { log } from "../middleware/Logs/log";
import { Record } from "./interface/record.interface";
import { appConfig } from "../config";

const uniqueId = new ShortUniqueId();
const reqId = uniqueId();

@Injectable()
export class RecordService {
	constructor(
		@InjectModel("Record") private recordModel: PaginateModel<Record>
	) {}

	/**
	 * @desc LOGIN a registered user
	 * @param loginPayload {}
	 * @returns user {}
	 */
	async createUserRecord(
		recordPayload: CreateRecordDTO,
		loggedInUser
	): Promise<Record> {
		const logData = `PAYLOAD: ${JSON.stringify(recordPayload)}, User: ${
			loggedInUser.email
		}`;

		log.info(
			`RecordService - LOGIN - Request ID: ${reqId} - started the process of login a user - ${logData}`
		);

		recordPayload.user_id = loggedInUser._id;
		const createRecord = new this.recordModel(recordPayload);
		const createdRecord = await createRecord.save();
		return createdRecord;
	}

	/**
	 * @desc finds all exams
	 * @param param? {limit or offset}
	 * @returns exams {}
	 */
	async listAllRecordOfAUser(
		queryPayload,
		user,
		loggedInUser?: any
	): Promise<any> {
		let logData = {};
		if (loggedInUser === undefined) {
			logData = `USER: ${JSON.stringify(user.email)}`;
		} else {
			logData = `USER: ${JSON.stringify(loggedInUser.email)}`;
		}

		log.info(
			`ExamTypeService - FIND ALL Exams - Request ID: ${reqId} - started the process of find all exams - ${logData}`
		);

		const { limit, offset } = queryPayload;
		const offsetPayload: number =
			parseInt(offset, 10) || appConfig.paginationOffset;
		const limitPayload: number =
			parseInt(limit, 10) || appConfig.paginationLimit;
		let exams = {};
		if (loggedInUser === undefined) {
			exams = await this.recordModel.paginate(
				{},
				{ offset: offsetPayload, limit: limitPayload }
			);
		} else if(loggedInUser.role === "admin") {
			exams = await this.recordModel.paginate(
				{ user_id: user.id },
				{ offset: offsetPayload, limit: limitPayload }
			);
		} else {
			exams = await this.recordModel.paginate(
				{ user_id: user._id },
				{ offset: offsetPayload, limit: limitPayload }
			);
		}
		if (!exams) {
			log.error(
				`ExamTypeService - FIND ALL Exam - Request ID: ${reqId} - Found no exam - Message: "NOT_FOUND"`
			);
			throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
		}

		log.info(
			`ExamTypeService - FIND ALL Exam - Request ID: ${reqId} - Successfully found all exams - ${exams}`
		);
		return exams;
	}

	/**
	 * @desc finds an exam
	 * @param param {param object}
	 * @returns createdExam {found exam}
	 */
	async getUserRecord(param: any, loggedInUser): Promise<Record> {
		const logData = `PARAM: ${JSON.stringify(
			param
		)}, USER: ${JSON.stringify(loggedInUser.email)}`;

		log.info(
			`ExamTypeService - FIND ONE EXAM - Request ID: ${reqId} - started the process of find a exam - ${logData}`
		);

		try {
			const { id, recordId } = param;
			const exam = await this.recordModel.findOne({ _id: id });
			if (!exam) {
				log.error(
					`ExamTypeService - FIND ONE EXAM - Request ID: ${reqId} - Found no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.info(
				`ExamTypeService - FIND ONE USER - Request ID: ${reqId} - Successfully found a exam - ${exam}`
			);
			return exam;
		} catch (error) {
			if (
				error.message === "Not Found" ||
				/Cast to ObjectId/g.test(error.message)
			) {
				log.error(
					`ExamTypeService - FIND ONE Exam - Request ID: ${reqId} - Found no Exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.error(
				`ExamTypeService - FIND ONE Exam - Request ID: ${reqId} - Internal Server Error - Message: ${error.message}`
			);
			throw new HttpException(
				error.message,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * @desc updates an exam
	 * @param param {contains exam id to update}
	 * @param updatePayload {contains the data to be updated}
	 * @returns updatedExam {}
	 */
	async updateUserRecord(
		param: any,
		updatePayload: any,
		loggedInUser: any
	): Promise<any> {
		const logData = `PARAM: ${JSON.stringify(
			param
		)}, PAYLOAD: ${JSON.stringify(updatePayload)}, USER:${JSON.stringify(
			loggedInUser
		)}`;

		log.info(
			`ExamYearService - UPDATE AN Exam - Request ID: ${reqId} - started the process of updating an exam - ${logData}`
		);

		try {
			const { id } = param;
			const updatedRecord = await this.recordModel.findOneAndUpdate(
				{ _id: id },
				updatePayload,
				{
					new: true
				}
			);
			if (!updatedRecord) {
				log.error(
					`ExamYearService - UPDATE AN Exam - Request ID: ${reqId} - Found and Updated no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("NOT_FOUND", HttpStatus.NOT_FOUND);
			}

			log.info(
				`ExamYearService - UPDATE AN Exam - Request ID: ${reqId} - Successfully found and updated a exam - ${updatedRecord}`
			);
			return updatedRecord;
		} catch (error) {
			if (
				error.message === "Not Found" ||
				/Cast to ObjectId/g.test(error.message)
			) {
				log.error(
					`ExamYearService - UPDATE AN Exam - Request ID: ${reqId} - Found and Updated no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.error(
				`ExamYearService - UPDATE A Exam - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
			);
			throw new HttpException(
				error.message,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}
}
