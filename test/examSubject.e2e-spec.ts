import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus } from "@nestjs/common";
import * as request from "supertest";
import * as mongoose from "mongoose";

import { AppModule } from "../src/app.module";
import { CreateUserDTO } from "../src/user/dto/user.dto";
import { appConfig } from "../src/config";
import { test } from "./fixture/index";

import "dotenv/config";
import { LoginDTO } from "../src/auth/dto/auth.dto";
import { CreateExamSubjectDTO } from "src/examSubject/dto/examSubject.dto";

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
const examSubjectData: CreateExamSubjectDTO = {
	name: "NECO",
	time: 40,
	description: "This is an examination for SSCE students",
};
const loginData: LoginDTO = {
	email: "temibami@gmail.com",
	password: "password"
};

describe("POST, Create an ExamSubject", () => {
	const data = { ...loginData };
	delete data.password;
	let token = "";
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
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
		await mongoose.connection.dropCollection("examsubjects", (err: any) => {
			if (err) {
				return err;
			}
		});
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should fail if no data is submitted", () => {
		return request(app.getHttpServer())
			.post("/subjects")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send()
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(9);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if exam subject name is not submitted", () => {
		const data = { ...examSubjectData };
		delete data.name;
		return request(app.getHttpServer())
			.post("/subjects")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(3);
				expect(body.message[0]).toEqual(
					"name must be at least three characters"
				);
				expect(body.message[1]).toEqual("name should not be empty");
				expect(body.message[2]).toEqual("name must be a string");
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if name is less than 3 characters", () => {
		const data = { ...examSubjectData };
		data.name = "hi";
		return request(app.getHttpServer())
			.post("/subjects")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"name must be at least three characters"
				);
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if description is not submitted", () => {
		const data = { ...examSubjectData };
		delete data.description;
		return request(app.getHttpServer())
			.post("/subjects")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(3);
				expect(body.message[0]).toEqual(
					"description must be at least three characters"
				);
				expect(body.message[1]).toEqual("description should not be empty");
				expect(body.message[2]).toEqual(
					"description must be a string"
				);
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if description is less than 3 characters", () => {
		const data = { ...examSubjectData };
		data.description = "hi";
		return request(app.getHttpServer())
			.post("/subjects")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"description must be at least three characters"
				);
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should pass if valid data are passed", async () => {
		const data = { ...examSubjectData };
		return request(app.getHttpServer())
			.post("/subjects")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(Object.keys(body.data).length).toEqual(7);
			})
			.expect(HttpStatus.CREATED);
	});
});

describe("GET, LIST ExamSubject", () => {
	const data = { ...loginData };
	delete data.password;
	let token = "";
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
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
		const data = { ...examSubjectData };
		await request(app.getHttpServer())
			.post("/subjects")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("examsubjects", (err: any) => {
			if (err) {
				return err;
			}
		});
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should list of all exam subjects without pagination", () => {
		return request(app.getHttpServer())
			.get("/subjects")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.total).toEqual(1);
				expect(body.data.docs.length).toEqual(1);
			})
			.expect(HttpStatus.OK);
	});

	it("Should get list of all exam subjects with pagination", () => {
		return request(app.getHttpServer())
			.get("/subjects?limit=1&offset=0")
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

describe("GET, An ExamSubject", () => {
	let token = "";
	const data = { ...examSubjectData };
	let createdExamSubject: any = {};
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
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
		await request(app.getHttpServer())
			.post("/subjects")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				createdExamSubject = body;
			})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("examsubjects", (err: any) => {
			if (err) {
				return err;
			}
		});
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should fail if ID is invalid", async () => {
		return request(app.getHttpServer())
			.get("/subjects/32423")
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

	it("Should successfully get exam subject if id is valid", async () => {
		return request(app.getHttpServer())
			.get(`/subjects/${createdExamSubject.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.name).toEqual(createdExamSubject.data.name);
				expect(body.data._id).toEqual(createdExamSubject.data._id);
				expect(body.data.created).toBeDefined();
			})
			.expect(HttpStatus.OK);
	});
});

describe("PATCH, Update an ExamSubject", () => {
	let token = "";
	const data = { ...examSubjectData };
	let createdExamSubject: any = {};
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
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
		await request(app.getHttpServer())
			.post("/subjects")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				createdExamSubject = body;
			})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
		await mongoose.connection.dropCollection("examsubjects", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should change nothing if no data is submitted", () => {
		return request(app.getHttpServer())
			.patch(`/subjects/${createdExamSubject.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send({})
			.expect(({ body }) => {
				expect(Object.keys(body.data).length).toEqual(7);
			})
			.expect(HttpStatus.OK);
	});

	it("Should fail if name is less than 3 characters", () => {
		const data: any = {};
		data.name = "dd";
		return request(app.getHttpServer())
			.patch(`/subjects/${createdExamSubject.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"name must be at least three characters"
				);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if description is less than 3 characters", () => {
		const data: any = {};
		data.description = "dd";
		return request(app.getHttpServer())
			.patch(`/subjects/${createdExamSubject.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"description must be at least seven characters"
				);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should pass if payload is valid", () => {
		const data: any = {};
		data.name = "GCE";
		data.description = "a senior sec exam";
		return request(app.getHttpServer())
			.patch(`/subjects/${createdExamSubject.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.data.name).toEqual(data.name);
				expect(body.data.created).toBeDefined();
			})
			.expect(HttpStatus.OK);
	});
});

describe("GET, Deactivate an ExamSubject", () => {
	let token = "";
	const data = { ...examSubjectData };
	let createdExamSubject: any = {};
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
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
		await request(app.getHttpServer())
			.post("/subjects")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				createdExamSubject = body;
			})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
		await mongoose.connection.dropCollection("examsubjects", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should fail if ID is invalid", async () => {
		const data = { ...loginData };
		await test.findUser(data.email);
		delete data.email;
		return request(app.getHttpServer())
			.get("/subjects/hvkuv/deactivate")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message[0]).toEqual("id must be a mongodb id");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should successfully deactivate an exam subject if id is valid", async () => {
		return request(app.getHttpServer())
			.get(`/subjects/${createdExamSubject.data._id}/deactivate`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.status).toEqual("success");
			})
			.expect(HttpStatus.OK);
	});
});

describe("GET, Activate an ExamSubject", () => {
	let token = "";
	const data = { ...examSubjectData };
	let createdExamSubject: any = {};
	beforeAll(async () => {
		await request(app.getHttpServer())
			.post("/auth/register")
			.set("Accept", "application/json")
			.send(registerData)
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
		await request(app.getHttpServer())
			.post("/subjects")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				createdExamSubject = body;
			})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
		await mongoose.connection.dropCollection("examsubjects", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should fail if ID is invalid", async () => {
		return request(app.getHttpServer())
			.get("/subjects/hvkuv/activate")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message[0]).toEqual("id must be a mongodb id");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should successfully deactivate an exam subject if id is valid", async () => {
		return request(app.getHttpServer())
			.get(`/subjects/${createdExamSubject.data._id}/activate`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.status).toEqual("success");
			})
			.expect(HttpStatus.OK);
	});
});
