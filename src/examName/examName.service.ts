import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PaginateModel } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ExamName } from "./interface/examName.interface";
import { User } from "../user/interface/user.interface";

import { FindOneDTO } from "../user/dto/user.dto";
import { log } from "../middleware/log";
import ShortUniqueId from "short-unique-id";
import { appConfig } from "../config";
import { CreateExamNameDTO, UpdateExamNameDTO } from "./dto/examName.dto";
import { queryPayloadType } from "../utils/types/types";

const uniqueId = new ShortUniqueId();
const reqId = uniqueId();

@Injectable()
export class ExamNameService {
	constructor(@InjectModel("ExamName") private examNameModel: PaginateModel<ExamName>) {}

	/**
	 * @desc creates an exam
	 * @param createExamPayload {}
	 * @returns createdExam {}
	 */
	async createExamName(
		createExamPayload: CreateExamNameDTO,
		loggedInUser: User
	): Promise<ExamName> {
		const logData = `PAYLOAD: ${JSON.stringify(createExamPayload)}, User: ${
			loggedInUser.email
		}`;

		log.info(
			`ExamNameService - CREATE - Request ID: ${reqId} - started the process of creating an exam - ${logData}`
		);

		const { name } = createExamPayload;
		const existingExam = await this.examNameModel.findOne({ name });

		if (existingExam) {
			log.error(
				`ExamNameService - CREATE - Request ID: ${reqId} - Found an existing exam: ${createExamPayload.name} - Message: "Exam already exists"`
			);
			throw new HttpException(
				"Exam already exists",
				HttpStatus.BAD_REQUEST
			);
		}
		const createExam = new this.examNameModel(createExamPayload);
		const createdExam = await createExam.save();

		log.info(
			`ExamNameService - CREATE - Request ID: ${reqId} - Successfully created a new exam - ${logData}`
		);

		return createdExam;
	}

	/**
	 * @desc finds an exam
	 * @param param {param object}
	 * @returns createdExam {found exam}
	 */
	async findOneExamName(param: FindOneDTO, loggedInUser: User): Promise<ExamName> {
		const logData = `PARAM: ${JSON.stringify(
			param
		)}, USER: ${JSON.stringify(loggedInUser.email)}`;

		log.info(
			`ExamNameService - FIND ONE EXAM - Request ID: ${reqId} - started the process of find a exam - ${logData}`
		);

		try {
			const { id } = param;
			const exam = await this.examNameModel.findOne(
				{ _id: id },
				{ is_activated: 0 }
			);
			if (!exam) {
				log.error(
					`ExamNameService - FIND ONE EXAM - Request ID: ${reqId} - Found no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.info(
				`ExamNameService - FIND ONE USER - Request ID: ${reqId} - Successfully found a exam - ${exam}`
			);
			return exam;
		} catch (error) {
			if (
				error.message === "Not Found" ||
				/Cast to ObjectId/g.test(error.message)
			) {
				log.error(
					`ExamNameService - FIND ONE Exam - Request ID: ${reqId} - Found no Exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.error(
				`ExamNameService - FIND ONE Exam - Request ID: ${reqId} - Internal Server Error - Message: ${error.message}`
			);
			throw new HttpException(
				error.message,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * @desc finds all exams
	 * @param param? {limit or offset}
	 * @returns exams {}
	 */
	async findAllExamName(queryPayload: queryPayloadType, loggedInUser: User = null): Promise<any> {
		const logData = loggedInUser === null ? "Unregistered user" : `USER: ${JSON.stringify(loggedInUser.email)}`;

		log.info(
			`ExamNameService - FIND ALL Exams - Request ID: ${reqId} - started the process of find all exams - ${logData}`
		);

		const { limit, offset } = queryPayload;
		const exams: any = {};
		if(limit || offset) {
			const offsetPayload: number =
				parseInt(offset, 10) || appConfig.paginationOffset;
			const limitPayload: number =
				parseInt(limit, 10) || appConfig.paginationLimit;
			exams.response = await this.examNameModel.paginate(
				{},
				{ offset: offsetPayload, limit: limitPayload, sort: { created: -1 } }
			);
		} else {
			exams.response = await this.examNameModel.find();
		}
		if (!exams) {
			log.error(
				`ExamNameService - FIND ALL Exam - Request ID: ${reqId} - Found no exam - Message: "NOT_FOUND"`
			);
			throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
		}

		log.info(
			`ExamNameService - FIND ALL Exam - Request ID: ${reqId} - Successfully found all exams - ${exams}`
		);

		if(limit || offset) {
			return exams.response;
		} else {
			const data: any = {};
			data.total = exams.response.length;
			data.docs = exams.response;
			return data;
		}
	}

	/**
	 * @desc updates an exam
	 * @param param {contains exam id to update}
	 * @param updatePayload {contains the data to be updated}
	 * @returns updatedExam {}
	 */
	async updateExamName(
		param: FindOneDTO,
		updatePayload: UpdateExamNameDTO,
		loggedInUser: User
	): Promise<ExamName> {
		const logData = `PARAM: ${JSON.stringify(
			param
		)}, PAYLOAD: ${JSON.stringify(updatePayload)}, USER:${JSON.stringify(
			loggedInUser
		)}`;

		log.info(
			`ExamNameService - UPDATE AN Exam - Request ID: ${reqId} - started the process of updating an exam - ${logData}`
		);

		try {
			const { id } = param;
			const updatedExam = await this.examNameModel.findOneAndUpdate(
				{ _id: id },
				updatePayload,
				{
					new: true
				}
			);
			if (!updatedExam) {
				log.error(
					`ExamNameService - UPDATE AN Exam - Request ID: ${reqId} - Found and Updated no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("NOT_FOUND", HttpStatus.NOT_FOUND);
			}

			log.info(
				`ExamNameService - UPDATE AN Exam - Request ID: ${reqId} - Successfully found and updated a exam - ${updatedExam}`
			);
			return updatedExam;
		} catch (error) {
			if (
				error.message === "Not Found" ||
				/Cast to ObjectId/g.test(error.message)
			) {
				log.error(
					`ExamNameService - UPDATE AN Exam - Request ID: ${reqId} - Found and Updated no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.error(
				`ExamNameService - UPDATE A Exam - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
			);
			throw new HttpException(
				error.message,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * @desc Deactivate an exam
	 * @param param {contains exam id to deactivate}
	 * @returns success
	 */
	async deactivateAnExamName(
		param: FindOneDTO,
		loggedInUser: User
	): Promise<string> {
		const logData = `PARAM: ${JSON.stringify(param)} USER: ${JSON.stringify(
			loggedInUser.email
		)}`;

		log.info(
			`ExamNameService - DEACTIVATE AN EXAM - Request ID: ${reqId} - started the process of activating an exam - ${logData}`
		);

		try {
			const { id } = param;
			const exam = await this.examNameModel.findOneAndUpdate(
				{ _id: id },
				{ is_activated: 0 }
			);
			if (!exam) {
				log.error(
					`ExamNameService - DEACTIVATE AN Exam - Request ID: ${reqId} - Found and DEACTIVATE no exam - Message: "NOT_FOUND"`
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
					`ExamNameService - DEACTIVATE AN EXAM - Request ID: ${reqId} - Found and DEACTIVATED no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}

			log.error(
				`ExamNameService - DEACTIVATE AN EXAM - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
			);

			throw new HttpException(
				error.message,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * @desc Activate an exam
	 * @param param {contains exam id to activate}
	 * @returns success
	 */
	async activateAnExamName(
		param: FindOneDTO,
		loggedInUser: User
	): Promise<string> {
		const logData = `PARAM: ${JSON.stringify(param)} USER: ${JSON.stringify(
			loggedInUser.email
		)}`;

		log.info(
			`ExamNameService - ACTIVATE A EXAM - Request ID: ${reqId} - started the process of activating an exam - ${logData}`
		);

		try {
			const { id } = param;
			const exam = await this.examNameModel.findOneAndUpdate(
				{ _id: id },
				{ is_activated: 1 }
			);
			if (!exam) {
				log.error(
					`ExamNameService - ACTIVATE AN Exam - Request ID: ${reqId} - Found and ACTIVATED no exam - Message: "NOT_FOUND"`
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
					`ExamNameService - ACTIVATE AN EXAM - Request ID: ${reqId} - Found and ACTIVATED no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}

			log.error(
				`ExamNameService - ACTIVATE AN EXAM - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
			);

			throw new HttpException(
				error.message,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	/**
	 * @desc finds all activate exam names
	 * @param param? {limit or offset}
	 * @returns exams {}
	 */
	async findAllActivateExamName(queryPayload: queryPayloadType, loggedInUser: User): Promise<any> {
		const logData = `USER: ${JSON.stringify(loggedInUser.email)}`;

		log.info(
			`ExamNameService - FIND ALL Exams - Request ID: ${reqId} - started the process of find all exams - ${logData}`
		);

		const { limit, offset } = queryPayload;
		const offsetPayload: number =
			parseInt(offset, 10) || appConfig.paginationOffset;
		const limitPayload: number =
			parseInt(limit, 10) || appConfig.paginationLimit;
		const exams = await this.examNameModel.paginate(
			{},
			{ offset: offsetPayload, limit: limitPayload, sort: { created: -1 } }
		);
		if (!exams) {
			log.error(
				`ExamNameService - FIND ALL Exam - Request ID: ${reqId} - Found no exam - Message: "NOT_FOUND"`
			);
			throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
		}

		log.info(
			`ExamNameService - FIND ALL Exam - Request ID: ${reqId} - Successfully found all exams - ${exams}`
		);
		return exams;
	}
}
