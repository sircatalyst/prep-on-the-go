import {
	Module,
	NestModule,
	MiddlewareConsumer,
	CacheModule,
	CacheInterceptor
} from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { appConfig } from "./config/index";
import { AuthModule } from "./auth/auth.module";
import { LoggerMiddleware } from "./middleware/Logs/requestLogger";
import { UserModule } from "./user/user.module";
import { ExamNameModule } from "./examName/examName.module";
import { ExamTypeModule } from "./examType/examType.module";
import { ExamYearModule } from "./examYear/examYear.module";
import { ExamQuestionModule } from "./examQuestion/examQuestion.module";
import { ExamSubjectModule } from "./examSubject/examSubject.module";
import { ExamPaperTypeModule } from "./examPaperType/examPaperType.module";
import { UserExamQuestionModule } from "./userExamQuestion/userExamQuestion.module";

@Module({
	imports: [
		AuthModule,
		UserModule,
		ExamNameModule,
		ExamSubjectModule,
		ExamTypeModule,
		ExamPaperTypeModule,
		ExamYearModule,
		ExamQuestionModule,
		UserExamQuestionModule,
		MongooseModule.forRoot(appConfig.db, {
			useCreateIndex: true,
			useFindAndModify: false
		}),
		// CacheModule.register({
		// 	store: redisStore,
		// 	ttl: appConfig.redisTime,
		// 	max:appConfig.redisMaxItem,
		// 	host: appConfig.redisHost,
		// 	port: appConfig.redisPort
		// })
	],
	controllers: [AppController],
	providers: [
		AppService,
		// {
		// 	provide: APP_INTERCEPTOR,
		// 	useClass: CacheInterceptor
		// }
	]
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes("*");
	}
}
