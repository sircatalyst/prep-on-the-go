import { HttpStatus, HttpException } from "@nestjs/common";
import { validatePasswordForChangeType, validatePasswordForRegisterType, validatePasswordForResetType } from "./types/types";

/**
 * @description validates passwords for register
 */
export const ValidatePasswordForRegister = (payload: validatePasswordForRegisterType): void => {
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
export const ValidatePasswordForReset = (verifyPayload: validatePasswordForResetType): void => {
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
export const ValidatePasswordForChange = (verifyPayload: validatePasswordForChangeType): void => {
	const { confirm_new_password, new_password } = verifyPayload;
	if (confirm_new_password !== new_password) {
		throw new HttpException(
			"new_password field do not match confirm_new_password field",
			HttpStatus.BAD_REQUEST
		);
	}
	return;
}
