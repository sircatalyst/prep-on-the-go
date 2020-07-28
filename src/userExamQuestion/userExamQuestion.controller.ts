import {
	Controller,
	UsePipes,
	ValidationPipe,
	Get,
	Param,
	CacheInterceptor,
	Query
} from "@nestjs/common";
import { UserExamQuestionService } from "./userExamQuestion.service";
import { FindOneDTO } from "../user/dto/user.dto";
import { GetAnExamAllQuestionsDTO } from "./dto/userExamQuestion.dto";
import { ExamQuestionService } from "../examQuestion/examQuestion.service";

@Controller("students/questions")
// @UseInterceptors(CacheInterceptor)
@UsePipes(new ValidationPipe())
export class UserExamQuestionController {
	constructor(
		private userExamQuestionService: UserExamQuestionService,
		private examQuestionService: ExamQuestionService
	) {}

	@Get()
	async getAnExamAllQuestions(
		@Query() queryPayload: GetAnExamAllQuestionsDTO
	): Promise<any> {
		const data = await this.userExamQuestionService.findAllQuestionsForAnExam(
			queryPayload
		);
		return { data };
	}

	@Get(":id")
	async getAnExamOneQuestion(@Param() id: FindOneDTO): Promise<any> {
		const data = await this.examQuestionService.findOneExamQuestion(id);
		return { data };
	}
}
