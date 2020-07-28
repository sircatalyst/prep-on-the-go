import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { RecordService } from "./record.service";
import { RecordSchema } from "./schema/record.schema";
import { RecordController } from "./record.controller";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: "Record", schema: RecordSchema }])
	],
	providers: [RecordService],
	controllers: [RecordController],
	exports: [RecordService]
})
export class RecordModule {}
