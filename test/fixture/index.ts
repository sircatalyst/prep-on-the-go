import * as moment from "moment";
import * as mongoose from "mongoose";
import { UserSchema } from "../../src/user/schema/user.schema";
import { ExamNameSchema } from "../../src/examName/schema/examName.schema";
import { ExamYearSchema } from "../../src/examYear/schema/examYear.schema";
import { ExamSubjectSchema } from "../../src/examSubject/schema/examSubject.schema";
import { ExamPaperTypeSchema } from "../../src/examPaperType/schema/examPaperType.schema";
import { ExamQuestionSchema } from "../../src/examQuestion/schema/examQuestion.schema";

export const test: any = {};

// MODELS
const User = mongoose.model("User", UserSchema);
const ExamName = mongoose.model("ExamName", ExamNameSchema);
const ExamYear = mongoose.model("ExamYear", ExamYearSchema);
const ExamSubject = mongoose.model("ExamSubject", ExamSubjectSchema);
const ExamType = mongoose.model("ExamType", ExamYearSchema);
const ExamPaperType = mongoose.model("ExamPaperType", ExamPaperTypeSchema);
const ExamQuestion = mongoose.model("ExamQuestion", ExamQuestionSchema);

//DATA
test.userData = {
	first_name: "Temitope",
	last_name: "Bamidele",
	email: "temibami@gmail.com",
	phone: "08134849551",
	password: "$2b$10$XK2FXepdX1xe/iLHwMF91OIjMcS5sWhlwZsC5kfTW.ZP3SQv.N2ye",
	activation_code: "06eb89d3-594a-4880-9e4b-08ead078030b",
	created_at: moment().format("YYYY-M-DD HH:mm:ss"),
	reset_password: "1369ee5d-b4d6-49e6-affb-5f2db54cb738",
	is_used_password: 0,
	is_deleted: false,
	role: "user",
	password_expire: Date.now() + 42300,
	is_activated: 1
};

test.examNameData = {
	is_activated: 1,
	name: "WASSSCE",
	description: "English"
};
test.examSubjectData = {
	is_activated: 1,
	name: "English",
	description: "English",
	time: "50"
};
test.examYearData = {
	is_activated: 1,
	name: "WASSSCE",
	description: "WAEC SSCE"
};
test.examTypeData = {
	is_activated: 1,
	name: "WASSSCE",
	description: "WAEC SSCE"
};
test.examPaperTypeData = {
	is_activated: 1,
	name: "WASSSCE",
	description: "WAEC SSCE"
};
test.examQuestionData = {
	question: "which food is the best in the world",
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

test.createUser = () => {
	return User.create(test.userData)
		.then(returnedUser => {
			return returnedUser;
		})
		.catch(error => {
			return error;
		});
};

test.createExamName = () => {
	return ExamName.create(test.examNameData)
		.then(returnedExamName => {
			return returnedExamName;
		})
		.catch(error => {
			return error;
		});
};
test.createExamSubject = () => {
	return ExamSubject.create(test.examSubjectData)
		.then(returnedExamSubject => {
			return returnedExamSubject;
		})
		.catch(error => {
			return error;
		});
};
test.createExamType = () => {
	return ExamType.create(test.examTypeData)
		.then(returnedExamType => {
			return returnedExamType;
		})
		.catch(error => {
			return error;
		});
};
test.createExamPaperType = () => {
	return ExamPaperType.create(test.examPaperTypeData)
		.then(returnedExamPaperType => {
			return returnedExamPaperType;
		})
		.catch(error => {
			return error;
		});
};
test.createExamYear = () => {
	return ExamYear.create(test.examYearData)
		.then(returnedExamYear => {
			return returnedExamYear;
		})
		.catch(error => {
			return error;
		});
};

test.createExamQuestion = async () => {
	const examName = await test.createExamName();
	const examType = await test.createExamType();
	const examPaperType = await test.createExamPaperType();
	const examSubject = await test.createExamSubject();
	const examYear = await test.createExamYear();
	const data: any = { ...test.examQuestionData };
	data.exam_name_id = examName._id;
	data.exam_subject_id = examSubject._id;
	data.exam_type_id = examType._id;
	data.exam_paper_type_id = examPaperType._id;
	data.exam_year_id = examYear._id;
	return ExamQuestion.create(data)
		.then(returnedExamQuestion => {
			return returnedExamQuestion;
		})
		.catch(error => {
			return error;
		});
};

test.activateUser = email => {
	return User.updateOne({ email }, { is_activated: true })
		.then(returnedUser => {
			return returnedUser;
		})
		.catch(error => {
			return error;
		});
};

test.makeAdmin = email => {
	return User.updateOne({ email }, { role: "admin" })
		.then(returnedUser => {
			return returnedUser;
		})
		.catch(error => {
			return error;
		});
};

test.findUser = (email) => {
	return User.findOne({ email })
		.then(returnedUser => {
			return returnedUser;
		})
		.catch(error => {
			return error;
		});
};
