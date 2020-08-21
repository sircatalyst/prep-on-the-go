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
import { ExamNameService } from "./examName.service";
import { AuthGuard } from "@nestjs/passport";
import {
	FindOneDTO
} from "../user/dto/user.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AdminGuard } from "../guards/adminGuard";
import { CreateExamNameDTO, UpdateExamNameDTO } from "./dto/examName.dto";
import { LoggedInUser } from "../utils/user.decorator";

@Controller("names")
// @UseInterceptors(CacheInterceptor)
@ApiBearerAuth("JWT")
@UsePipes(new ValidationPipe())
export class ExamNameController {
	constructor(private examNameService: ExamNameService) {}

	@Post()
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async createAnExamName(
		@Body() createExamPayload: CreateExamNameDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examNameService.createExamName(
			createExamPayload,
			loggedInUser
		);
		return { data };
	}

	@Get(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async getOneExamName(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examNameService.findOneExamName(id, loggedInUser);
		return { data };
	}

	@Get()
	async getAllExamNames(
		@Query() queryPayload: any,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examNameService.findAllExamName(
			queryPayload,
			loggedInUser
		);
		return { data };
	}

	@Patch(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async updateExamName(
		@Param() id: FindOneDTO,
		@Body() updatePayload: UpdateExamNameDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.examNameService.updateExamName(
			id,
			updatePayload,
			loggedInUser
		);
		return { data };
	}

	@Get(":id/deactivate")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async deactivateAnExamName(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const status = await this.examNameService.deactivateAnExamName(
			id,
			loggedInUser
		);
		return { data: { status } };
	}

	@Get(":id/activate")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async activateExamName(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const status = await this.examNameService.activateAnExamName(id, loggedInUser);
		return { data: { status } };
	}
}
