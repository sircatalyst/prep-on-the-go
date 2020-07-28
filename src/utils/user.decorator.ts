import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * @description gets logged in users object
 * @returns logged in user object
 */
export const LoggedInUser = createParamDecorator((data, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	return request.user;
});
