import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PaginateModel } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ExamSubject } from "./interface/examSubject.interface";
import { User } from "../user/interface/user.interface";

import { FindOneDTO } from "../user/dto/user.dto";
import { log } from "../middleware/log";
import ShortUniqueId from "short-unique-id";
import { appConfig } from "../config";
import { CreateExamSubjectDTO, UpdateExamSubjectDTO } from "./dto/examSubject.dto";

const uniqueId = new ShortUniqueId();
const reqId = uniqueId();

@Injectable()
export class ExamSubjectService {
	constructor(@InjectModel("ExamSubject") private examSubjectModel: PaginateModel<ExamSubject>) {}

	/**
	 * @desc creates an exam
	 * @param createExamPayload {}
	 * @returns createdExam {}
	 */
	async createExamSubject(
		createExamPayload: CreateExamSubjectDTO,
		loggedInUser
	): Promise<ExamSubject> {
		const logData = `PAYLOAD: ${JSON.stringify(createExamPayload)}, User: ${
			loggedInUser.email
		}`;

		log.info(
			`ExamSubjectService - CREATE - Request ID: ${reqId} - started the process of creating an exam - ${logData}`
		);

		const { name, description } = createExamPayload;
		const existingExam = await this.examSubjectModel.findOne({ name });

		if (existingExam) {
			log.error(
				`ExamSubjectService - CREATE - Request ID: ${reqId} - Found an existing exam: ${createExamPayload.name} - Message: "Exam already exists"`
			);
			throw new HttpException(
				"Exam Subject already exists",
				HttpStatus.BAD_REQUEST
			);
		}
		const createExam = new this.examSubjectModel(createExamPayload);
		const createdExam = await createExam.save();

		log.info(
			`ExamSubjectService - CREATE - Request ID: ${reqId} - Successfully created a new exam - ${logData}`
		);

		return createdExam;
	}

	/**
	 * @desc finds an exam
	 * @param param {param object}
	 * @returns createdExam {found exam}
	 */
	async findOneExamSubject(param: any, loggedInUser): Promise<ExamSubject> {
		const logData = `PARAM: ${JSON.stringify(
			param
		)}, USER: ${JSON.stringify(loggedInUser.email)}`;

		log.info(
			`ExamSubjectService - FIND ONE EXAM - Request ID: ${reqId} - started the process of find a exam - ${logData}`
		);

		try {
			const { id } = param;
			const exam = await this.examSubjectModel.findOne(
				{ _id: id },
				{ is_activated: 0 }
			);
			if (!exam) {
				log.error(
					`ExamSubjectService - FIND ONE EXAM - Request ID: ${reqId} - Found no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.info(
				`ExamSubjectService - FIND ONE USER - Request ID: ${reqId} - Successfully found a exam - ${exam}`
			);
			return exam;
		} catch (error) {
			if (
				error.message === "Not Found" ||
				/Cast to ObjectId/g.test(error.message)
			) {
				log.error(
					`ExamSubjectService - FIND ONE Exam - Request ID: ${reqId} - Found no Exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.error(
				`ExamSubjectService - FIND ONE Exam - Request ID: ${reqId} - Internal Server Error - Message: ${error.message}`
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
	async findAllExamSubject(queryPayload, loggedInUser: any): Promise<any> {
		const logData = `USER: ${JSON.stringify(loggedInUser.email)}`;

		log.info(
			`ExamSubjectService - FIND ALL Exams - Request ID: ${reqId} - started the process of find all exams - ${logData}`
		);

		const { limit, offset } = queryPayload;
		const offsetPayload: number =
			parseInt(offset, 10) || appConfig.paginationOffset;
		const limitPayload: number =
			parseInt(limit, 10) || appConfig.paginationLimit;
		const exams = await this.examSubjectModel.paginate(
			{},
			{ offset: offsetPayload, limit: limitPayload, sort: { created: -1 } }
		);
		if (!exams) {
			log.error(
				`ExamSubjectService - FIND ALL Exam - Request ID: ${reqId} - Found no exam - Message: "NOT_FOUND"`
			);
			throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
		}

		log.info(
			`ExamSubjectService - FIND ALL Exam - Request ID: ${reqId} - Successfully found all exams - ${exams}`
		);
		return exams;
	}

	/**
	 * @desc updates an exam
	 * @param param {contains exam id to update}
	 * @param updatePayload {contains the data to be updated}
	 * @returns updatedExam {}
	 */
	async updateExamSubject(
		param: FindOneDTO,
		updatePayload: UpdateExamSubjectDTO,
		loggedInUser: User
	): Promise<ExamSubject> {
		const logData = `PARAM: ${JSON.stringify(
			param
		)}, PAYLOAD: ${JSON.stringify(updatePayload)}, USER:${JSON.stringify(
			loggedInUser
		)}`;

		log.info(
			`ExamSubjectService - UPDATE AN Exam - Request ID: ${reqId} - started the process of updating an exam - ${logData}`
		);

		try {
			const { id } = param;
			const updatedExam = await this.examSubjectModel.findOneAndUpdate(
				{ _id: id },
				updatePayload,
				{
					new: true
				}
			);
			if (!updatedExam) {
				log.error(
					`ExamSubjectService - UPDATE AN Exam - Request ID: ${reqId} - Found and Updated no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("NOT_FOUND", HttpStatus.NOT_FOUND);
			}

			log.info(
				`ExamSubjectService - UPDATE AN Exam - Request ID: ${reqId} - Successfully found and updated a exam - ${updatedExam}`
			);
			return updatedExam;
		} catch (error) {
			if (
				error.message === "Not Found" ||
				/Cast to ObjectId/g.test(error.message)
			) {
				log.error(
					`ExamSubjectService - UPDATE AN Exam - Request ID: ${reqId} - Found and Updated no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.error(
				`ExamSubjectService - UPDATE A Exam - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
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
	async deactivateAnExamSubject(
		param: FindOneDTO,
		loggedInUser: User
	): Promise<string> {
		const logData = `PARAM: ${JSON.stringify(param)} USER: ${JSON.stringify(
			loggedInUser.email
		)}`;

		log.info(
			`ExamSubjectService - DEACTIVATE AN EXAM - Request ID: ${reqId} - started the process of activating an exam - ${logData}`
		);

		try {
			const { id } = param;
			const exam = await this.examSubjectModel.findOneAndUpdate(
				{ _id: id },
				{ is_activated: 0 }
			);
			if (!exam) {
				log.error(
					`ExamSubjectService - DEACTIVATE AN Exam - Request ID: ${reqId} - Found and DEACTIVATE no exam - Message: "NOT_FOUND"`
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
					`ExamSubjectService - DEACTIVATE AN EXAM - Request ID: ${reqId} - Found and DEACTIVATED no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}

			log.error(
				`ExamSubjectService - DEACTIVATE AN EXAM - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
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
	async activateAnExamSubject(
		param: FindOneDTO,
		loggedInUser: User
	): Promise<string> {
		const logData = `PARAM: ${JSON.stringify(param)} USER: ${JSON.stringify(
			loggedInUser.email
		)}`;

		log.info(
			`ExamSubjectService - ACTIVATE A EXAM - Request ID: ${reqId} - started the process of activating an exam - ${logData}`
		);

		try {
			const { id } = param;
			const exam = await this.examSubjectModel.findOneAndUpdate(
				{ _id: id },
				{ is_activated: 1 }
			);
			if (!exam) {
				log.error(
					`ExamSubjectService - ACTIVATE AN Exam - Request ID: ${reqId} - Found and ACTIVATED no exam - Message: "NOT_FOUND"`
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
					`ExamSubjectService - ACTIVATE AN EXAM - Request ID: ${reqId} - Found and ACTIVATED no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}

			log.error(
				`ExamSubjectService - ACTIVATE AN EXAM - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
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
	async findAllActivateExamSubject(queryPayload, loggedInUser: any): Promise<any> {
		const logData = `USER: ${JSON.stringify(loggedInUser.email)}`;

		log.info(
			`ExamSubjectService - FIND ALL Exams - Request ID: ${reqId} - started the process of find all exams - ${logData}`
		);

		const { limit, offset } = queryPayload;
		const offsetPayload: number =
			parseInt(offset, 10) || appConfig.paginationOffset;
		const limitPayload: number =
			parseInt(limit, 10) || appConfig.paginationLimit;
		const exams = await this.examSubjectModel.paginate(
			{},
			{ offset: offsetPayload, limit: limitPayload, sort: { created: -1 } }
		);
		if (!exams) {
			log.error(
				`ExamSubjectService - FIND ALL Exam - Request ID: ${reqId} - Found no exam - Message: "NOT_FOUND"`
			);
			throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
		}

		log.info(
			`ExamSubjectService - FIND ALL Exam - Request ID: ${reqId} - Successfully found all exams - ${exams}`
		);
		return exams;
	}
}
