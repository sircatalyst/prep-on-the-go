import { Module, CacheModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import * as redisStore from "cache-manager-redis-store";

import { ExamNameSchema } from "./schema/examName.schema";
import { ExamNameService } from "./examName.service";
import { ExamNameController } from "./examName.controller";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: "ExamName", schema: ExamNameSchema }]),
		// CacheModule.register({
		// 	store: redisStore,
		// 	ttl: appConfig.redisTime,
		// 	max: appConfig.redisMaxItem,
		// 	host: appConfig.redisHost,
		// 	port: appConfig.redisPort
		// })
	],
	providers: [ExamNameService],
	controllers: [ExamNameController],
	exports: [ExamNameService]
})
export class ExamNameModule {}
