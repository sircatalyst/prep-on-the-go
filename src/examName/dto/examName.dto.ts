import { IsString, MinLength, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateExamNameDTO {
	@IsString()
	@IsNotEmpty()
	@MinLength(3, { message: "name must be at least three characters" })
	@ApiProperty({ type: String, description: "name" })
	name: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(7, { message: "description must be at least seven characters" })
	@ApiProperty({ type: String, description: "description" })
	description: string;
}

export class UpdateExamNameDTO {
	@IsString()
	@IsNotEmpty()
	@MinLength(3, { message: "name must be at least three characters" })
	@IsOptional()
	@ApiProperty({ type: String, description: "name" })
	name: string;

	@IsNotEmpty()
	@MinLength(7, { message: "description must be at least seven characters" })
	@IsOptional()
	@ApiProperty({ type: String, description: "description" })
	description: string;
}
