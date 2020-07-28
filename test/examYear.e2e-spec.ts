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
import { CreateExamYearDTO } from "src/examYear/dto/examYear.dto";

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
const examYearData: CreateExamYearDTO = {
	name: "NECO",
	description: "This is an examination for SSCE students"
};
const loginData: LoginDTO = {
	email: "temibami@gmail.com",
	password: "password"
};

describe("POST, Create an ExamPaperYear year", () => {
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
		await mongoose.connection.dropCollection("examyears", (err: any) => {
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

	it("Should fail if no data is sumbitted", () => {
		return request(app.getHttpServer())
			.post("/years")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send()
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(5);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if year is not sumbitted", () => {
		const data = { ...examYearData };
		delete data.name;
		return request(app.getHttpServer())
			.post("/years")
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
		const data = { ...examYearData };
		data.name = "hi";
		return request(app.getHttpServer())
			.post("/years")
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

	it("Should fail if description is not sumbitted", () => {
		const data = { ...examYearData };
		delete data.description;
		return request(app.getHttpServer())
			.post("/years")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(2);
				expect(body.message[0]).toEqual(
					"description must be at least three characters"
				);
				expect(body.message[1]).toEqual("description should not be empty");
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if description is less than 3 characters", () => {
		const data = { ...examYearData };
		data.description = "hi";
		return request(app.getHttpServer())
			.post("/years")
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
		const data = { ...examYearData };
		return request(app.getHttpServer())
			.post("/years")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(Object.keys(body.data).length).toEqual(6);
			})
			.expect(HttpStatus.CREATED);
	});
});

describe("LIST Exam Years", () => {
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
		await test.makeAdmin(registerData.email);
		await request(app.getHttpServer())
			.post("/auth/login")
			.set("Accept", "application/json")
			.send(loginData)
			.expect(({ body }) => {
				token = body.token;
			})
			.expect(HttpStatus.OK);
		const data = { ...examYearData };
		await request(app.getHttpServer())
			.post("/years")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("examyears", (err: any) => {
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

	it("Should get list of all exam years without pagination", () => {
		return request(app.getHttpServer())
			.get("/years")
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

	it("Should get list of all exam yeats with pagination", () => {
		return request(app.getHttpServer())
			.get("/years?limit=1&offset=0")
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

describe("GET An ExamPaperYear name", () => {
	let token = "";
	const data = { ...examYearData };
	let createdExamYear: any = {};
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
		await request(app.getHttpServer())
			.post("/years")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				createdExamYear = body;
			})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("examyears", (err: any) => {
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
			.get("/years/32423")
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

	it("Should get successfully exam year", async () => {
		return request(app.getHttpServer())
			.get(`/years/${createdExamYear.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.name).toEqual(createdExamYear.data.name);
				expect(body.data._id).toEqual(createdExamYear.data._id);
				expect(body.data.created).toBeDefined();
			})
			.expect(HttpStatus.OK);
	});
});

describe("PATCH Update an ExamPaperYear Name User Profile", () => {
	let token = "";
	const data = { ...examYearData };
	let createdExamYear: any = {};
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
		await request(app.getHttpServer())
			.post("/years")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				createdExamYear = body;
			})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
		await mongoose.connection.dropCollection("examyears", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should change nothing if no data is submitted", () => {
		return request(app.getHttpServer())
			.patch(`/years/${createdExamYear.data._id}`)
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
			.patch(`/years/${createdExamYear.data._id}`)
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
			.patch(`/years/${createdExamYear.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"description must be at least three characters"
				);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should pass if payload is valid", () => {
		const data: any = {};
		data.name = "GCE";
		data.description = "a senior sec exam";
		return request(app.getHttpServer())
			.patch(`/years/${createdExamYear.data._id}`)
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

describe("Deactivate an ExamPaperYear name", () => {
	let token = "";
	const data = { ...examYearData };
	let createdExamYear: any = {};
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
		await request(app.getHttpServer())
			.post("/years")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				createdExamYear = body;
			})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
		await mongoose.connection.dropCollection("examyears", (err: any) => {
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
			.get("/years/hvkuv/deactivate")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message[0]).toEqual("id must be a mongodb id");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should get successfully deactivate an exam name", async () => {
		return request(app.getHttpServer())
			.get(`/years/${createdExamYear.data._id}/deactivate`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.status).toEqual("success");
			})
			.expect(HttpStatus.OK);
	});
});

describe("Activate an Exam year", () => {
	let token = "";
	const data = { ...examYearData };
	let createdExamYear: any = {};
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
		await request(app.getHttpServer())
			.post("/years")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				createdExamYear = body;
			})
			.expect(HttpStatus.CREATED);
	});

	afterAll(async () => {
		await mongoose.connection.dropCollection("users", (err: any) => {
			if (err) {
				return err;
			}
		});
		await mongoose.connection.dropCollection("examyears", (err: any) => {
			if (err) {
				return err;
			}
		});
	});

	it("Should fail if ID is invalid", async () => {
		return request(app.getHttpServer())
			.get("/years/hvkuv/activate")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message[0]).toEqual("id must be a mongodb id");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should get successfully deactivate an exam year", async () => {
		return request(app.getHttpServer())
			.get(`/years/${createdExamYear.data._id}/activate`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.status).toEqual("success");
			})
			.expect(HttpStatus.OK);
	});
});
