import {
	Catch,
	ExceptionFilter,
	HttpStatus,
	HttpException,
	ArgumentsHost
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus()
			? exception.getStatus()
			: HttpStatus.INTERNAL_SERVER_ERROR;

		const errorResponse: any = {
			code: status,
			method: request.method,
			message:
				status !== HttpStatus.INTERNAL_SERVER_ERROR
					? exception.response.message || exception.response
					: "Internal Server Error"
		};
		if (exception.response.error) {
			errorResponse.error = exception.response.error;
		}

		response.status(status).json(errorResponse);
	}
}
