import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PaginateModel } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ExamPaperType } from "./interface/examPaperType.interface";
import { User } from "../user/interface/user.interface";

import { FindOneDTO } from "../user/dto/user.dto";
import { log } from "../middleware/Logs/log";
import ShortUniqueId from "short-unique-id";
import { appConfig } from "../config";
import { CreateExamPaperTypeDTO, UpdateExamPaperTypeDTO } from "./dto/examPaperType.dto";

const uniqueId = new ShortUniqueId();
const reqId = uniqueId();

@Injectable()
export class ExamPaperTypeService {
	constructor(@InjectModel("ExamPaperType") private examPaperTypeModel: PaginateModel<ExamPaperType>) {}

	/**
	 * @desc creates an exam
	 * @param createExamPayload {}
	 * @returns createdExam {}
	 */
	async createExamPaperType(
		createExamPayload: CreateExamPaperTypeDTO,
		loggedInUser
	): Promise<ExamPaperType> {
		const logData = `PAYLOAD: ${JSON.stringify(createExamPayload)}, User: ${
			loggedInUser.email
		}`;

		log.info(
			`ExamPaperTypeService - CREATE - Request ID: ${reqId} - started the process of creating an exam - ${logData}`
		);

		const { name, description } = createExamPayload;
		const existingExam = await this.examPaperTypeModel.findOne({ name });

		if (existingExam) {
			log.error(
				`ExamPaperTypeService - CREATE - Request ID: ${reqId} - Found an existing exam: ${createExamPayload.name} - Message: "Exam already exists"`
			);
			throw new HttpException(
				"Exam already exists",
				HttpStatus.BAD_REQUEST
			);
		}
		const createExam = new this.examPaperTypeModel(createExamPayload);
		const createdExam = await createExam.save();

		log.info(
			`ExamPaperTypeService - CREATE - Request ID: ${reqId} - Successfully created a new exam - ${logData}`
		);

		return createdExam;
	}

	/**
	 * @desc finds an exam
	 * @param param {param object}
	 * @returns createdExam {found exam}
	 */
	async findOneExamPaperType(param: any, loggedInUser): Promise<ExamPaperType> {
		const logData = `PARAM: ${JSON.stringify(
			param
		)}, USER: ${JSON.stringify(loggedInUser.email)}`;

		log.info(
			`ExamPaperTypeService - FIND ONE EXAM - Request ID: ${reqId} - started the process of find a exam - ${logData}`
		);

		try {
			const { id } = param;
			const exam = await this.examPaperTypeModel.findOne(
				{ _id: id },
				{ is_activated: 0 }
			);
			if (!exam) {
				log.error(
					`ExamPaperTypeService - FIND ONE EXAM - Request ID: ${reqId} - Found no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.info(
				`ExamPaperTypeService - FIND ONE USER - Request ID: ${reqId} - Successfully found a exam - ${exam}`
			);
			return exam;
		} catch (error) {
			if (
				error.message === "Not Found" ||
				/Cast to ObjectId/g.test(error.message)
			) {
				log.error(
					`ExamPaperTypeService - FIND ONE Exam - Request ID: ${reqId} - Found no Exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.error(
				`ExamPaperTypeService - FIND ONE Exam - Request ID: ${reqId} - Internal Server Error - Message: ${error.message}`
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
	async findAllExamPaperTypes(queryPayload, loggedInUser: any): Promise<any> {
		const logData = `USER: ${JSON.stringify(loggedInUser.email)}`;

		log.info(
			`ExamPaperTypeService - FIND ALL Exams - Request ID: ${reqId} - started the process of find all exams - ${logData}`
		);

		const { limit, offset } = queryPayload;
		const offsetPayload: number =
			parseInt(offset, 10) || appConfig.paginationOffset;
		const limitPayload: number =
			parseInt(limit, 10) || appConfig.paginationLimit;
		const exams = await this.examPaperTypeModel.paginate(
			{},
			{ offset: offsetPayload, limit: limitPayload }
		);
		if (!exams) {
			log.error(
				`ExamPaperTypeService - FIND ALL Exam - Request ID: ${reqId} - Found no exam - Message: "NOT_FOUND"`
			);
			throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
		}

		log.info(
			`ExamPaperTypeService - FIND ALL Exam - Request ID: ${reqId} - Successfully found all exams - ${exams}`
		);
		return exams;
	}

	/**
	 * @desc updates an exam
	 * @param param {contains exam id to update}
	 * @param updatePayload {contains the data to be updated}
	 * @returns updatedExam {}
	 */
	async updateExamPaperType(
		param: FindOneDTO,
		updatePayload: UpdateExamPaperTypeDTO,
		loggedInUser: User
	): Promise<ExamPaperType> {
		const logData = `PARAM: ${JSON.stringify(
			param
		)}, PAYLOAD: ${JSON.stringify(updatePayload)}, USER:${JSON.stringify(
			loggedInUser
		)}`;

		log.info(
			`ExamPaperTypeService - UPDATE AN Exam - Request ID: ${reqId} - started the process of updating an exam - ${logData}`
		);

		try {
			const { id } = param;
			const updatedExam = await this.examPaperTypeModel.findOneAndUpdate(
				{ _id: id },
				updatePayload,
				{
					new: true
				}
			);
			if (!updatedExam) {
				log.error(
					`ExamPaperTypeService - UPDATE AN Exam - Request ID: ${reqId} - Found and Updated no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("NOT_FOUND", HttpStatus.NOT_FOUND);
			}

			log.info(
				`ExamPaperTypeService - UPDATE AN Exam - Request ID: ${reqId} - Successfully found and updated a exam - ${updatedExam}`
			);
			return updatedExam;
		} catch (error) {
			if (
				error.message === "Not Found" ||
				/Cast to ObjectId/g.test(error.message)
			) {
				log.error(
					`ExamPaperTypeService - UPDATE AN Exam - Request ID: ${reqId} - Found and Updated no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.error(
				`ExamPaperTypeService - UPDATE A Exam - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
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
	async deactivateAnExamPaperType(
		param: FindOneDTO,
		loggedInUser: User
	): Promise<string> {
		const logData = `PARAM: ${JSON.stringify(param)} USER: ${JSON.stringify(
			loggedInUser.email
		)}`;

		log.info(
			`ExamPaperTypeService - DEACTIVATE AN EXAM - Request ID: ${reqId} - started the process of activating an exam - ${logData}`
		);

		try {
			const { id } = param;
			const exam = await this.examPaperTypeModel.findOneAndUpdate(
				{ _id: id },
				{ is_activated: 0 }
			);
			if (!exam) {
				log.error(
					`ExamPaperTypeService - DEACTIVATE AN Exam - Request ID: ${reqId} - Found and DEACTIVATE no exam - Message: "NOT_FOUND"`
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
					`ExamPaperTypeService - DEACTIVATE AN EXAM - Request ID: ${reqId} - Found and DEACTIVATED no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}

			log.error(
				`ExamPaperTypeService - DEACTIVATE AN EXAM - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
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
	async activateAnExamPaperType(
		param: FindOneDTO,
		loggedInUser: User
	): Promise<string> {
		const logData = `PARAM: ${JSON.stringify(param)} USER: ${JSON.stringify(
			loggedInUser.email
		)}`;

		log.info(
			`ExamPaperTypeService - ACTIVATE A EXAM - Request ID: ${reqId} - started the process of activating an exam - ${logData}`
		);

		try {
			const { id } = param;
			const exam = await this.examPaperTypeModel.findOneAndUpdate(
				{ _id: id },
				{ is_activated: 1 }
			);
			if (!exam) {
				log.error(
					`ExamPaperTypeService - ACTIVATE AN Exam - Request ID: ${reqId} - Found and ACTIVATED no exam - Message: "NOT_FOUND"`
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
					`ExamPaperTypeService - ACTIVATE AN EXAM - Request ID: ${reqId} - Found and ACTIVATED no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}

			log.error(
				`ExamPaperTypeService - ACTIVATE AN EXAM - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
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
	async findAllActivateExamPaperType(queryPayload, loggedInUser: any): Promise<any> {
		const logData = `USER: ${JSON.stringify(loggedInUser.email)}`;

		log.info(
			`ExamPaperTypeService - FIND ALL Exams - Request ID: ${reqId} - started the process of find all exams - ${logData}`
		);

		const { limit, offset } = queryPayload;
		const offsetPayload: number =
			parseInt(offset, 10) || appConfig.paginationOffset;
		const limitPayload: number =
			parseInt(limit, 10) || appConfig.paginationLimit;
		const exams = await this.examPaperTypeModel.paginate(
			{},
			{ offset: offsetPayload, limit: limitPayload }
		);
		if (!exams) {
			log.error(
				`ExamPaperTypeService - FIND ALL Exam - Request ID: ${reqId} - Found no exam - Message: "NOT_FOUND"`
			);
			throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
		}

		log.info(
			`ExamPaperTypeService - FIND ALL Exam - Request ID: ${reqId} - Successfully found all exams - ${exams}`
		);
		return exams;
	}
}
