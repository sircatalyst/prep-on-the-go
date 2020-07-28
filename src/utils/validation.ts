import { HttpStatus, HttpException } from "@nestjs/common";

/**
 * @description validates passwords for register
 */
export const ValidatePasswordForRegister = (payload): any => {
	const { confirm_password, password } = payload;
	if (confirm_password !== password) {
		throw new HttpException(
			"password field do not match confirm_password field",
			HttpStatus.BAD_REQUEST
		);
	}
	return;
}

/**
 * @description validates passwords for reset password
 */
export const ValidatePasswordForReset = (verifyPayload): any => {
	const { confirm_password, new_password } = verifyPayload;
	if (confirm_password !== new_password) {
		throw new HttpException(
			"new_password field do not match confirm_password field",
			HttpStatus.BAD_REQUEST
		);
	}
	return;
}

/**
 * @description validates passwords for change password
 */
export const ValidatePasswordForChange = (verifyPayload): any => {
	const { confirm_new_password, new_password } = verifyPayload;
	if (confirm_new_password !== new_password) {
		throw new HttpException(
			"new_password field do not match confirm_new_password field",
			HttpStatus.BAD_REQUEST
		);
	}
	return;
}
