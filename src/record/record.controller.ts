import {
	Controller,
	UsePipes,
	ValidationPipe,
	Get,
	UseGuards,
	Param,
	Query
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {FindOneDTO,
} from "../user/dto/user.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AdminGuard } from "../guards/adminGuard";
import { RecordService } from "../record/record.service";
import { LoggedInUser } from "../utils/user.decorator";
import { queryPayloadType } from "../utils/types/types";
import { User } from "src/user/interface/user.interface";

@Controller("records")
@ApiBearerAuth("JWT")
@UsePipes(new ValidationPipe())
export class RecordController {
	constructor(
		private recordService: RecordService
	) {}

	@Get()
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async listAllRecordOfAUser(
		@Query() queryPayload: queryPayloadType,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const data = await this.recordService.listAllRecordOfAUser(
			queryPayload,
			loggedInUser
		);
		return { data };
	}

	@Get(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async getAUserSingleRecord(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const data = await this.recordService.getUserRecord(id, loggedInUser);
		return { data };
	}
}
