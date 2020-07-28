import { Module, CacheModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import * as redisStore from "cache-manager-redis-store";

import { ExamQuestionSchema } from "./schema/examQuestion.schema";
import { ExamNameSchema } from "../examName/schema/examName.schema";
import { ExamTypeSchema } from "../examType/schema/examType.schema";
import { ExamSubjectSchema } from "../examSubject/schema/examSubject.schema";
import { ExamQuestionService } from "./examQuestion.service";
import { ExamQuestionController } from "./examQuestion.controller";
import { ExamSubjectModule } from "../examSubject/examSubject.module";
import { ExamTypeModule } from "../examType/examType.module";
import { ExamNameModule } from "../examName/examName.module";
import { ExamYearSchema } from "../examYear/schema/examYear.schema";
import { ExamPaperTypeSchema } from "../examPaperType/schema/examPaperType.schema";

@Module({
	imports: [
		ExamSubjectModule,
		ExamTypeModule,
		ExamNameModule,
		ExamTypeModule,
		MongooseModule.forFeature([
			{ name: "ExamQuestion", schema: ExamQuestionSchema },
			{ name: "ExamName", schema: ExamNameSchema },
			{ name: "ExamType", schema: ExamTypeSchema },
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
	providers: [ExamQuestionService],
	controllers: [ExamQuestionController],
	exports: [ExamQuestionService]
})
export class ExamQuestionModule {}
