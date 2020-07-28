import {
	Controller,
	UsePipes,
	ValidationPipe,
	Get,
	Patch,
	UseGuards,
	Param,
	Body,
	Post,
	CacheInterceptor,
	Query
} from "@nestjs/common";
import { ExamSubjectService } from "./examSubject.service";
import { AuthGuard } from "@nestjs/passport";
import {
	FindOneDTO
} from "../user/dto/user.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AdminGuard } from "../guards/adminGuard";
import { CreateExamSubjectDTO, UpdateExamSubjectDTO } from "./dto/examSubject.dto";
import { LoggedInUser } from "../utils/user.decorator";

@Controller("subjects")
// @UseInterceptors(CacheInterceptor)
@ApiBearerAuth("JWT")
@UsePipes(new ValidationPipe())
export class ExamSubjectController {
	constructor(private examNameService: ExamSubjectService) {}

	@Post()
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async createAnExamSubject(
		@Body() createExamPayload: CreateExamSubjectDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examNameService.createExamSubject(
			createExamPayload,
			loggedInUser
		);
		return { data };
	}

	@Get(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async getOneExamSubject(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examNameService.findOneExamSubject(id, loggedInUser);
		return { data };
	}

	@Get()
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async getAllExamSubjects(
		@Query() queryPayload: any,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examNameService.findAllExamSubject(
			queryPayload,
			loggedInUser
		);
		return { data };
	}

	@Patch(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async updateExamSubject(
		@Param() id: FindOneDTO,
		@Body() updatePayload: UpdateExamSubjectDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examNameService.updateExamSubject(
			id,
			updatePayload,
			loggedInUser
		);
		return { data };
	}

	@Get(":id/deactivate")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async deactivateAnExamSubject(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const status = await this.examNameService.deactivateAnExamSubject(
			id,
			loggedInUser
		);
		return { data: { status } };
	}

	@Get(":id/activate")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async activateExamSubject(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const status = await this.examNameService.activateAnExamSubject(id, loggedInUser);
		return { data: { status } };
	}
}
