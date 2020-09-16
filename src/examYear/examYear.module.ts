import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ExamYearSchema } from "./schema/examYear.schema";
import { ExamYearService } from "./examYear.service";
import { ExamYearController } from "./examYear.controller";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: "ExamYear", schema: ExamYearSchema }])
	],
	providers: [ExamYearService],
	controllers: [ExamYearController],
	exports: [ExamYearService]
})
export class ExamYearModule {}
