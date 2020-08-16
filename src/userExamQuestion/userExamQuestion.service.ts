import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PaginateModel } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ExamQuestion } from "../examQuestion/interface/examQuestion.interface";

import { log } from "../middleware/log";
import ShortUniqueId from "short-unique-id";
import { appConfig } from "../config";
import { GetAnExamAllQuestionsDTO } from "./dto/userExamQuestion.dto";
import { ExamName } from "../examName/interface/examName.interface";
import { ExamYear } from "../examYear/interface/examYear.interface";
import { ExamType } from "../examType/interface/examType.interface";
import { ExamPaperType } from "../examPaperType/interface/examPaperType.interface";
import { ExamSubject } from "../examSubject/interface/examSubject.interface";

const uniqueId = new ShortUniqueId();
const reqId = uniqueId();

@Injectable()
export class UserExamQuestionService {
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
	 * @desc finds all exams
	 * @param param? {limit or offset}
	 * @returns exams {}
	 */
	async findAllQuestionsForAnExam(
		queryPayload: GetAnExamAllQuestionsDTO
	): Promise<any> {
		const logData = `USER:`;

		log.info(
			`ExamQuestionService - FIND ALL Exams - Request ID: ${reqId} - started the process of find all exams - ${logData}`
		);

		const {
			limit,
			offset,
			exam_name_id,
			exam_type_id,
			exam_subject_id,
			exam_paper_type_id,
			exam_year_id
		} = queryPayload;
		if (
			!exam_name_id ||
			!exam_type_id ||
			!exam_subject_id ||
			!exam_paper_type_id ||
			!exam_year_id
		) {
			throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
		}

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

		const offsetPayload: number =
			parseInt(offset, 10) || appConfig.paginationOffset;
		const limitPayload: number =
			parseInt(limit, 10) || appConfig.paginationLimit;
		const exams = await this.examQuestionModel.paginate(
			{
				exam_name_id,
				exam_type_id,
				exam_subject_id,
				exam_paper_type_id,
				exam_year_id
			},
			{ offset: offsetPayload, limit: limitPayload, sort: { question_number: 1 } }
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
}
