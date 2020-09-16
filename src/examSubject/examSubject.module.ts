import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ExamSubjectSchema } from "./schema/examSubject.schema";
import { ExamSubjectService } from "./examSubject.service";
import { ExamSubjectController } from "./examSubject.controller";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: "ExamSubject", schema: ExamSubjectSchema }]),
		// CacheModule.register({
		// 	store: redisStore,
		// 	ttl: appConfig.redisTime,
		// 	max: appConfig.redisMaxItem,
		// 	host: appConfig.redisHost,
		// 	port: appConfig.redisPort
		// })
	],
	providers: [ExamSubjectService],
	controllers: [ExamSubjectController],
	exports: [ExamSubjectService]
})
export class ExamSubjectModule {}
