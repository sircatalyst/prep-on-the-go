import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ExamNameSchema } from "./schema/examName.schema";
import { ExamNameService } from "./examName.service";
import { ExamNameController } from "./examName.controller";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: "ExamName", schema: ExamNameSchema }])
	],
	providers: [ExamNameService],
	controllers: [ExamNameController],
	exports: [ExamNameService]
})
export class ExamNameModule {}
