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
import { CreateExamQuestionDTO } from "src/examQuestion/dto/examQuestion.dto";

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
const examQuestionData: CreateExamQuestionDTO = {
	question: "which food is the best in the world",
	instruction: "which food is the best in the world",
	question_number: 1,
	answer: "B",
	exam_name_id: "5f1df29fd86c3324287ad279",
	exam_subject_id: "5f1e6e51cc5bac415c068364",
	exam_type_id: "5f1e70b142eda029184c249e",
	exam_year_id: "5f1e7265de47fb28f44a2605",
	exam_paper_type_id: "5f1e7265de47fb28f44a2605",
	description: "5f1e7265de47fb28f44a2605",
	optionA: "TestingA",
	optionB: "TestingB",
	optionC: "TestingC",
	optionD: "TestingD",
	optionE: "TestingE"
};
const loginData: LoginDTO = {
	email: "temibami@gmail.com",
	password: "password"
};

describe("POST, Create an Exam Question", () => {
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

	it("Should fail if no data is submitted", () => {
		return request(app.getHttpServer())
			.post("/admin/questions")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send({})
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(36);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if question is not submitted", () => {
		const data = { ...examQuestionData };
		data.exam_name_id = examName._id;
		data.exam_subject_id = examSubject._id;
		data.exam_type_id = examType._id;
		data.exam_paper_type_id = examPaperType._id;
		data.exam_year_id = examYear._id;
		delete data.question;
		return request(app.getHttpServer())
			.post("/admin/questions")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(3);
				expect(body.message[0]).toEqual(
					"question must be at least seven characters"
				);
				expect(body.message[1]).toEqual("question should not be empty");
				expect(body.message[2]).toEqual("question must be a string");
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if question is less than 3 characters", () => {
		const data = { ...examQuestionData };
		data.exam_name_id = examName._id;
		data.exam_subject_id = examSubject._id;
		data.exam_type_id = examType._id;
		data.exam_paper_type_id = examPaperType._id;
		data.exam_year_id = examYear._id;
		data.question = "hi";
		return request(app.getHttpServer())
			.post("/admin/questions")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"question must be at least seven characters"
				);
				expect(body.statusCode).toEqual(400);
				expect(body.error).toEqual("Bad Request");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should fail if description is less than 3 characters", () => {
		const data = { ...examQuestionData };
		data.exam_name_id = examName._id;
		data.exam_subject_id = examSubject._id;
		data.exam_type_id = examType._id;
		data.exam_paper_type_id = examPaperType._id;
		data.exam_year_id = examYear._id;
		data.description = "hi";
		return request(app.getHttpServer())
			.post("/admin/questions")
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
		const data = { ...examQuestionData };
		data.exam_name_id = examName._id;
		data.exam_subject_id = examSubject._id;
		data.exam_type_id = examType._id;
		data.exam_paper_type_id = examPaperType._id;
		data.exam_year_id = examYear._id;
		return request(app.getHttpServer())
			.post("/admin/questions")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(Object.keys(body.data).length).toEqual(18);
			})
			.expect(HttpStatus.CREATED);
	});
});

describe("GET, LIST Exam questions", () => {
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
		await test.createExamQuestion();
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
	});

	it("Should list all exam questions without pagination", () => {
		return request(app.getHttpServer())
			.get("/admin/questions")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.total).toEqual(1);
				expect(body.data.docs.length).toEqual(1);
			})
			.expect(HttpStatus.OK);
	});

	it("Should list all exam questions with pagination", () => {
		return request(app.getHttpServer())
			.get("/admin/questions?limit=1&offset=0")
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

describe("GET, An Exam question", () => {
	let token = "";
	let createExamQuestion: any = {};
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
		createExamQuestion = await test.createExamQuestion();
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
	});

	it("Should fail if ID is invalid", async () => {
		return request(app.getHttpServer())
			.get("/admin/questions/32423")
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

	it("Should get exam question successfully", async () => {
		return request(app.getHttpServer())
			.get(`/admin/questions/${createExamQuestion._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.name).toEqual(createExamQuestion.name);
				expect(body.data.created).toBeDefined();
			})
			.expect(HttpStatus.OK);
	});
});

describe("PATCH, Update an Exam Question", () => {
	let token = "";
	let createExamQuestion: any = {};
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
		createExamQuestion = await test.createExamQuestion();
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
	});

	it("Should change nothing if no data is submitted", () => {
		return request(app.getHttpServer())
			.patch(`/admin/questions/${createExamQuestion._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send({})
			.expect(({ body }) => {
				expect(Object.keys(body.data).length).toEqual(17);
			})
			.expect(HttpStatus.OK);
	});

	it("Should fail if question is less than 3 characters", () => {
		const data: any = {};
		data.question = "dd";
		return request(app.getHttpServer())
			.patch(`/admin/questions/${createExamQuestion._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message.length).toEqual(1);
				expect(body.message[0]).toEqual(
					"question must be at least seven characters"
				);
			})
			.expect(HttpStatus.BAD_REQUEST);
	});


	it("Should pass if payload is valid", () => {
		const data: any = {};
		data.question = "a senior sec exam";
		data.question_number = 3;
		return request(app.getHttpServer())
			.patch(`/admin/questions/${createExamQuestion._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.send(data)
			.expect(({ body }) => {
				expect(body.data.question).toEqual(data.question);
				expect(body.data.question_number).toEqual(data.question_number);
				expect(body.data.created).toBeDefined();
			})
			.expect(HttpStatus.OK);
	});
});

describe("GET, Deactivate an Exam question", () => {
	let token = "";
	let createExamQuestion: any = {};
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
		createExamQuestion = await test.createExamQuestion();
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
	});
	it("Should fail if ID is invalid", async () => {
		return request(app.getHttpServer())
			.get("/admin/questions/hvkuv/deactivate")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message[0]).toEqual("id must be a mongodb id");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should successfully deactivate an exam question", async () => {
		return request(app.getHttpServer())
			.get(`/admin/questions/${createExamQuestion._id}/deactivate`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.status).toEqual("success");
			})
			.expect(HttpStatus.OK);
	});
});

describe("GET, Activate an Exam question", () => {
	let token = "";
	let createExamQuestion: any = {};
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
		createExamQuestion = await test.createExamQuestion();
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
	});

	it("Should fail if ID is invalid", async () => {
		return request(app.getHttpServer())
			.get("/admin/questions/hvkuv/activate")
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.statusCode).toEqual(400);
				expect(body.message[0]).toEqual("id must be a mongodb id");
			})
			.expect(HttpStatus.BAD_REQUEST);
	});

	it("Should successfully deactivate an exam question if ID is valid", async () => {
		return request(app.getHttpServer())
			.get(`/admin/questions/${createExamQuestion._id}/activate`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data.status).toEqual("success");
			})
			.expect(HttpStatus.OK);
	});
});
