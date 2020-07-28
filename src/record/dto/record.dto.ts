import {
	IsString,
	IsNotEmpty,
	IsHexadecimal,
	IsMongoId,
	IsBoolean,
	IsDateString,
	IsNumber
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateRecordDTO {
	user_id?: String;
	@IsBoolean({ message: "is_started must be either true or false" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "is_started" })
	is_started: boolean;

	@IsDateString({ message: "time_started must be a Date" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "time_started" })
	time_started: Date;

	@IsString()
	@IsHexadecimal({ message: "exam_name_id must be a valid mongo id" })
	@IsMongoId()
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "exam_name_id" })
	exam_name_id: string;

	@IsString()
	@IsHexadecimal({ message: "exam_type_id must be a valid mongo id" })
	@IsMongoId()
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "exam_type_id" })
	exam_type_id: string;

	@IsString()
	@IsHexadecimal({ message: "exam_paper_type_id must be a valid mongo id" })
	@IsMongoId()
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "exam_paper_type_id" })
	exam_paper_type_id: string;

	@IsString()
	@IsHexadecimal({ message: "exam_year_id must be a valid mongo id" })
	@IsMongoId()
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "exam_year_id" })
	exam_year_id: string;

	@IsString()
	@IsHexadecimal({ message: "exam_subject_id must be a valid mongo id" })
	@IsMongoId()
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "exam_subject_id" })
	exam_subject_id: string;
}

export class UpdateRecordDTO {
	@IsBoolean({ message: "is_completed must be either true or false" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "is_completed" })
	is_completed: boolean;

	@IsDateString({ message: "time_completed must be a Date" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "time_completed" })
	time_completed: Date;

	@IsNumber()
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "score" })
	score: number;
}
