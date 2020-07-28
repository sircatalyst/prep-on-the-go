import { Module, CacheModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import * as redisStore from "cache-manager-redis-store";

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
		// CacheModule.register({
		// 	store: redisStore,
		// 	ttl: appConfig.redisTime,
		// 	max: appConfig.redisMaxItem,
		// 	host: appConfig.redisHost,
		// 	port: appConfig.redisPort
		// })
	],
	providers: [UserExamQuestionService, ExamQuestionService],
	controllers: [UserExamQuestionController],
	exports: [UserExamQuestionService]
})
export class UserExamQuestionModule {}
