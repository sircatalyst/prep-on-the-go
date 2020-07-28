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
	HttpCode,
	UseInterceptors,
	UploadedFile
} from "@nestjs/common";
import {
	LoginDTO,
	ForgetDTO,
	ActivateDTO,
	VerifyBodyDTO,
	ChangePasswordBodyDTO
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
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { fileFilter } from "../utils/upload";
import { appConfig } from "../config";
import { RecordService } from "../record/record.service";
import { CreateRecordDTO, UpdateRecordDTO } from "../record/dto/record.dto";

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

	@Patch("reset/:reset_password_code")
	async resetPassword(
		@Param("reset_password_code", new ParseUUIDPipe())
		reset_password_code: string,
		@Body() verifyPayload: VerifyBodyDTO
	): Promise<any> {
		ValidatePasswordForReset(verifyPayload);
		const status = await this.authService.resetPassword(
			reset_password_code,
			verifyPayload
		);
		return { data: { status } };
	}

	@Patch("change")
	@UseGuards(AuthGuard("jwt"))
	@ApiBearerAuth("JWT")
	async changePassword(
		@Body() verifyPayload: ChangePasswordBodyDTO,
		@LoggedInUser() loggedInUser: any
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
		@LoggedInUser() user: any
	): Promise<any> {
		user.id = user._id;
		const data = await this.userService.updateUserProfile(
			user,
			updatePayload
		);
		return { data };
	}

	@Post("records")
	@UseGuards(AuthGuard("jwt"))
	async createUserRecord(
		@Body() creatRecordPayload: CreateRecordDTO,
		@LoggedInUser() loggedInUser: any
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
		@Query() queryPayload: any,
		@LoggedInUser() loggedInUser: any
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
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const data = await this.recordService.getUserRecord(id, loggedInUser);
		return { data };
	}

	@Patch("records/:id")
	@UseGuards(AuthGuard("jwt"))
	async updateRecord(
		@Param() id: FindOneDTO,
		@Body() updatePayload: UpdateRecordDTO,
		@LoggedInUser() loggedInUser: any
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
	@UseInterceptors(
		FileInterceptor("avatar", {
			limits: {
				fileSize: appConfig.fileImageMaxSize
			},
			fileFilter: fileFilter,
			storage: memoryStorage()
		})
	)
	async uploadAvatar(
		@UploadedFile() file,
		@LoggedInUser() loggedInUser: any
	): Promise<any> {
		const user = await this.authService.uploadAvatar(file, loggedInUser);
		return { data: { user } };
	}
}
