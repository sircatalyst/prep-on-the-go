import { User } from "../../user/interface/user.interface";

export interface refreshTokenDataType {
	email: string,
	refreshToken: string
}

export interface validateUserPayloadType {
	email: string,
	phone: string,
	iat: number
}

export interface queryPayloadType {
	limit?: string,
	offset?: string
}

export interface sendEmailType {
	user: User,
	emailType: string,
	reqId: string
}

export interface validatePasswordForRegisterType {
	confirm_password: string,
	password: string
}
export interface validatePasswordForResetType {
	confirm_password: string,
	new_password: string
}
export interface validatePasswordForChangeType {
	confirm_new_password: string,
	new_password: string
}