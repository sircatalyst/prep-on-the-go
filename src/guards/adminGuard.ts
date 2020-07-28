import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpStatus,
	HttpException
} from "@nestjs/common";

@Injectable()
export class AdminGuard implements CanActivate {
	constructor() {}
	canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		const user = request.user;
		if (user && user.role === "admin") {
			return true;
		}
		throw new HttpException("Unauthorized access", HttpStatus.UNAUTHORIZED);
	}
}
