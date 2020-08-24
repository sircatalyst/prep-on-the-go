import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus } from "@nestjs/common";
import * as request from "supertest";
import * as mongoose from "mongoose";

import { AppModule } from "../src/app.module";
import { CreateUserDTO, UpdateUserProfileDTO } from "../src/user/dto/user.dto";
import { appConfig } from "../src/config";
import { test } from "./fixture/index";

import "dotenv/config";
import {
	LoginDTO,
	VerifyBodyDTO,
	ChangePasswordBodyDTO
} from "../src/auth/dto/auth.dto";
import { CreateRecordDTO, UpdateRecordDTO } from "src/record/dto/record.dto";

let app: INestApplication;
beforeAll(async () => {
	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule]
	}).compile();

	app = moduleFixture.createNestApplication();
	await app.init();
	await mongoose.connect(appConfig.db);
	await mongoose.connection.dropDatabase();
});

afterAll(async done => {
	await mongoose.connect(appConfig.db, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
	await mongoose.connection.dropDatabase();
	await mongoose.disconnect();
	await app.close();
	done();
});

const registerData: CreateUserDTO = {
	email: "temibami@gmail.com",
	password: "password",
	confirm_password: "password",
	phone: "08134849551",
	first_name: "Temitope",
	last_name: "Bamidele"
};
const createRecordData: CreateRecordDTO = {
	is_started: true,
	time_started: new Date(),
	is_completed: true,
	time_completed: new Date(),
	exam_name_id: "5f1df29fd86c3324287ad279",
	exam_subject_id: "5f1e6e51cc5bac415c068364",
	exam_type_id: "5f1e70b142eda029184c249e",
	exam_paper_type_id: "5f1e70b142eda029184c249e",
	exam_year_id: "5f1e7265de47fb28f44a2605",
	total: 10,
	score: 10
};

const updateRecordData: UpdateRecordDTO = {
	is_started: true,
	time_started: new Date(),
	is_completed: true,
	time_completed: new Date(),
	exam_name_id: "5f1df29fd86c3324287ad279",
	exam_subject_id: "5f1e6e51cc5bac415c068364",
	exam_type_id: "5f1e70b142eda029184c249e",
	exam_paper_type_id: "5f1e70b142eda029184c249e",
	exam_year_id: "5f1e7265de47fb28f44a2605",
	total: 10,
	score: 90
};
const loginData: LoginDTO = {
	email: "temibami@gmail.com",
	password: "password"
};
const resetPasswordData: VerifyBodyDTO = {
	new_password: "password1",
	confirm_password: "password1"
};
const changePasswordData: ChangePasswordBodyDTO = {
	old_password: "password",
	new_password: "password1",
	confirm_new_password: "password1"
};
const updateProfileData: UpdateUserProfileDTO = {
	first_name: "Abraham",
	last_name: "Lincoln"
};

describe("POST, Register  User", () => {
	afterAll(async () => {
		await mongoose.connection.dropDatabase();
	});

	it("Should fail if no data is sumbitted", () => {
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send()
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(15);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if email is not sumbitted", () => {
		const data = { ...registerData };
		delete data.email;
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(3);
				expect(body.message[0]).toEqual("email should not be empty");
				expect(body.message[1]).toEqual("email must be an email");
				expect(body.message[2]).toEqual("email must be a string");
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if email is invalid is not sumbitted", () => {
		const data = { ...registerData };
		data.email = "twtwmai";
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual("email must be an email");
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if password is not sumbitted", () => {
		const data = { ...registerData };
		delete data.password;
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(2);
				expect(body.message[0]).toEqual(
					"password must be at least seven characters"
				);
				expect(body.message[1]).toEqual("password should not be empty");
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if password is less than 7 character is not sumbitted", () => {
		const data = { ...registerData };
		data.password = "hi";
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"password must be at least seven characters"
				);
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if confirm_password is less than seven character", () => {
		const data = { ...registerData };
		data.confirm_password = "hi";
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"confirm_password must be at least seven characters"
				);
				expect(body.error).toEqual("Bad Request");
				expect(body.statusCode).toEqual(400);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if confirm_password is not the same with password sumbitted", () => {
		const data = { ...registerData };
		data.confirm_password = "hdfffdfdfdi";
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message).toEqual(
					"password field do not match confirm_password field"
				);
				expect(body.statusCode).toEqual(400);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if phone number is not submitted", () => {
		const data = { ...registerData };
		delete data.phone;
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(4);
				expect(body.message[0]).toEqual("phone should not be empty");
				expect(body.message[1]).toEqual(
					"phone must be shorter than or equal to 14 characters"
				);
				expect(body.message[2]).toEqual(
					"phone must be longer than or equal to 11 characters"
				);
				expect(body.message[3]).toEqual(
					"phone must be a valid phone number"
				);
				expect(body.error).toEqual("Bad Request");
				expect(body.statusCode).toEqual(400);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if phone number is invalid", () => {
		const data = { ...registerData };
		data.phone = "545382832838";
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message[0]).toEqual(
					"phone must be a valid phone number"
				);
				expect(body.error).toEqual("Bad Request");
				expect(body.statusCode).toEqual(400);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if phone number is incomplete", () => {
		const data = { ...registerData };
		data.phone = "08023456";
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(2);
				expect(body.message[0]).toEqual(
					"phone must be longer than or equal to 11 characters"
				);
				expect(body.message[1]).toEqual(
					"phone must be a valid phone number"
				);
				expect(body.error).toEqual("Bad Request");
				expect(body.statusCode).toEqual(400);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if first_name is not submitted", () => {
		const data = { ...registerData };
		delete data.first_name;
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(2);
				expect(body.message[0]).toEqual(
					"first_name should not be empty"
				);
				expect(body.message[1]).toEqual(
					"first_name must be longer than or equal to 3 characters"
				);
				expect(body.error).toEqual("Bad Request");
				expect(body.statusCode).toEqual(400);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if first_name less than three characters is not submitted", () => {
		const data = { ...registerData };
		data.first_name = "hi";
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"first_name must be longer than or equal to 3 characters"
				);
				expect(body.error).toEqual("Bad Request");
				expect(body.statusCode).toEqual(400);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if last_name is not submitted", () => {
		const data = { ...registerData };
		delete data.last_name;
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(2);
				expect(body.message[0]).toEqual(
					"last_name should not be empty"
				);
				expect(body.message[1]).toEqual(
					"last_name must be longer than or equal to 3 characters"
				);
				expect(body.error).toEqual("Bad Request");
				expect(body.statusCode).toEqual(400);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if last_name less than three characters is not submitted", () => {
		const data = { ...registerData };
		data.last_name = "hi";
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"last_name must be longer than or equal to 3 characters"
				);
				expect(body.error).toEqual("Bad Request");
				expect(body.statusCode).toEqual(400);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should Register successfully if all data are valid", () => {
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
			.expect(({ body }) => {
				expect(Object.keys(body.data).length).toEqual(16);
				expect(body.data.email).toEqual(registerData.email);
				expect(body.data.phone).toEqual(registerData.phone);
				expect(body.data.first_name).toEqual(registerData.first_name);
				expect(body.data.last_name).toEqual(registerData.last_name);
				expect(body.data.password).toBeUndefined();
				expect(body.data.token).toBeUndefined();
			})
			.expect(HttpStatus.CREATED);
	});

	it("Should fail if user (with same email or phone) has not verified account", () => {
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
			.expect(({ body }) => {
				expect(body.message).toEqual(
					"User already exists, Please kindly verify your account"
				);
				expect(body.statusCode).toEqual(400);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if same phone number tries to register more than once", () => {
		const data = { ...registerData };
		data.email = "a@gmail.com";
		return test
			.createUser()
			.then(() => {
				return request(app.getHttpServer())
					.post("/auth/register")
					.set("Accept", "application/json")
					.send(data)
					.expect(({ body }) => {
						expect(body.message).toEqual(
							"User with this phone number already exists"
						);
						expect(body.statusCode).toEqual(400);
					})
					.expect(HttpStatus.BAD_REQUEST);
			})
			.catch((err: any) => {
				return err;
			});
	});

	it("Should fail if activated email tries to register more than once", async () => {
		const res = await test.activateUser(registerData.email);
		const data = { ...registerData };
		data.phone = "08134567881";
		data.email = "temibami@gmail.com";
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message).toEqual("User already exists");
				expect(body.statusCode).toEqual(400);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});
});

describe("Post Login", () => {
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
			.expect(({ body }) => {})
			.expect(HttpStatus.CREATED);
		await test.activateUser(registerData.email);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should fail if no data is sumbitted", () => {
		return request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send()
			.expect(({ body }) => {
				expect(body.message.length).toEqual(5);
				expect(body.error).toEqual("Bad Request");
				expect(body.statusCode).toEqual(400);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if email is not sumbitted", () => {
		const data = { ...loginData };
		delete data.email;
		return request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(3);
				expect(body.message[0]).toEqual("email should not be empty");
				expect(body.message[1]).toEqual("email must be an email");
				expect(body.message[2]).toEqual("email must be a string");
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if email is invalid is not sumbitted", () => {
		const data = { ...loginData };
		data.email = "twtwmai";
		return request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual("email must be an email");
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if password is not sumbitted", () => {
		const data = { ...loginData };
		delete data.password;
		return request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(2);
				expect(body.message[0]).toEqual(
					"password must be at least seven characters"
				);
				expect(body.message[1]).toEqual("password should not be empty");
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if password is less than 7 character is not sumbitted", () => {
		const data = { ...loginData };
		data.password = "hi";
		return request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"password must be at least seven characters"
				);
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if password is wrong", () => {
		const data = { ...loginData };
		data.password = "password1";
		return request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.message).toEqual("Invalid Credentials");
				expect(body.statusCode).toEqual(401);
			})
			.expect(HttpStatus.UNAUTHORIZED);
	});

	it("Should login successfully for an activated account with valid credentials", () => {
		return request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(loginData)
			.expect(({ body }) => {
				expect(Object.keys(body.data).length).toEqual(16);
				expect(body.data.email).toEqual(registerData.email);
				expect(body.data.phone).toEqual(registerData.phone);
				expect(body.data.first_name).toEqual(registerData.first_name);
				expect(body.data.last_name).toEqual(registerData.last_name);
				expect(body.data.password).toBeUndefined();
				expect(body.token).toBeDefined();
			})
			.expect(HttpStatus.OK);
	});
});

describe("GET ACTIVATE", () => {
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
			.expect(({ body }) => {})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should fail if activation_code is invalid", async () => {
		return request(app.getHttpServer())
			.get("/auth/activate?activation_code=hi")
			.set("Accept", "application/json")
			.expect(({ body }) => {
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"activation_code must be longer than or equal to 20 characters"
				);
				expect(body.statusCode).toEqual(400);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should activate user with valid activation_code", async () => {
		const user = await test.findUser(registerData.email);
		return request(app.getHttpServer())
			.get(`/auth/activate?activation_code=${user.activation_code}`)
			.set("Accept", "application/json")
			.expect(({ body }) => {
				expect(Object.keys(body.data).length).toEqual(16);
				expect(body.data.is_activated).toBeTruthy();
				expect(body.data.email).toEqual(user.email);
				expect(body.data.phone).toEqual(user.phone);
				expect(body.data.first_name).toEqual(user.first_name);
				expect(body.data.last_name).toEqual(user.last_name);
				expect(body.data.password).toBeUndefined();
				expect(body.data.token).toBeUndefined();
			})
			.expect(HttpStatus.OK);
	});
});

describe("PATCH FORGET PASSWORD", () => {
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
			.expect(({ body }) => {})
			.expect(HttpStatus.CREATED);
		await test.activateUser(registerData.email);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should fail if email is not registered", async () => {
		return request(app.getHttpServer())
			.patch("/auth/forget")
			.set("Accept", "application/json")
			.send({ email: "xhdhhdhd@gmail.com" })
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(403);
				expect(body.message).toEqual("Forbidden Attempt");
			})
			.expect(HttpStatus.FORBIDDEN);
	});

	it("Should fail if email is invalid", async () => {
		return request(app.getHttpServer())
			.patch("/auth/forget")
			.set("Accept", "application/json")
			.send({ email: "xhdhhdhd" })
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(1);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should pass if email is in the system", async () => {
		const data = { ...loginData };
		delete data.password;
		return request(app.getHttpServer())
			.patch("/auth/forget")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {
				expect(body.data.status).toEqual("success");
			})
			.expect(HttpStatus.OK);
	});
});

describe("PATCH RESET PASSWORD", () => {
	const data = { ...loginData };
	delete data.password;
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
			.expect(({ body }) => {})
			.expect(HttpStatus.CREATED);
		await test.activateUser(registerData.email);
		await request(app.getHttpServer())
			.patch("/auth/forget")
			.set("Accept", "application/json")
			.send(data)
			.expect(({ body }) => {})
			.expect(HttpStatus.OK);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should fail if Param is invalid is in the system", async () => {
		return request(app.getHttpServer())
			.get("/auth/reset/rubbish")
			.set("Accept", "application/json")
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message).toEqual(
					"Validation failed (uuid  is expected)"
				);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should pass if Param and Payload is valid", async () => {
		const user = await test.findUser("temibami@gmail.com");
		return request(app.getHttpServer())
			.get(`/auth/reset/${user.reset_password}`)
			.set("Accept", "application/json")
			.expect(({ body }) => {
				expect(Object.keys(body.data).length).toEqual(16);
				expect(body.data.email).toEqual(registerData.email);
				expect(body.data.phone).toEqual(registerData.phone);
				expect(body.data.first_name).toEqual(registerData.first_name);
				expect(body.data.last_name).toEqual(registerData.last_name);
				expect(body.data.password).toBeUndefined();
				expect(body.token).toBeDefined();
			})
			.expect(HttpStatus.OK);
	});
});

describe("PATCH CHANGE PASSWORD", () => {
	const data = { ...loginData };
	delete data.password;
	let token = "";
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
			.expect(({ body }) => {})
			.expect(HttpStatus.CREATED);
		await test.activateUser(registerData.email);
		await request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(loginData)
			.expect(({ body }) => {
				token = body.token;
			})
			.expect(HttpStatus.OK);
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
	});


	it("Should fail if old_password is less than seven characters", () => {
		const data = { ...changePasswordData };
		data.old_password = "pass";
		return request(app.getHttpServer())
			.patch(`/auth/change`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"old_password must be at least seven characters"
				);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if new_password is less than seven characters", () => {
		const data = { ...changePasswordData };
		data.new_password = "pass";
		return request(app.getHttpServer())
			.patch(`/auth/change`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"new_password must be at least seven characters"
				);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if confirm_new_password is less than seven characters", () => {
		const data = { ...changePasswordData };
		data.confirm_new_password = "pass";
		return request(app.getHttpServer())
			.patch(`/auth/change`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"confirm_new_password must be at least seven characters"
				);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if new_password and confirm_new_password do not tally", () => {
		const data = { ...changePasswordData };
		data.new_password = "passwordff";
		return request(app.getHttpServer())
			.patch(`/auth/change`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message).toEqual(
					"new_password field do not match confirm_new_password field"
				);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if old_password is wrong", () => {
		const data = { ...changePasswordData };
		data.old_password = "password111";
		return request(app.getHttpServer())
			.patch("/auth/change")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(422);
				expect(body.message).toEqual("Invalid Old Password");
			})
			.expect(HttpStatus.UNPROCESSABLE_ENTITY);
	});

	it("Should pass if payload is valid", () => {
		const data = { ...changePasswordData };
		return request(app.getHttpServer())
			.patch("/auth/change")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.data.status).toEqual("success");
			})
			.expect(HttpStatus.OK);
	});
});

describe("PATCH (PASSWORD) CHANGE PASSWORD", () => {
	const data = { ...loginData };
	delete data.password;
	let token = "";
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
			.expect(({ body }) => {})
			.expect(HttpStatus.CREATED);
		await test.activateUser(registerData.email);
		await request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(loginData)
			.expect(({ body }) => {
				token = body.token;
			})
			.expect(HttpStatus.OK);
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
	});


	it("Should fail if new_password is less than seven characters", () => {
		const data = { ...resetPasswordData };
		data.new_password = "pass";
		return request(app.getHttpServer())
			.patch(`/auth/password`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"new_password must be at least seven characters"
				);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if confirm_password is less than seven characters", () => {
		const data = { ...resetPasswordData };
		data.confirm_password = "pass";
		return request(app.getHttpServer())
			.patch(`/auth/password`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"confirm_password must be at least seven characters"
				);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if new_password and confirm_new_password do not tally", () => {
		const data = { ...resetPasswordData };
		data.new_password = "passwordff";
		return request(app.getHttpServer())
			.patch(`/auth/password`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message).toEqual(
					"new_password field do not match confirm_password field"
				);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should pass if payload is valid", () => {
		const data = { ...resetPasswordData };
		return request(app.getHttpServer())
			.patch(`/auth/password`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.data.status).toEqual("success");
			})
			.expect(HttpStatus.OK);
	});
});

describe("PATCH UPDATE PROFILE", () => {
	const data = { ...loginData };
	delete data.password;
	let token = "";
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
			.expect(({ body }) => {})
			.expect(HttpStatus.CREATED);
		await test.activateUser(registerData.email);
		await request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(loginData)
			.expect(({ body }) => {
				token = body.token;
			})
			.expect(HttpStatus.OK);
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
	});


	it("Should update nothing if no data is submitted", () => {
		return request(app.getHttpServer())
			.patch("/auth/profile")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send({})
			.expect(({ body }) => {
				expect(Object.keys(body.data).length).toEqual(16);
			})
			.expect(HttpStatus.OK);
	});

	it("Should fail if first_name is less than 3 characters", () => {
		const data = { ...updateProfileData };
		data.first_name = "dd";
		return request(app.getHttpServer())
			.patch("/auth/profile")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"first_name must be longer than or equal to 3 characters"
				);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if last_name is less than 3 characters", () => {
		const data = { ...updateProfileData };
		data.last_name = "dd";
		return request(app.getHttpServer())
			.patch("/auth/profile")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"last_name must be longer than or equal to 3 characters"
				);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should pass if payload is valid", () => {
		const data = { ...updateProfileData };
		return request(app.getHttpServer())
			.patch("/auth/profile")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.data.first_name).toEqual(data.first_name);
				expect(body.data.last_name).toEqual(data.last_name);
			})
			.expect(HttpStatus.OK);
	});
});

describe("POST, Create a Record", () => {
	let token = "";
	let examName: any = {};
	let examType: any = {};
	let examPaperType: any = {};
	let examSubject: any = {};
	let examYear: any = {};
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
			.expect(({ body }) => {})
			.expect(HttpStatus.CREATED);
		await test.activateUser(registerData.email);
		await test.makeAdmin(registerData.email);
		await request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(loginData)
			.expect(({ body }) => {
				token = body.token;
			})
			.expect(HttpStatus.OK);
		examName = await test.createExamName();
		examType = await test.createExamType();
		examPaperType = await test.createExamPaperType();
		examSubject = await test.createExamSubject();
		examYear = await test.createExamYear();
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
	});

	it("Should fail if no data is sumbitted", () => {
		return request(app.getHttpServer())
			.post("/auth/records")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send({})
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(24);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if exam_name_id is not sumbitted", () => {
		const data = { ...createRecordData };
		data.exam_subject_id = examSubject._id;
		data.exam_type_id = examType._id;
		data.exam_paper_type_id = examPaperType._id;
		data.exam_year_id = examYear._id;
		delete data.exam_name_id;
		return request(app.getHttpServer())
			.post("/auth/records")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(4);
				expect(body.message[0]).toEqual(
					"exam_name_id should not be empty"
				);
				expect(body.message[1]).toEqual(
					"exam_name_id must be a mongodb id"
				);
				expect(body.message[2]).toEqual(
					"exam_name_id must be a valid mongo id"
				);
				expect(body.message[3]).toEqual(
					"exam_name_id must be a string"
				);
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if exam_subject_id is is not sumbitted", () => {
		const data = { ...createRecordData };
		data.exam_name_id = examName._id;
		data.exam_type_id = examType._id;
		data.exam_paper_type_id = examPaperType._id;
		data.exam_year_id = examYear._id;
		delete data.exam_subject_id;
		return request(app.getHttpServer())
			.post("/auth/records")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(4);
				expect(body.message[0]).toEqual(
					"exam_subject_id should not be empty"
				);
				expect(body.message[1]).toEqual(
					"exam_subject_id must be a mongodb id"
				);
				expect(body.message[2]).toEqual(
					"exam_subject_id must be a valid mongo id"
				);
				expect(body.message[3]).toEqual(
					"exam_subject_id must be a string"
				);
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if exam_type_id is not sumbitted", () => {
		const data = { ...createRecordData };
		data.exam_name_id = examName._id;
		data.exam_subject_id = examSubject._id;
		data.exam_paper_type_id = examPaperType._id;
		data.exam_year_id = examYear._id;
		delete data.exam_type_id;
		return request(app.getHttpServer())
			.post("/auth/records")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(4);
				expect(body.message[0]).toEqual(
					"exam_type_id should not be empty"
				);
				expect(body.message[1]).toEqual(
					"exam_type_id must be a mongodb id"
				);
				expect(body.message[2]).toEqual(
					"exam_type_id must be a valid mongo id"
				);
				expect(body.message[3]).toEqual(
					"exam_type_id must be a string"
				);
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if exam_paper_type_id is not sumbitted", () => {
		const data = { ...createRecordData };
		data.exam_name_id = examName._id;
		data.exam_subject_id = examSubject._id;
		data.exam_type_id = examType._id;
		data.exam_year_id = examYear._id;
		delete data.exam_paper_type_id;
		return request(app.getHttpServer())
			.post("/auth/records")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(4);
				expect(body.message[0]).toEqual(
					"exam_paper_type_id should not be empty"
				);
				expect(body.message[1]).toEqual(
					"exam_paper_type_id must be a mongodb id"
				);
				expect(body.message[2]).toEqual(
					"exam_paper_type_id must be a valid mongo id"
				);
				expect(body.message[3]).toEqual(
					"exam_paper_type_id must be a string"
				);
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if exam_type_id is not sumbitted", () => {
		const data = { ...createRecordData };
		data.exam_name_id = examName._id;
		data.exam_subject_id = examSubject._id;
		data.exam_paper_type_id = examPaperType._id;
		delete data.exam_type_id;
		return request(app.getHttpServer())
			.post("/auth/records")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(4);
				expect(body.message[0]).toEqual(
					"exam_type_id should not be empty"
				);
				expect(body.message[1]).toEqual(
					"exam_type_id must be a mongodb id"
				);
				expect(body.message[2]).toEqual(
					"exam_type_id must be a valid mongo id"
				);
				expect(body.message[3]).toEqual(
					"exam_type_id must be a string"
				);
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should pass if valid data are passed", async () => {
		const data = { ...createRecordData };
		data.exam_name_id = examName._id;
		data.exam_subject_id = examSubject._id;
		data.exam_type_id = examType._id;
		data.exam_paper_type_id = examPaperType._id;
		data.exam_year_id = examYear._id;
		return request(app.getHttpServer())
			.post("/auth/records")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(Object.keys(body.data).length).toEqual(13);
			})
			.expect(HttpStatus.CREATED);
	});
});

describe("PATCH, UPDATE a Record", () => {
	let token = "";
	let createdRecord: any = {};
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
			.expect(({ body }) => {})
			.expect(HttpStatus.CREATED);
		await test.activateUser(registerData.email);
		await test.makeAdmin(registerData.email);
		await request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(loginData)
			.expect(({ body }) => {
				token = body.token;
			})
			.expect(HttpStatus.OK);
		let examName = await test.createExamName();
		let examType = await test.createExamType();
		let examPaperType = await test.createExamPaperType();
		let examSubject = await test.createExamSubject();
		let examYear = await test.createExamYear();
		const data = { ...createRecordData };
		data.exam_name_id = examName._id;
		data.exam_subject_id = examSubject._id;
		data.exam_type_id = examType._id;
		data.exam_paper_type_id = examPaperType._id;
		data.exam_year_id = examYear._id;
		await request(app.getHttpServer())
			.post("/auth/records")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				createdRecord = body;
			})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
	});

	it("Should fail if score is not passed as data", async () => {
		const data = { ...updateRecordData };
		delete data.score;
		return request(app.getHttpServer())
			.patch(`/auth/records/${createdRecord.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(2);
				expect(body.message[0]).toEqual("score should not be empty");
				expect(body.message[1]).toEqual(
					"score must be a number conforming to the specified constraints"
				);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if is_completed is not passed as data", async () => {
		const data = { ...updateRecordData };
		delete data.is_completed;
		return request(app.getHttpServer())
			.patch(`/auth/records/${createdRecord.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(2);
				expect(body.message[0]).toEqual(
					"is_completed should not be empty"
				);
				expect(body.message[1]).toEqual(
					"is_completed must be either true or false"
				);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if time_completed is not passed as data", async () => {
		const data = { ...updateRecordData };
		delete data.time_completed;
		return request(app.getHttpServer())
			.patch(`/auth/records/${createdRecord.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(2);
				expect(body.message[0]).toEqual(
					"time_completed should not be empty"
				);
				expect(body.message[1]).toEqual(
					"time_completed must be a Date"
				);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should pass if valid data are passed", async () => {
		const data = { ...updateRecordData };
		return request(app.getHttpServer())
			.patch(`/auth/records/${createdRecord.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.data.is_completed).toBeTruthy();
				expect(body.data.time_completed).toBeDefined();
				expect(body.data.score).toEqual(data.score);
			})
			.expect(HttpStatus.OK);
	});
});

describe("LIST, LIST all user's Records", () => {
	let token = "";
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
			.expect(({ body }) => {})
			.expect(HttpStatus.CREATED);
		await test.activateUser(registerData.email);
		await test.makeAdmin(registerData.email);
		await request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(loginData)
			.expect(({ body }) => {
				token = body.token;
			})
			.expect(HttpStatus.OK);
		let examName = await test.createExamName();
		let examType = await test.createExamType();
		let examPaperType = await test.createExamPaperType();
		let examSubject = await test.createExamSubject();
		let examYear = await test.createExamYear();
		const data = { ...createRecordData };
		data.exam_name_id = examName._id;
		data.exam_subject_id = examSubject._id;
		data.exam_type_id = examType._id;
		data.exam_paper_type_id = examPaperType._id;
		data.exam_year_id = examYear._id;
		return request(app.getHttpServer())
			.post("/auth/records")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
	});

	it("Should get list of all exam papers without pagination", () => {
		return request(app.getHttpServer())
			.get("/auth/records")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.total).toEqual(1);
				expect(body.data.limit).toEqual(10);
				expect(body.data.offset).toEqual(0);
				expect(body.data.docs.length).toEqual(1);
			})
			.expect(HttpStatus.OK);
	});

	it("Should get list of all exam papers with pagination", () => {
		return request(app.getHttpServer())
			.get("/auth/records?limit=1&offset=0")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.total).toEqual(1);
				expect(body.data.limit).toEqual(1);
				expect(body.data.offset).toEqual(0);
				expect(body.data.docs.length).toEqual(1);
			})
			.expect(HttpStatus.OK);
	});
});

describe("GET, GET a Record", () => {
	let token = "";
	let createdRecord: any = {};
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
			.expect(({ body }) => {})
			.expect(HttpStatus.CREATED);
		await test.activateUser(registerData.email);
		await test.makeAdmin(registerData.email);
		await request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(loginData)
			.expect(({ body }) => {
				token = body.token;
			})
			.expect(HttpStatus.OK);
		let examName = await test.createExamName();
		let examType = await test.createExamType();
		let examPaperType = await test.createExamPaperType();
		let examSubject = await test.createExamSubject();
		let examYear = await test.createExamYear();
		const data = { ...createRecordData };
		data.exam_name_id = examName._id;
		data.exam_subject_id = examSubject._id;
		data.exam_type_id = examType._id;
		data.exam_paper_type_id = examPaperType._id;
		data.exam_year_id = examYear._id;
		return request(app.getHttpServer())
			.post("/auth/records")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				createdRecord = body;
			})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
	});

	it("Should fail if ID is invalid", async () => {
		return request(app.getHttpServer())
			.get("/auth/records/32423")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual("id must be a mongodb id");
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should get successfully record", async () => {
		return request(app.getHttpServer())
			.get(`/auth/records/${createdRecord.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data._id).toEqual(createdRecord.data._id);
				expect(body.data.created).toBeDefined();
			})
			.expect(HttpStatus.OK);
	});
});
