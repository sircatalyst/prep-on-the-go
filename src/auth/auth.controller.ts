import {
	Controller,
	Post,
	Body,
	UsePipes,
	ValidationPipe,
	Get,
	Param,
	Query,
	Patch,
	UseGuards,
	ParseUUIDPipe,
	HttpCode
} from "@nestjs/common";
import {
	LoginDTO,
	ForgetDTO,
	ActivateDTO,
	VerifyBodyDTO,
	ChangePasswordBodyDTO,
	TokenDTO
} from "./dto/auth.dto";
import { AuthService } from "./auth.service";
import { LoggedInUser } from "../utils/user.decorator";
import { AuthGuard } from "@nestjs/passport";
import {
	ValidatePasswordForRegister,
	ValidatePasswordForChange,
	ValidatePasswordForReset
} from "../utils/validation";
import { UserService } from "../user/user.service";
import {
	CreateUserDTO,
	UpdateUserProfileDTO,
	FindOneDTO
} from "../user/dto/user.dto";
import { ApiBearerAuth } from "@nestjs/swagger";
import { RecordService } from "../record/record.service";
import { CreateRecordDTO, UpdateRecordDTO } from "../record/dto/record.dto";
import { User } from "../user/interface/user.interface";
import { UploadImageDTO } from "../examQuestion/dto/examQuestion.dto";
import { queryPayloadType } from "../utils/types/types";

@Controller("auth")
@UsePipes(new ValidationPipe())
export class AuthController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
		private recordService: RecordService
	) {}

	@Post("register")
	async register(@Body() registerPayload: CreateUserDTO): Promise<any> {
		const { confirm_password, password } = registerPayload;
		ValidatePasswordForRegister({ confirm_password, password });
		const data = await this.userService.createUser(registerPayload);
		return { data };
	}

	@Post("login")
	@HttpCode(200)
	async login(@Body() loginPayload: LoginDTO): Promise<any> {
		const user = await this.authService.login(loginPayload);
		const token = await this.authService.createToken(user);
		return { data: user, token };
	}

	@Post("token")
	@HttpCode(201)
	async token(@Body() tokenPayload: TokenDTO): Promise<any> {
		const user = await this.authService.createRefreshToken(tokenPayload);
		const token = await this.authService.createToken(user);
		return { data: user, token };
	}

	@Get("activate")
	async activate(@Query() activation_code: ActivateDTO): Promise<any> {
		const user = await this.authService.activate(activation_code);
		return { data: user };
	}

	@Patch("forget")
	async forget(@Body() forgetPayload: ForgetDTO): Promise<any> {
		const status = await this.authService.forget(forgetPayload);
		return { data: { status } };
	}

	@Get("reset/:reset_password_code")
	async activateResetPassword(
		@Param("reset_password_code", new ParseUUIDPipe())
			reset_password_code: string
	): Promise<any> {
		const user = await this.authService.activateResetPassword(
			reset_password_code
		);
		const token = await this.authService.createToken(user);
		return { data: user, token };
	}

	@Patch("password")
	@UseGuards(AuthGuard("jwt"))
	@ApiBearerAuth("JWT")
	async resetPassword(
		@Body() verifyPayload: VerifyBodyDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		ValidatePasswordForReset(verifyPayload);
		const status = await this.authService.resetPassword(
			verifyPayload,
			loggedInUser
		);
		return { data: { status } };
	}

	@Patch("change")
	@UseGuards(AuthGuard("jwt"))
	@ApiBearerAuth("JWT")
	async changePassword(
		@Body() verifyPayload: ChangePasswordBodyDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		ValidatePasswordForChange(verifyPayload);
		const status = await this.authService.changePassword(
			verifyPayload,
			loggedInUser
		);
		return { data: { status } };
	}

	@Patch("profile")
	@UseGuards(AuthGuard("jwt"))
	async updateProfile(
		@Body() updatePayload: UpdateUserProfileDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		loggedInUser.id = loggedInUser._id;
		const data = await this.userService.updateUserProfile(
			updatePayload,
			loggedInUser
		);
		return { data };
	}

	@Post("records")
	@UseGuards(AuthGuard("jwt"))
	async createUserRecord(
		@Body() creatRecordPayload: CreateRecordDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const data = await this.recordService.createUserRecord(
			creatRecordPayload,
			loggedInUser
		);
		return { data };
	}

	@Get("records")
	@UseGuards(AuthGuard("jwt"))
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

	@Get("records/:id")
	@UseGuards(AuthGuard("jwt"))
	async getAUserSingleRecord(
		@Param() id: FindOneDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const data = await this.recordService.getUserRecord(id, loggedInUser);
		return { data };
	}

	@Patch("records/:id")
	@UseGuards(AuthGuard("jwt"))
	async updateRecord(
		@Param() id: FindOneDTO,
		@Body() updatePayload: UpdateRecordDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const data = await this.recordService.updateUserRecord(
			id,
			updatePayload,
			loggedInUser
		);
		return { data };
	}

	@Post("avatar")
	@UseGuards(AuthGuard("jwt"))
	async uploadAvatar(
		@Body() body: UploadImageDTO,
		@LoggedInUser() loggedInUser: User
	): Promise<any> {
		const user = await this.authService.uploadAvatar(body, loggedInUser);
		return { data: { user } };
	}
}
