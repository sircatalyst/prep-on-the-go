import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	/* eslint-disable-next-line */
	use(req: Request, res: Response, next: Function) {
		const reqMethod = req.method;
		const url = req.originalUrl;
		Logger.log(`REQUEST: ${reqMethod} ${url}`);
		next();
	}
}
