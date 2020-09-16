import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ExamQuestionSchema } from "../examQuestion/schema/examQuestion.schema";
import { UserExamQuestionController } from "./userExamQuestion.controller";
import { UserExamQuestionService } from "./userExamQuestion.service";
import { ExamQuestionService } from "../examQuestion/examQuestion.service";
import { ExamNameSchema } from "../examName/schema/examName.schema";
import { ExamPaperTypeSchema } from "../examPaperType/schema/examPaperType.schema";
import { ExamYearSchema } from "../examYear/schema/examYear.schema";
import { ExamSubjectSchema } from "../examSubject/schema/examSubject.schema";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: "ExamQuestion", schema: ExamQuestionSchema },
			{ name: "ExamName", schema: ExamNameSchema },
			{ name: "ExamType", schema: ExamYearSchema },
			{ name: "ExamPaperType", schema: ExamPaperTypeSchema },
			{ name: "ExamYear", schema: ExamYearSchema },
			{ name: "ExamSubject", schema: ExamSubjectSchema }
		])
	],
	providers: [UserExamQuestionService, ExamQuestionService],
	controllers: [UserExamQuestionController],
	exports: [UserExamQuestionService]
})
export class UserExamQuestionModule {}
