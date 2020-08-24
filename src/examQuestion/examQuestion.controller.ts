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
	Query,
	UseInterceptors,
	UploadedFile,
	Delete
} from "@nestjs/common";
import { ExamQuestionService } from "./examQuestion.service";
import { AuthGuard } from "@nestjs/passport";
import { FindOneDTO } from "../user/dto/user.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AdminGuard } from "../guards/adminGuard";
import {
	CreateExamQuestionDTO,
	UpdateExamQuestionDTO,
	UploadImageDTO
} from "./dto/examQuestion.dto";
import { LoggedInUser } from "../utils/user.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { fileFilter } from "../utils/upload";
import { appConfig } from "../config";

@Controller("admin/questions")
// @UseInterceptors(CacheInterceptor)
@ApiBearerAuth("JWT")
@UsePipes(new ValidationPipe())
export class ExamQuestionController {
	constructor(private examQuestionService: ExamQuestionService) {}

	@Post()
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async createAnExamQuestion(
		@Body() createExamPayload: CreateExamQuestionDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examQuestionService.createExamQuestion(
			createExamPayload,
			loggedInUser
		);
		return { data };
	}

	@Get(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async getOneExamQuestion(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examQuestionService.findOneExamQuestion(
			id,
			loggedInUser
		);
		return { data };
	}

	@Get()
	async getAllExamQuestions(
		@Query() queryPayload: any,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examQuestionService.findAllExamQuestion(
			queryPayload,
			loggedInUser
		);
		return { data };
	}

	@Patch(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async updateExamQuestion(
		@Param() id: FindOneDTO,
		@Body() updatePayload: UpdateExamQuestionDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examQuestionService.updateExamQuestion(
			id,
			updatePayload,
			loggedInUser
		);
		return { data };
	}

	@Get(":id/deactivate")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async deactivateAnExamQuestion(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const status = await this.examQuestionService.deactivateAnExamQuestion(
			id,
			loggedInUser
		);
		return { data: { status } };
	}

	@Get(":id/activate")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async activateExamQuestion(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const status = await this.examQuestionService.activateAnExamQuestion(
			id,
			loggedInUser
		);
		return { data: { status } };
	}
	
	@Post("image")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	@UseInterceptors(
		FileInterceptor("image", {
			limits: {
				fileSize: appConfig.fileImageMaxSize
			},
			fileFilter: fileFilter,
			storage: memoryStorage()
		})
	)
	async uploadImage(
		@Body() body: UploadImageDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const user = await this.examQuestionService.uploadImage(body, loggedInUser);
		return { data: { user } };
	}

	@Delete("image/:id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async deleteImage(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const user = await this.examQuestionService.deleteImage(id, loggedInUser);
		return { data: { user } };
	}
}
