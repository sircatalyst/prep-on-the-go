import { Module, CacheModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import * as redisStore from "cache-manager-redis-store";

import { ExamPaperTypeSchema } from "./schema/examPaperType.schema";
import { ExamPaperTypeService } from "./examPaperType.service";
import { ExamPaperTypeController } from "./examPaperType.controller";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: "ExamPaperType", schema: ExamPaperTypeSchema }]),
		// CacheModule.register({
		// 	store: redisStore,
		// 	ttl: appConfig.redisTime,
		// 	max: appConfig.redisMaxItem,
		// 	host: appConfig.redisHost,
		// 	port: appConfig.redisPort
		// })
	],
	providers: [ExamPaperTypeService],
	controllers: [ExamPaperTypeController],
	exports: [ExamPaperTypeService]
})
export class ExamPaperTypeModule {}
