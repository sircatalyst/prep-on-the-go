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
import { CreateExamTypeDTO } from "src/examType/dto/examType.dto";

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
const examTypeData: CreateExamTypeDTO = {
	name: "NECO",
	description: "This is an examination for SSCE students"
};
const loginData: LoginDTO = {
	email: "temibami@gmail.com",
	password: "password"
};

describe("POST, Create an ExamType", () => {
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
		await mongoose.connection.dropCollection("examtypes", (err: any) => {
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
			.post("/types")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send()
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(6);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if name is not submitted", () => {
		const data = { ...examTypeData };
		delete data.name;
		return request(app.getHttpServer())
			.post("/types")
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
		const data = { ...examTypeData };
		data.name = "hi";
		return request(app.getHttpServer())
			.post("/types")
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
		const data = { ...examTypeData };
		delete data.description;
		return request(app.getHttpServer())
			.post("/types")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(3);
				expect(body.message[0]).toEqual(
					"description must be at least seven characters"
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
		const data = { ...examTypeData };
		data.description = "hi";
		return request(app.getHttpServer())
			.post("/types")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"description must be at least seven characters"
				);
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should pass if valid data are passed", async () => {
		const data = { ...examTypeData };
		return request(app.getHttpServer())
			.post("/types")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(Object.keys(body.data).length).toEqual(6);
			})
			.expect(HttpStatus.CREATED);
	});
});

describe("GET, LIST ExamType", () => {
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
		const data = { ...examTypeData };
		await request(app.getHttpServer())
			.post("/types")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("examtypes", (err: any) => {
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

	it("Should list all exam types without pagination", () => {
		return request(app.getHttpServer())
			.get("/types")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.total).toEqual(1);
				expect(body.data.docs.length).toEqual(1);
			})
			.expect(HttpStatus.OK);
	});

	it("Should list all exam types with pagination", () => {
		return request(app.getHttpServer())
			.get("/types?limit=1&offset=0")
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

describe("GET, An ExamType", () => {
	let token = "";
	const data = { ...examTypeData };
	let createdExamType: any = {};
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
			.post("/types")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				createdExamType = body;
			})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("examtypes", (err: any) => {
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
			.get("/types/32423")
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

	it("Should successfully get exam type if ID is valid", async () => {
		return request(app.getHttpServer())
			.get(`/types/${createdExamType.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.name).toEqual(createdExamType.data.name);
				expect(body.data._id).toEqual(createdExamType.data._id);
				expect(body.data.created).toBeDefined();
			})
			.expect(HttpStatus.OK);
	});
});

describe("PATCH Update an ExamType", () => {
	let token = "";
	const data = { ...examTypeData };
	let createdExamType: any = {};
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
			.post("/types")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				createdExamType = body;
			})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
		await mongoose.connection.dropCollection("examtypes", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should change nothing if no data is submitted", () => {
		return request(app.getHttpServer())
			.patch(`/types/${createdExamType.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send({})
			.expect(({ body }) => {
				expect(Object.keys(body.data).length).toEqual(6);
			})
			.expect(HttpStatus.OK);
	});

	it("Should fail if name is less than 3 characters", () => {
		const data: any = {};
		data.name = "dd";
		return request(app.getHttpServer())
			.patch(`/types/${createdExamType.data._id}`)
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
			.patch(`/types/${createdExamType.data._id}`)
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

	it("Should update exam type if payload is valid", () => {
		const data: any = {};
		data.name = "GCE";
		data.description = "a senior sec exam";
		return request(app.getHttpServer())
			.patch(`/types/${createdExamType.data._id}`)
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

describe("GET, Deactivate an ExamType", () => {
	let token = "";
	const data = { ...examTypeData };
	let createdExamType: any = {};
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
			.post("/types")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				createdExamType = body;
			})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
		await mongoose.connection.dropCollection("examtypes", (err: any) => {
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
			.get("/types/hvkuv/deactivate")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message[0]).toEqual("id must be a mongodb id");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should successfully deactivate an exam type", async () => {
		return request(app.getHttpServer())
			.get(`/types/${createdExamType.data._id}/deactivate`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.status).toEqual("success");
			})
			.expect(HttpStatus.OK);
	});
});

describe("GET, Activate an ExamType", () => {
	let token = "";
	const data = { ...examTypeData };
	let createdExamType: any = {};
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
			.post("/types")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				createdExamType = body;
			})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
		await mongoose.connection.dropCollection("examtypes", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should fail if ID is invalid", async () => {
		return request(app.getHttpServer())
			.get("/types/hvkuv/activate")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message[0]).toEqual("id must be a mongodb id");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should successfully deactivate an exam type", async () => {
		return request(app.getHttpServer())
			.get(`/types/${createdExamType.data._id}/activate`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.status).toEqual("success");
			})
			.expect(HttpStatus.OK);
	});
});
