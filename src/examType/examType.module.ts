import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ExamTypeSchema } from "./schema/examType.schema";
import { ExamTypeService } from "./examType.service";
import { ExamTypeController } from "./examType.controller";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: "ExamType", schema: ExamTypeSchema }])
	],
	providers: [ExamTypeService],
	controllers: [ExamTypeController],
	exports: [ExamTypeService]
})
export class ExamTypeModule {}
