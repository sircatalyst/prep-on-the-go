import { Module, CacheModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import * as redisStore from "cache-manager-redis-store";

import { ExamYearSchema } from "./schema/examYear.schema";
import { ExamYearService } from "./examYear.service";
import { ExamYearController } from "./examYear.controller";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: "ExamYear", schema: ExamYearSchema }]),
		// CacheModule.register({
		// 	store: redisStore,
		// 	ttl: appConfig.redisTime,
		// 	max: appConfig.redisMaxItem,
		// 	host: appConfig.redisHost,
		// 	port: appConfig.redisPort
		// })
	],
	providers: [ExamYearService],
	controllers: [ExamYearController],
	exports: [ExamYearService]
})
export class ExamYearModule {}
