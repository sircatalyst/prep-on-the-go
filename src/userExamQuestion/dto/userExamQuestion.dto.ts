import {
	IsString,
	IsNotEmpty,
	IsOptional,
	IsMongoId,
	IsHexadecimal,
	IsInt,
	IsNumber,
	IsDefined
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GetAnExamAllQuestionsDTO {
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

	@IsDefined()
	@IsOptional()
	@ApiProperty({ type: String, description: "limit" })
	limit?: string;

	@IsDefined()
	@IsOptional()
	@ApiProperty({ type: String, description: "offset" })
	offset?: string;
}
