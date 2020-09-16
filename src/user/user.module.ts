import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UserSchema } from "./schema/user.schema";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { RecordModule } from "../record/record.module";

@Module({
	imports: [
		RecordModule,
		MongooseModule.forFeature([{ name: "User", schema: UserSchema }])
	],
	providers: [UserService],
	controllers: [UserController],
	exports: [UserService]
})
export class UserModule {}
