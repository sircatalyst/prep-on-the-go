import { Module, CacheModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import * as redisStore from "cache-manager-redis-store";

import { ExamTypeSchema } from "./schema/examType.schema";
import { ExamTypeService } from "./examType.service";
import { ExamTypeController } from "./examType.controller";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: "ExamType", schema: ExamTypeSchema }]),
		// CacheModule.register({
		// 	store: redisStore,
		// 	ttl: appConfig.redisTime,
		// 	max: appConfig.redisMaxItem,
		// 	host: appConfig.redisHost,
		// 	port: appConfig.redisPort
		// })
	],
	providers: [ExamTypeService],
	controllers: [ExamTypeController],
	exports: [ExamTypeService]
})
export class ExamTypeModule {}
