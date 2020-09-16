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
import { ExamYearService } from "./examYear.service";
import { AuthGuard } from "@nestjs/passport";
import {
	FindOneDTO
} from "../user/dto/user.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AdminGuard } from "../guards/adminGuard";
import { CreateExamYearDTO, UpdateExamYearDTO } from "./dto/examYear.dto";
import { LoggedInUser } from "../utils/user.decorator";
import { User } from "../user/interface/user.interface";
import { queryPayloadType } from "../utils/types/types";

@Controller("years")
@ApiBearerAuth("JWT")
@UsePipes(new ValidationPipe())
export class ExamYearController {
	constructor(private examYearService: ExamYearService) {}

	@Post()
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async createAnExamYear(
		@Body() createExamPayload: CreateExamYearDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const data = await this.examYearService.createExamYear(
			createExamPayload,
			loggedInUser
		);
		return { data };
	}

	@Get(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async getOneExamYear(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const data = await this.examYearService.findOneExamYear(id, loggedInUser);
		return { data };
	}

	@Get()
	async getAllExamYears(
		@Query() queryPayload: queryPayloadType,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const data = await this.examYearService.findAllExamYear(
			queryPayload,
			loggedInUser
		);
		return { data };
	}

	@Patch(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async updateExamYear(
		@Param() id: FindOneDTO,
		@Body() updatePayload: UpdateExamYearDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const data = await this.examYearService.updateExamYear(
			id,
			updatePayload,
			loggedInUser
		);
		return { data };
	}

	@Get(":id/deactivate")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async deactivateAnExamYear(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const status = await this.examYearService.deactivateAnExamYear(
			id,
			loggedInUser
		);
		return { data: { status } };
	}

	@Get(":id/activate")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async activateExamYear(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const status = await this.examYearService.activateAnExamYear(id, loggedInUser);
		return { data: { status } };
	}
}
