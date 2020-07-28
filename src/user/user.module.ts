import { Module, CacheModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import * as redisStore from "cache-manager-redis-store";

import { UserSchema } from "./schema/user.schema";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { appConfig } from "../config/index";
import { RecordModule } from "../record/record.module";

@Module({
	imports: [
		RecordModule,
		MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
		// CacheModule.register({
		// 	store: redisStore,
		// 	ttl: appConfig.redisTime,
		// 	max: appConfig.redisMaxItem,
		// 	host: appConfig.redisHost,
		// 	port: appConfig.redisPort
		// })
	],
	providers: [UserService],
	controllers: [UserController],
	exports: [UserService]
})
export class UserModule {}
