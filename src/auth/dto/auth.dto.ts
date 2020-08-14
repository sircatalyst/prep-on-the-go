import {
	IsString,
	MinLength,
	IsEmail,
	IsNotEmpty,
	IsHexadecimal
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDTO {
	@IsString()
	@IsEmail()
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "email" })
	email: string;

	@IsNotEmpty()
	@MinLength(7, { message: "password must be at least seven characters" })
	@ApiProperty({ type: String, description: "password" })
	password: string;
}

export class ActivateDTO {
	@IsNotEmpty()
	@IsString()
	@MinLength(20)
	@ApiProperty({ type: String, description: "activation_code?" })
	activation_code: string;
}

export class TokenDTO {
	@IsString()
	@IsEmail()
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "email" })
	email: string;

	@IsNotEmpty()
	@IsHexadecimal({ message: "refreshToken must be a valid mongo id" })
	@MinLength(7, { message: "refreshToken must be at least seven characters" })
	@ApiProperty({ type: String, description: "refreshToken" })
	refreshToken: string;
}

export class VerifyBodyDTO {
	@IsNotEmpty()
	@MinLength(7, { message: "new_password must be at least seven characters" })
	@ApiProperty({ type: String, description: "new_password" })
	new_password: string;

	@IsNotEmpty()
	@MinLength(7, { message: "confirm_password must be at least seven characters" })
	@ApiProperty({ type: String, description: "confirm_password" })
	confirm_password: string;
}

export class ChangePasswordBodyDTO {
	@IsNotEmpty()
	@MinLength(7, { message: "old_password must be at least seven characters" })
	@ApiProperty({ type: String, description: "password" })
	old_password: string;

	@IsNotEmpty()
	@MinLength(7, { message: "new_password must be at least seven characters" })
	@ApiProperty({ type: String, description: "password" })
	new_password: string;

	@IsNotEmpty()
	@MinLength(7, { message: "confirm_new_password must be at least seven characters" })
	@ApiProperty({ type: String, description: "new_password" })
	confirm_new_password: string;
}

export class ForgetDTO {
	@IsString()
	@IsEmail()
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "email" })
	email: string;
}

