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
	Delete,
	CacheInterceptor,
	Query
} from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthGuard } from "@nestjs/passport";
import { ValidatePasswordForRegister } from "../utils/validation";
import {
	CreateUserDTO,
	UpdateUserProfileDTO,
	FindOneDTO
} from "./dto/user.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { AdminGuard } from "../guards/adminGuard";
import { RecordService } from "../record/record.service";
import { LoggedInUser } from "../utils/user.decorator";

@Controller("users")
// @UseInterceptors(CacheInterceptor)
@ApiBearerAuth("JWT")
@UsePipes(new ValidationPipe())
export class UserController {
	constructor(
		private userService: UserService,
		private recordService: RecordService
	) {}

	@Post()
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async createUser(@Body() createUserPayload: CreateUserDTO): Promise<any> {
		const { confirm_password, password } = createUserPayload;
		ValidatePasswordForRegister({ confirm_password, password });
		const data = await this.userService.createUser(createUserPayload);
		return { data };
	}

	@Get(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async getOneUser(@Param() id: FindOneDTO): Promise<any> {
		const data = await this.userService.findOneUser(id);
		return { data };
	}

	@Get()
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async getAllUsers(@Query() queryPayload: any): Promise<any> {
		const data = await this.userService.findAllUsers(queryPayload);
		return { data };
	}

	@Patch(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async updateUserProfile(
		@Param() id: FindOneDTO,
		@Body() updatePayload: UpdateUserProfileDTO
	): Promise<any> {
		const data = await this.userService.updateUserProfile(
			id,
			updatePayload
		);
		return { data };
	}

	@Get(":id/records")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async listAllRecordOfAUser(
		@Query() queryPayload: any,
		@Param() userId: FindOneDTO,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.recordService.listAllRecordOfAUser(
			queryPayload,
			userId,
			loggedInUser
		);
		return { data };
	}

	@Delete(":id")
	@UseGuards(AuthGuard("jwt"), AdminGuard)
	async deleteUser(@Param() id: FindOneDTO): Promise<any> {
		const status = await this.userService.deleteAUser(id);
		return { data: { status } };
	}
}
