import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { UserSchema } from "../user/schema/user.schema";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { UserModule } from "../user/user.module";
import { RecordModule } from "../record/record.module";

@Module({
	imports: [
		UserModule,
		RecordModule,
		MongooseModule.forFeature([{ name: "User", schema: UserSchema }])
	],
	providers: [AuthService, JwtStrategy],
	controllers: [AuthController],
	exports: [AuthService]
})
export class AuthModule {}
