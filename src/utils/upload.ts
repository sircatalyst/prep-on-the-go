import * as AWS from "aws-sdk";
import "dotenv/config";
import { extname } from "path";
import { HttpException, HttpStatus } from "@nestjs/common";


/**
 * @description instantiate s3
 */
const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ID,
	secretAccessKey: process.env.AWS_SECRET
});


/**
 * @description handles everything upload
 */
export const Amazon = {
	
	/**
	 * @description generate unique string based on time
	 */
	appendTimeToFile() {
		const todayTime = new Date();
		const todayTimeInString = todayTime.toJSON();
		return todayTimeInString.replace(/:|T/g, "-");
	},
		
	/**
	 * @description validates passwords for reset password
	 * @param file object
	 * @returns uploaded file url
	 */
	uploadWithFormData(file): any {
		if (file !== null) {
			const filePropertyArray = file.originalname.split(".");
			const myFileName = file.originalname.split(".")[0];
			const fileType = file.originalname.split(".")[
				filePropertyArray.length - 1
			];
			const presentTime = this.appendTimeToFile();
			const params = {
				Bucket: `${process.env.AWS_BUCKET_NAME}/avatar`,
				Key: `${presentTime}-${myFileName}.${fileType}`,
				Body: file.buffer,
				ACL: "public-read"
			};
			return new Promise((resolve, reject) => {
				s3.upload(params, (err, data) => {
					if (err) {
						reject(err);
					}
					if (data !== undefined) {
						
						resolve(data.Location);
					}
					return err;
				});
			});
		}
		return Promise.reject(new Error("Kindly upload a valid media"));
	},

	/**
	 * @description validates passwords for reset password
	 * with image base 64 in the body payload
	 * @param file object
	 * @returns uploaded file url
	 */
	upload(file): any {
		const re = /image\/\w+/;
		console.log('file', file)
        if (file !== undefined) {
            const contentType = file.match(re)[0];
            const imageBuffer = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ''), 'base64');

			const extension = contentType.replace('image/', '');
			const presentTime = this.appendTimeToFile();
            const fileName = `${presentTime}.${extension}`;
            const params = {
				Bucket: `${process.env.AWS_BUCKET_NAME}/${process.env.PROJECT_NAME}/images`,
                Key: fileName,
                Body: imageBuffer,
                ContentEncoding: 'base64',
                ContentType: contentType,
                ACL: 'public-read'
            };

            return new Promise((resolve, reject) => {
                s3.upload(params, (err, data) => {
					if (err) {
						reject(err);
					}
					if (data !== undefined) {
						resolve(data.Location);
					}
					return err;
                });
            });
        }
		return Promise.reject(new Error("Kindly upload a valid image"));
	}
};

export const generateFilename = file => {
	return `${Date.now()}.${extname(file.originalname)}`;
};

export const fileFilter = (req: any, file: any, cb: any) => {
	if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
		cb(null, true);
	} else {
		cb(
			new HttpException(
				`Unsupported file type ${extname(file.originalname)}`,
				HttpStatus.BAD_REQUEST
			),
			false
		);
	}
};
