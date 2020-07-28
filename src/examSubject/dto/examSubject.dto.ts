import { IsString, MinLength, IsNotEmpty, IsOptional, IsInt, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateExamSubjectDTO {
	@IsString()
	@IsNotEmpty()
	@MinLength(3, { message: "name must be at least three characters" })
	@ApiProperty({ type: String, description: "name" })
	name: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(7, { message: "description must be at least three characters" })
	@ApiProperty({ type: String, description: "description" })
	description: string;

	@IsInt()
	@IsNotEmpty({ message: "time is in minutes" })
	@Min(30, { message: "time must be at least 30 minutes" })
	@ApiProperty({ type: String, description: "time" })
	time: number;
}

export class UpdateExamSubjectDTO {
	@IsString()
	@IsNotEmpty()
	@MinLength(3, { message: "name must be at least three characters" })
	@IsOptional()
	@ApiProperty({ type: String, description: "name" })
	name: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(7, { message: "description must be at least seven characters" })
	@IsOptional()
	@ApiProperty({ type: String, description: "description" })
	description: string;

	@IsInt()
	@IsNotEmpty({ message: "time is in minutes" })
	@Min(30, { message: "time must be at least 30 minutes" })
	@IsOptional()
	@ApiProperty({ type: String, description: "time" })
	time: string;
}
