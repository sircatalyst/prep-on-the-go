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
	Query
} from "@nestjs/common";
import { ExamPaperTypeService } from "./examPaperType.service";
import { AuthGuard } from "@nestjs/passport";
import {
	FindOneDTO
} from "../user/dto/user.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AdminGuard } from "../guards/adminGuard";
import { CreateExamPaperTypeDTO, UpdateExamPaperTypeDTO } from "./dto/examPaperType.dto";
import { LoggedInUser } from "../utils/user.decorator";
import { User } from "../user/interface/user.interface";
import { queryPayloadType } from "../utils/types/types";

@Controller("papers")
@ApiBearerAuth("JWT")
@UsePipes(new ValidationPipe())
export class ExamPaperTypeController {
	constructor(private examTypeService: ExamPaperTypeService) {}

	@Post()
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async createExamPaperType(
		@Body() createExamPaperTypePayload: CreateExamPaperTypeDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const data = await this.examTypeService.createExamPaperType(
			createExamPaperTypePayload,
			loggedInUser
		);
		return { data };
	}

	@Get(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async getOneExamPaperType(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const data = await this.examTypeService.findOneExamPaperType(id, loggedInUser);
		return { data };
	}

	@Get()
	async getAllExamPaperTypes(
		@Query() queryPayload: queryPayloadType,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const data = await this.examTypeService.findAllExamPaperTypes(
			queryPayload,
			loggedInUser
		);
		return { data };
	}

	@Patch(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async updateExam(
		@Param() id: FindOneDTO,
		@Body() updateTypePayload: UpdateExamPaperTypeDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const data = await this.examTypeService.updateExamPaperType(
			id,
			updateTypePayload,
			loggedInUser
		);
		return { data };
	}

	@Get(":id/deactivate")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async deactivateAnExamPaperType(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const status = await this.examTypeService.deactivateAnExamPaperType(
			id,
			loggedInUser
		);
		return { data: { status } };
	}

	@Get(":id/activate")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async activateExamPaperType(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const status = await this.examTypeService.activateAnExamPaperType(id, loggedInUser);
		return { data: { status } };
	}
}
