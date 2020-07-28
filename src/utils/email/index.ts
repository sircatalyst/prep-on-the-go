import * as sgMail from "@sendgrid/mail";
import * as handlebars from "handlebars";
import * as handlebarsIntl from "handlebars-intl";
import * as fs from "fs";
import { resolve } from "path";
const resolvePath = resolve;

import "dotenv/config";
import ShortUniqueId from "short-unique-id";
import { log } from "../../middleware/log";

handlebarsIntl.registerWith(handlebars);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const { PROJECT_NAME, PORT, APP_URL, APP_VERSION } = process.env;

const url =
	process.env.NODE_ENV !== "production"
		? `http://localhost:${PORT}`
		: `${APP_URL}:${PORT}`;


/**
 * @description handles everything email
 */
export const Email = {
	/**
	 * @desc Sends Email
	 * @param {object} data {user, emailType, reqId, anyExtraParam}
	 * @desc {object} user - user object?
	 * @desc {string} emailType - what type of email is it?
	 * @desc {string} reqId - Log Request ID?
	 * @desc {string} anyExtraParam - any extra param such as
	 *  verify forget password code or account activation code
	 */
	send(data: any) {
		if (process.env.NODE_ENV === "test") {
			return true;
		}
		const { user, emailType, reqId, anyExtraParam } = data;
		const emailData: any = {};
		emailData.email = `${user.email}`;
		emailData.name = `${user.first_name}`;
		emailData.organization = `${PROJECT_NAME}`;

		switch (emailType) {
			case "welcome":
				emailData.subject = `Welcome to ${PROJECT_NAME}!`;
				emailData.activation = `${url}/api/${APP_VERSION}/auth/activate?activation_code=${user.activation_code}`;
				break;
			case "activated":
				emailData.subject = `Congratulations! Your ${PROJECT_NAME} has been activated!`;
				emailData.link = `${url}/api/${APP_VERSION}/auth/login`;
				break;
			case "forget":
				emailData.subject = `${PROJECT_NAME}: Reset Your Password!`;
				emailData.link = `${url}/api/${APP_VERSION}/auth/reset/${user.reset_password}`;
				break;
			case "reset_successfully":
				emailData.subject = `${PROJECT_NAME}: Password Changed Successfully!`;
				emailData.link = `${url}/api/${APP_VERSION}/auth/reset/${user.reset_password}`;
				emailData.login = `${url}/api/${APP_VERSION}/auth/login`;
				break;
			default:
				break;
		}
		/**
		 * @desc Prepare to send email
		 */
		const sender = `donotreply@${PROJECT_NAME}.com`;
		const msg: any = {
			to: user.email,
			from: sender,
			subject: emailData.subject,
			html: this.html(emailType, emailData)
		};

		/**
		 * @desc Don't throw error if email is not sent
		 * @param {string} resolve Don't return anything if email is sent successfully
		 * @param {string} reject Don't throw if there is an error
		 */
		return new Promise((resolve, reject) => {
			sgMail
				.send(msg)
				.then(result => {
					log.info(
						`EmailService - SENT ${emailType} - Request ID: ${reqId} - Successfully sent email - ${result}`
					);
				})
				.catch(error => {
					log.error(
						`EmailService - ERROR ${emailType} - Request ID: ${reqId} - Failure while sending email - Message: ${error}`
					);
				});
		});
	},

	/**
	 * @desc handles the appropriate email template to send
	 */
	html(emailTemplate: any, data: any) {
		const content = fs
			.readFileSync(
				resolvePath(
					`./src/utils/email/emailTemplates/${emailTemplate}.html`
				)
			)
			.toString("utf-8");
		const template = handlebars.compile(content, {
			noEscape: true
		});
		const intlData = {
			locales: "en-US"
		};

		return template(data, {
			data: { intl: intlData }
		});
	}
};
