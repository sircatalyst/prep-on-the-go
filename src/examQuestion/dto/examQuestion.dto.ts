import {
	IsString,
	MinLength,
	IsNotEmpty,
	IsOptional,
	IsMongoId,
	IsHexadecimal,
	IsEnum,
	IsInt
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum answerOptions {
	A,
	B,
	C,
	D,
	E
}
export class CreateExamQuestionDTO {
	@IsString()
	@IsNotEmpty()
	@MinLength(7, { message: "question must be at least seven characters" })
	@ApiProperty({ type: String, description: "question" })
	question: string;

	@IsString()
	@IsOptional()
	@MinLength(7, { message: "instruction must be at least seven characters" })
	@ApiProperty({ type: String, description: "instruction" })
	instruction: string;

	@IsInt({ message: "question_number must be at a number" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "question_number" })
	question_number: number;

	@IsString()
	@IsEnum(answerOptions, { message: "answer must be either A,B,C,D or E" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "answer" })
	answer: string;

	@IsString()
	@IsNotEmpty()
	@IsMongoId()
	@IsHexadecimal({
		message: "exam_name_id must be at least twenty characters"
	})
	@ApiProperty({ type: String, description: "exam_name_id" })
	exam_name_id: string;

	@IsString()
	@IsNotEmpty()
	@IsMongoId()
	@IsHexadecimal({
		message: "exam_subject_id must be at least twenty characters"
	})
	@ApiProperty({ type: String, description: "exam_subject_id" })
	exam_subject_id: string;

	@IsString()
	@IsNotEmpty()
	@IsMongoId()
	@IsHexadecimal({
		message: "exam_type_id must be at least twenty characters"
	})
	@ApiProperty({ type: String, description: "exam_type_id" })
	exam_type_id: string;

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	@IsMongoId()
	@IsHexadecimal({
		message: "exam_paper_type_id must be at least twenty characters"
	})
	@ApiProperty({ type: String, description: "exam_paper_type_id" })
	exam_paper_type_id: string;

	@IsString()
	@IsNotEmpty()
	@IsMongoId()
	@IsHexadecimal({
		message: "exam_year_id must be at least twenty characters"
	})
	@ApiProperty({ type: String, description: "exam_year_id" })
	exam_year_id: string;

	@IsString()
	@MinLength(1, { message: "optionA must be a least a character" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "optionA" })
	optionA: string;

	@IsString()
	@MinLength(1, { message: "optionB must be a least a character" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "optionB" })
	optionB: string;

	@IsString({ message: "optionC must be a string" })
	@MinLength(1, { message: "optionC must be a least a character" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "optionC" })
	optionC: string;

	@IsString()
	@MinLength(1, { message: "optionD must be a least a character" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "optionD" })
	optionD: string;

	@IsString()
	@MinLength(1, { message: "optionE must be a least a character" })
	@IsNotEmpty()
	@IsOptional()
	@ApiProperty({ type: String, description: "optionE" })
	optionE?: string;

	@IsNotEmpty()
	@IsOptional()
	@MinLength(7, { message: "description must be at least three characters" })
	@ApiProperty({ type: String, description: "description" })
	description?: string;
}

export class UpdateExamQuestionDTO {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MinLength(7, { message: "question must be at least seven characters" })
	@ApiProperty({ type: String, description: "question" })
	question: string;

	@IsString()
	@IsOptional()
	@MinLength(7, { message: "instruction must be at least seven characters" })
	@ApiProperty({ type: String, description: "instruction" })
	instruction: string;
	
	@IsOptional()
	@IsInt({ message: "question_number must be at a number" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "question_number" })
	question_number: number;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MinLength(1, { message: "answer must be at least a character" })
	@ApiProperty({ type: String, description: "answer" })
	answer: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@IsMongoId()
	@IsHexadecimal({
		message: "exam_name_id must be at least twenty characters"
	})
	@ApiProperty({ type: String, description: "exam_name_id" })
	exam_name_id: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@IsMongoId()
	@IsHexadecimal({
		message: "exam_subject_id must be at least twenty characters"
	})
	@ApiProperty({ type: String, description: "exam_subject_id" })
	exam_subject_id: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@IsMongoId()
	@IsHexadecimal({
		message: "exam_type_id must be at least twenty characters"
	})
	@ApiProperty({ type: String, description: "exam_type_id" })
	exam_type_id: string;

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	@IsMongoId()
	@IsHexadecimal({
		message: "exam_paper_type_id must be at least twenty characters"
	})
	@ApiProperty({ type: String, description: "exam_paper_type_id" })
	exam_paper_type_id: string;

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@IsMongoId()
	@IsHexadecimal({
		message: "exam_year_id must be at least twenty characters"
	})
	@ApiProperty({ type: String, description: "exam_year_id" })
	exam_year_id: string;

	@IsOptional()
	@IsString()
	@MinLength(1, { message: "optionA must be a least a character" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "optionA" })
	optionA: string;

	@IsOptional()
	@IsString()
	@MinLength(1, { message: "optionB must be a least a character" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "optionB" })
	optionB: string;

	@IsOptional()
	@IsString({ message: "optionC must be a string" })
	@MinLength(1, { message: "optionC must be a least a character" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "optionC" })
	optionC: string;

	@IsOptional()
	@IsString()
	@MinLength(1, { message: "optionD must be a least a character" })
	@IsNotEmpty()
	@ApiProperty({ type: String, description: "optionD" })
	optionD: string;

	@IsOptional()
	@IsString()
	@MinLength(1, { message: "optionE must be a least a character" })
	@IsNotEmpty()
	@IsOptional()
	@ApiProperty({ type: String, description: "optionE" })
	optionE: string;

	@IsOptional()
	@IsNotEmpty()
	@IsOptional()
	@MinLength(7, { message: "description must be at least three characters" })
	@ApiProperty({ type: String, description: "description" })
	description: string;
}
