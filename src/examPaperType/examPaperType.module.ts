import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ExamPaperTypeSchema } from "./schema/examPaperType.schema";
import { ExamPaperTypeService } from "./examPaperType.service";
import { ExamPaperTypeController } from "./examPaperType.controller";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: "ExamPaperType", schema: ExamPaperTypeSchema }])
	],
	providers: [ExamPaperTypeService],
	controllers: [ExamPaperTypeController],
	exports: [ExamPaperTypeService]
})
export class ExamPaperTypeModule {}
