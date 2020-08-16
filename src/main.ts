import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule } from "@nestjs/swagger";
import * as helmet from "helmet";
import * as bodyParser from "body-parser";
import * as rateLimit from "express-rate-limit";
import { createDocument } from "./utils/swagger/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";

import { appConfig, swaggerConfig } from "./config/index";
import { LoggerInterceptor } from "./middleware/responseLogger";
import { HttpExceptionFilter } from "./middleware/errorFilter";

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		cors: true
	});
	app.setGlobalPrefix("api/v1");
	app.use(helmet());
	app.set("trust proxy", 1);
	app.use(
		rateLimit({
			windowMs: 15 * 60 * 1000, // 15 minutes
			max: 500, // limit each IP to 100 requests per windowMs
			message:
				"Too many requests from this IP, please try again after 15  mins"
		})
	);
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	SwaggerModule.setup(swaggerConfig.swaggerBaseUrl, app, createDocument(app));
	app.useGlobalFilters(new HttpExceptionFilter())
	app.useGlobalInterceptors(new LoggerInterceptor());
	await app.listen(appConfig.port);
}
bootstrap();
