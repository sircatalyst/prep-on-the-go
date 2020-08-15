import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus } from "@nestjs/common";
import * as request from "supertest";
import * as mongoose from "mongoose";

import { AppModule } from "../src/app.module";
import { CreateUserDTO, UpdateUserProfileDTO } from "../src/user/dto/user.dto";
import { appConfig } from "../src/config";
import { test } from "./fixture/index";

import "dotenv/config";
import { LoginDTO } from "../src/auth/dto/auth.dto";

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
const loginData: LoginDTO = {
	email: "temibami@gmail.com",
	password: "password"
};
const updateProfileData: UpdateUserProfileDTO = {
	first_name: "Abraham",
	last_name: "Lincoln"
};

describe("POST, Create a User", () => {
	const data = { ...loginData };
	delete data.password;
	let token = "";

	const createdUserData = { ...registerData };
	createdUserData.email = "hi@gmail.com";
	createdUserData.phone = "08134849552";

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
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
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
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
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
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
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
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
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
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
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
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
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
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
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
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
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
			.set("authorization", `Bearer ${token}`)
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
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
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
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
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
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
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
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
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
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
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

	it("Should Create User successfully if all data are valid", () => {
		return request(app.getHttpServer())
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(createdUserData)
			.expect(({ body }) => {
				expect(Object.keys(body.data).length).toEqual(16);
				expect(body.data.email).toEqual(createdUserData.email);
				expect(body.data.phone).toEqual(createdUserData.phone);
				expect(body.data.first_name).toEqual(
					createdUserData.first_name
				);
				expect(body.data.last_name).toEqual(createdUserData.last_name);
			})
			.expect(HttpStatus.CREATED);
	});

	it("Should fail if user (with same email or phone) has not verified account", () => {
		return request(app.getHttpServer())
			.post("/users")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(createdUserData)
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
					.set("authorization", `Bearer ${token}`)
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
		const data = { ...registerData };
		return request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message).toEqual("User already exists");
				expect(body.statusCode).toEqual(400);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});
});

describe("LIST Users", () => {
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
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should get list of all users without pagination", () => {
		const data = { ...loginData };
		delete data.email;
		return request(app.getHttpServer())
			.get("/users")
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

	it("Should get list of all users with pagination", () => {
		const data = { ...loginData };
		delete data.email;
		return request(app.getHttpServer())
			.get("/users?limit=1&offset=0")
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

describe("GET User", () => {
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
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should fail if ID is invalid", async () => {
		const data = { ...loginData };
		const user = await test.findUser(data.email);
		delete data.email;
		return request(app.getHttpServer())
			.get("/users/32423")
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

	it("Should get successfully a user", async () => {
		const data = { ...loginData };
		const user = await test.findUser(data.email);
		delete data.email;
		return request(app.getHttpServer())
			.get(`/users/${user._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.first_name).toEqual(user.first_name);
				expect(body.data.last_name).toEqual(user.last_name);
				expect(body.data.phone).toEqual(user.phone);
				expect(body.data.email).toEqual(user.email);
			})
			.expect(HttpStatus.OK);
	});
});

describe("PATCH Update a User Profile", () => {
	const data = { ...loginData };
	const user: any = {};
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
		await test.makeAdmin(registerData.email);
		await request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(loginData)
			.expect(({ body }) => {
				token = body.token;
			})
			.expect(HttpStatus.OK);
		user.data = await test.findUser(data.email);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should change nothing if no data is submitted", () => {
		return request(app.getHttpServer())
			.patch(`/users/${user.data._id}`)
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
			.patch(`/users/${user.data._id}`)
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
			.patch(`/users/${user.data._id}`)
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
			.patch(`/users/${user.data._id}`)
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

describe("DELETE User", () => {
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
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should fail if ID is invalid", async () => {
		const data = { ...loginData };
		const user = await test.findUser(data.email);
		delete data.email;
		return request(app.getHttpServer())
			.delete("/users/32423")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message[0]).toEqual("id must be a mongodb id");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should get successfully a user", async () => {
		const data = { ...loginData };
		const user = await test.findUser(data.email);
		delete data.email;
		return request(app.getHttpServer())
			.delete(`/users/${user._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.status).toEqual("success");
			})
			.expect(HttpStatus.OK);
	});
});
