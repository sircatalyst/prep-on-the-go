import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PaginateModel } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ExamQuestion } from "./interface/examQuestion.interface";
import { User } from "../user/interface/user.interface";

import { Amazon } from "../utils/upload";
import { FindOneDTO } from "../user/dto/user.dto";
import { log } from "../middleware/log";
import ShortUniqueId from "short-unique-id";
import { appConfig } from "../config";
import {
	CreateExamQuestionDTO,
	UpdateExamQuestionDTO
} from "./dto/examQuestion.dto";
import { ExamName } from "../examName/interface/examName.interface";
import { ExamYear } from "../examYear/interface/examYear.interface";
import { ExamType } from "../examType/interface/examType.interface";
import { ExamSubject } from "../examSubject/interface/examSubject.interface";
import { ExamPaperType } from "../examPaperType/interface/examPaperType.interface";

const uniqueId = new ShortUniqueId();
const reqId = uniqueId();

@Injectable()
export class ExamQuestionService {
	uploadAvatar(file: any, loggedInUser: any) {
		throw new Error("Method not implemented.");
	}
	constructor(
		@InjectModel("ExamQuestion")
		private examQuestionModel: PaginateModel<ExamQuestion>,
		@InjectModel("ExamName")
		private examNameModel: PaginateModel<ExamName>,
		@InjectModel("ExamYear")
		private examYearModel: PaginateModel<ExamYear>,
		@InjectModel("ExamType")
		private examTypeModel: PaginateModel<ExamType>,
		@InjectModel("ExamPaperType")
		private examPaperTypeModel: PaginateModel<ExamPaperType>,
		@InjectModel("ExamSubject")
		private examSubjectModel: PaginateModel<ExamSubject>
	) {}

	/**
	 * @desc creates an exam
	 * @param createExamQuestionPayload {}
	 * @returns createdExam {}
	 */
	async createExamQuestion(
		createExamQuestionPayload: CreateExamQuestionDTO,
		loggedInUser
	): Promise<ExamQuestion> {
		const logData = `PAYLOAD: ${JSON.stringify(
			createExamQuestionPayload
		)}, User: ${loggedInUser.email}`;

		log.info(
			`ExamQuestionService - CREATE - Request ID: ${reqId} - started the process of creating an exam - ${logData}`
		);

		const {
			question,
			question_number,
			exam_name_id,
			exam_subject_id,
			exam_type_id,
			exam_paper_type_id,
			exam_year_id
		} = createExamQuestionPayload;
		const allFinding = await Promise.all([
			await this.examNameModel.findOne({
				_id: exam_name_id
			}),
			await this.examSubjectModel.findOne({
				_id: exam_subject_id
			}),
			await this.examTypeModel.findOne({
				_id: exam_type_id
			}),
			await this.examPaperTypeModel.findOne({
				_id: exam_paper_type_id
			}),
			await this.examYearModel.findOne({
				_id: exam_year_id
			})
		]);

		if (!allFinding[0]) {
			throw new HttpException(
				"exam_name_id does not exist",
				HttpStatus.NOT_FOUND
			);
		}
		if (!allFinding[1]) {
			throw new HttpException(
				"exam_subject_id does not exist",
				HttpStatus.NOT_FOUND
			);
		}
		if (!allFinding[2]) {
			throw new HttpException(
				"exam_type_id does not exist",
				HttpStatus.NOT_FOUND
			);
		}
		if (!allFinding[3]) {
			throw new HttpException(
				"exam_paper_type_id does not exist",
				HttpStatus.NOT_FOUND
			);
		}
		if (!allFinding[4]) {
			throw new HttpException(
				"exam_year_id does not exist",
				HttpStatus.NOT_FOUND
			);
		}

		const existingExamQuestion = await this.examQuestionModel.findOne({
			question,
			exam_name_id,
			exam_subject_id,
			exam_type_id,
			exam_year_id
		});

		if (existingExamQuestion) {
			log.error(
				`ExamQuestionService - CREATE - Request ID: ${reqId} - Found an existing exam: ${createExamQuestionPayload.question} - Message: "Exam question already exists"`
			);
			throw new HttpException(
				"Exam question already exists",
				HttpStatus.BAD_REQUEST
			);
		}

		const existingExamQuestionNumber = await this.examQuestionModel.findOne(
			{
				question_number,
				exam_name_id,
				exam_subject_id,
				exam_type_id,
				exam_year_id
			}
		);

		if (existingExamQuestionNumber) {
			log.error(
				`ExamQuestionService - CREATE - Request ID: ${reqId} - Found an existing exam: ${createExamQuestionPayload.question} - Message: "Exam question number already exists"`
			);
			throw new HttpException(
				"Exam question number already exists",
				HttpStatus.BAD_REQUEST
			);
		}
		const createExamQuestion = new this.examQuestionModel(
			createExamQuestionPayload
		);
		const createdExam = await createExamQuestion.save();

		const populatedCreatedExam = await createdExam
			.populate("exam_name_id")
			.populate("exam_subject_id")
			.populate("exam_type_id")
			.populate("exam_year_id")
			.populate("exam_paper_type_id")
			.execPopulate();
		log.info(
			`ExamQuestionService - CREATE - Request ID: ${reqId} - Successfully created a new exam - ${logData}`
		);
		return populatedCreatedExam;
	}

	/**
	 * @desc finds an exam
	 * @param param {param object}
	 * @returns createdExam {found exam}
	 */
	async findOneExamQuestion(
		param: any,
		loggedInUser?
	): Promise<ExamQuestion> {
		const userEmail =
			loggedInUser === undefined ? "NotLoggedInUser" : loggedInUser.email;
		const logData = `PARAM: ${JSON.stringify(
			param
		)}, USER: ${JSON.stringify(userEmail)}`;

		log.info(
			`ExamQuestionService - FIND ONE EXAM - Request ID: ${reqId} - started the process of find a exam - ${logData}`
		);

		try {
			const { id } = param;
			const exam = await this.examQuestionModel.findOne(
				{ _id: id },
				{ is_activated: 0 }
			);
			if (!exam) {
				log.error(
					`ExamQuestionService - FIND ONE EXAM - Request ID: ${reqId} - Found no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.info(
				`ExamQuestionService - FIND ONE USER - Request ID: ${reqId} - Successfully found a exam - ${exam}`
			);
			return exam;
		} catch (error) {
			if (
				error.message === "Not Found" ||
				/Cast to ObjectId/g.test(error.message)
			) {
				log.error(
					`ExamQuestionService - FIND ONE Exam - Request ID: ${reqId} - Found no Exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.error(
				`ExamQuestionService - FIND ONE Exam - Request ID: ${reqId} - Internal Server Error - Message: ${error.message}`
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
	async findAllExamQuestion(queryPayload, loggedInUser: any = null): Promise<any> {
		const logData = loggedInUser === null ? "Unregistered user" : `USER: ${JSON.stringify(loggedInUser.email)}`;

		log.info(
			`ExamQuestionService - FIND ALL Exams - Request ID: ${reqId} - started the process of find all exams - ${logData}`
		);

		const { limit, offset } = queryPayload;
		const exams: any = {};
		if (limit || offset) {
			const offsetPayload: number =
				parseInt(offset, 10) || appConfig.paginationOffset;
			const limitPayload: number =
				parseInt(limit, 10) || appConfig.paginationLimit;
			exams.response = await this.examQuestionModel.paginate(
				{},
				{
					offset: offsetPayload,
					limit: limitPayload,
					sort: { question_number: -1 },
					populate: [
						"exam_name_id",
						"exam_subject_id",
						"exam_paper_type_id",
						"exam_type_id",
						"exam_year_id"
					]
				}
			);
		} else {
			exams.response = await this.examQuestionModel
				.find()
				.sort({ question_number: -1 })
				.populate([
					"exam_name_id",
					"exam_subject_id",
					"exam_paper_type_id",
					"exam_type_id",
					"exam_year_id"
				]);
		}
		if (!exams) {
			log.error(
				`ExamQuestionService - FIND ALL Exam - Request ID: ${reqId} - Found no exam - Message: "NOT_FOUND"`
			);
			throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
		}

		log.info(
			`ExamQuestionService - FIND ALL Exam - Request ID: ${reqId} - Successfully found all exams - ${exams}`
		);

		if (limit || offset) {
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
	async updateExamQuestion(
		param: FindOneDTO,
		updatePayload: UpdateExamQuestionDTO,
		loggedInUser: User
	): Promise<ExamQuestion> {
		const logData = `PARAM: ${JSON.stringify(
			param
		)}, PAYLOAD: ${JSON.stringify(updatePayload)}, USER:${JSON.stringify(
			loggedInUser
		)}`;

		log.info(
			`ExamQuestionService - UPDATE AN Exam - Request ID: ${reqId} - started the process of updating an exam - ${logData}`
		);

		try {
			const { id } = param;
			const updatedExam = await this.examQuestionModel.findOneAndUpdate(
				{ _id: id },
				updatePayload,
				{
					new: true
				}
			);
			if (!updatedExam) {
				log.error(
					`ExamQuestionService - UPDATE AN Exam - Request ID: ${reqId} - Found and Updated no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("NOT_FOUND", HttpStatus.NOT_FOUND);
			}

			log.info(
				`ExamQuestionService - UPDATE AN Exam - Request ID: ${reqId} - Successfully found and updated a exam - ${updatedExam}`
			);
			return updatedExam;
		} catch (error) {
			if (
				error.message === "Not Found" ||
				/Cast to ObjectId/g.test(error.message)
			) {
				log.error(
					`ExamQuestionService - UPDATE AN Exam - Request ID: ${reqId} - Found and Updated no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}
			log.error(
				`ExamQuestionService - UPDATE A Exam - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
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
	async deactivateAnExamQuestion(
		param: FindOneDTO,
		loggedInUser: User
	): Promise<string> {
		const logData = `PARAM: ${JSON.stringify(param)} USER: ${JSON.stringify(
			loggedInUser.email
		)}`;

		log.info(
			`ExamQuestionService - DEACTIVATE AN EXAM - Request ID: ${reqId} - started the process of activating an exam - ${logData}`
		);

		try {
			const { id } = param;
			const exam = await this.examQuestionModel.findOneAndUpdate(
				{ _id: id },
				{ is_activated: 0 }
			);
			if (!exam) {
				log.error(
					`ExamQuestionService - DEACTIVATE AN Exam - Request ID: ${reqId} - Found and DEACTIVATE no exam - Message: "NOT_FOUND"`
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
					`ExamQuestionService - DEACTIVATE AN EXAM - Request ID: ${reqId} - Found and DEACTIVATED no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}

			log.error(
				`ExamQuestionService - DEACTIVATE AN EXAM - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
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
	async activateAnExamQuestion(
		param: FindOneDTO,
		loggedInUser: User
	): Promise<string> {
		const logData = `PARAM: ${JSON.stringify(param)} USER: ${JSON.stringify(
			loggedInUser.email
		)}`;

		log.info(
			`ExamQuestionService - ACTIVATE A EXAM - Request ID: ${reqId} - started the process of activating an exam - ${logData}`
		);

		try {
			const { id } = param;
			const exam = await this.examQuestionModel.findOneAndUpdate(
				{ _id: id },
				{ is_activated: 1 }
			);
			if (!exam) {
				log.error(
					`ExamQuestionService - ACTIVATE AN Exam - Request ID: ${reqId} - Found and ACTIVATED no exam - Message: "NOT_FOUND"`
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
					`ExamQuestionService - ACTIVATE AN EXAM - Request ID: ${reqId} - Found and ACTIVATED no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}

			log.error(
				`ExamQuestionService - ACTIVATE AN EXAM - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
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
	async findAllActivateExamQuestion(
		queryPayload,
		loggedInUser: any
	): Promise<any> {
		const logData = `USER: ${JSON.stringify(loggedInUser.email)}`;

		log.info(
			`ExamQuestionService - FIND ALL Exams - Request ID: ${reqId} - started the process of find all exams - ${logData}`
		);

		const { limit, offset } = queryPayload;
		const offsetPayload: number =
			parseInt(offset, 10) || appConfig.paginationOffset;
		const limitPayload: number =
			parseInt(limit, 10) || appConfig.paginationLimit;
		const exams = await this.examQuestionModel.paginate(
			{},
			{
				offset: offsetPayload,
				limit: limitPayload,
				sort: { created: -1 }
			}
		);
		if (!exams) {
			log.error(
				`ExamQuestionService - FIND ALL Exam - Request ID: ${reqId} - Found no exam - Message: "NOT_FOUND"`
			);
			throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
		}

		log.info(
			`ExamQuestionService - FIND ALL Exam - Request ID: ${reqId} - Successfully found all exams - ${exams}`
		);
		return exams;
	}

	/**
	 * @desc UPDATES image
	 * @param image {}
	 * @param user {}
	 * @returns user with updated Image {}
	 */
	async uploadImage(body: any, user: any): Promise<any> {
		const logData = ` User: ${JSON.stringify(user.email)}`;
		log.info(
			`ExamQuestionService - UPLOAD Image - Request ID: ${reqId} - started the process of uploading an Image - ${logData}`
		);

		try {
			const ImageUrl = await Amazon.upload(body.image);
			if (!ImageUrl) {
				log.error(
					`ExamQuestionService - UPLOAD Image - Request ID: ${reqId} - Error uploading image to AWS S3 `
				);
				throw new HttpException(
					"Not Found",
					HttpStatus.UNPROCESSABLE_ENTITY
				);
			}
			log.info(
				`ExamQuestionService - UPLOAD Image - Request ID: ${reqId} - Successfully uploaded to AWS S3`
			);

			const updatedUser = await this.examQuestionModel.findOneAndUpdate(
				{ _id: body.id },
				{ image: ImageUrl },
				{
					new: true
				}
			);
			if (!updatedUser) {
				log.error(
					`ExamQuestionService - UPLOAD Image - Request ID: ${reqId} - Error in finding and updating a User: - ${logData} - Message: "UNPROCESSABLE ENTITY"`
				);
				throw new HttpException(
					"UNPROCESSABLE ENTITY",
					HttpStatus.UNPROCESSABLE_ENTITY
				);
			}

			log.info(
				`ExamQuestionService - UPLOAD Image - Request ID: ${reqId} - Successfully updated Database - ${updatedUser}`
			);

			return updatedUser;
		} catch (error) {
			log.error(
				`ExamQuestionService - UPLOAD Image - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
			);
			throw new HttpException(
				error.message,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}


	/**
	 * @desc Delete Image
	 * @param param 
	 * @returns success
	 */
	async deleteImage(
		param: FindOneDTO,
		loggedInUser: User
	): Promise<string> {
		const logData = `PARAM: ${JSON.stringify(param)} USER: ${JSON.stringify(
			loggedInUser.email
		)}`;
		log.info(
			`ExamQuestionService - DEACTIVATE AN EXAM - Request ID: ${reqId} - started the process of activating an exam - ${logData}`
		);

		try {
			const { id } = param;
			const exam = await this.examQuestionModel.findOneAndUpdate(
				{ _id: id },
				{ image: "" }
			);
			if (!exam) {
				log.error(
					`ExamQuestionService - DEACTIVATE AN Exam - Request ID: ${reqId} - Found and DEACTIVATE no exam - Message: "NOT_FOUND"`
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
					`ExamQuestionService - DEACTIVATE AN EXAM - Request ID: ${reqId} - Found and DEACTIVATED no exam - Message: "NOT_FOUND"`
				);
				throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
			}

			log.error(
				`ExamQuestionService - DEACTIVATE AN EXAM - Request ID: ${reqId} - INTERNAL SERVER ERROR - Message: ${error.message}`
			);

			throw new HttpException(
				error.message,
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}
}
