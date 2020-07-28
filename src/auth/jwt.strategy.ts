import { Injectable, HttpStatus, HttpException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt, VerifiedCallback } from "passport-jwt";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../user/interface/user.interface";
import { Model } from "mongoose";
import { appConfig } from "../config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(@InjectModel("User") private userModel: Model<User>) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: appConfig.secretKey
		});
	}

	/**
	 * @desc validate a user
	 */
	async validate(payload: any, done: VerifiedCallback) {
		const { email, phone } = payload;

		const user = await this.userModel.findOne({ email, phone });

		if (!user) {
			return done(
				new HttpException(
					"Unauthorized access",
					HttpStatus.UNAUTHORIZED
				),
				null
			);
		}

		return done(null, user, payload.iat);
	}
}
