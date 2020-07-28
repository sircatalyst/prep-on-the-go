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
	exam_name_id: "5f1df29fd86c3324287ad279",
	exam_subject_id: "5f1e6e51cc5bac415c068364",
	exam_type_id: "5f1e70b142eda029184c249e",
	exam_paper_type_id: "5f1e70b142eda029184c249e",
	exam_year_id: "5f1e7265de47fb28f44a2605"
};

const loginData: LoginDTO = {
	email: "temibami@gmail.com",
	password: "password"
};
describe("LIST, LIST all Records", () => {
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

	it("Should get list of all records without pagination", () => {
		return request(app.getHttpServer())
			.get("/records")
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

	it("Should get list of all records with pagination", () => {
		return request(app.getHttpServer())
			.get("/records?limit=1&offset=0")
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
			.get("/records/32423")
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
			.get(`/records/${createdRecord.data._id}`)
			.set("Accept", "application/json")
			.set("authorization", `Bearer ${token}`)
			.expect(({ body }) => {
				expect(body.data._id).toEqual(createdRecord.data._id);
				expect(body.data.created).toBeDefined();
			})
			.expect(HttpStatus.OK);
	});
});
