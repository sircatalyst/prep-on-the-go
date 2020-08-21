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
import { ExamTypeService } from "./examType.service";
import { AuthGuard } from "@nestjs/passport";
import {
	FindOneDTO
} from "../user/dto/user.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AdminGuard } from "../guards/adminGuard";
import { CreateExamTypeDTO, UpdateExamTypeDTO } from "./dto/examType.dto";
import { LoggedInUser } from "../utils/user.decorator";

@Controller("types")
// @UseInterceptors(CacheInterceptor)
@ApiBearerAuth("JWT")
@UsePipes(new ValidationPipe())
export class ExamTypeController {
	constructor(private examTypeService: ExamTypeService) {}

	@Post()
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async createExamType(
		@Body() createExamTypePayload: CreateExamTypeDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examTypeService.createExamType(
			createExamTypePayload,
			loggedInUser
		);
		return { data };
	}

	@Get(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async getOneExamType(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examTypeService.findOneExamType(id, loggedInUser);
		return { data };
	}

	@Get()
	async getAllExamTypes(
		@Query() queryPayload: any,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examTypeService.findAllExamTypes(
			queryPayload,
			loggedInUser
		);
		return { data };
	}

	@Patch(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async updateExam(
		@Param() id: FindOneDTO,
		@Body() updateTypePayload: UpdateExamTypeDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examTypeService.updateExamType(
			id,
			updateTypePayload,
			loggedInUser
		);
		return { data };
	}

	@Get(":id/deactivate")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async deactivateAnExamType(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const status = await this.examTypeService.deactivateAnExamType(
			id,
			loggedInUser
		);
		return { data: { status } };
	}

	@Get(":id/activate")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async activateExamType(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const status = await this.examTypeService.activateAnExamType(id, loggedInUser);
		return { data: { status } };
	}
}
