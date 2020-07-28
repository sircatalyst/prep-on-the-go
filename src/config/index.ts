import "dotenv/config";

export const appConfig: any = {};

/**
 * @desc variables to user for production
 */
if (process.env.NODE_ENV === "production") {
	(appConfig.version = process.env.APP_VERSION || "v1"),
	(appConfig.name = process.env.PROJECT_NAME || "nest_base_api"),
	(appConfig.port = parseInt(process.env.PORT_PRODUCTION, 10) || 3000),
	(appConfig.db =
			process.env.MONGO_URI_PRODUCTION ||
			`mongodb://localhost/${process.env.PROJECT_NAME}`),
	(appConfig.environment = process.env.NODE_ENV || "production");
	appConfig.redisHost = process.env.REDIS_HOST || "localhost";
	appConfig.redisPort = parseInt(process.env.REDIS_PORT, 10) || 6379;
	appConfig.redisMaxItem = parseInt(process.env.REDIS_MAX_ITEM, 10) || 1000; // maximum number of items in cache
	appConfig.redisTime = parseInt(process.env.REDIS_TIME, 10) || 0; // seconds
	appConfig.fileImageMaxSize =
		parseInt(process.env.FILE_IMAGE_MAX_SIZE, 10) || 500000; //500kb
	appConfig.secretKey = process.env.SECRET_KEY || "SECRET_KEY";
	appConfig.paginationOffset =
		parseInt(process.env.PAGINATION_OFFSET, 10) || 0;
	appConfig.paginationLimit =
		parseInt(process.env.PAGINATION_LIMIT, 10) || 10;
}

/**
 * @desc variables to user for development environment
 */
if (process.env.NODE_ENV === "development") {
	(appConfig.name = process.env.PROJECT_NAME || "nest_base_api"),
	(appConfig.port = parseInt(process.env.PORT, 10) || 3001),
	(appConfig.db =
			process.env.MONGO_URI ||
			`mongodb://localhost/${process.env.PROJECT_NAME}`),
	(appConfig.environment = process.env.NODE_ENV || "development");
	appConfig.redisHost = process.env.REDIS_HOST || "localhost";
	appConfig.redisPort = parseInt(process.env.REDIS_PORT, 10) || 6379;
	appConfig.redisMaxItem = parseInt(process.env.REDIS_MAX_ITEM, 10) || 1000; // maximum number of items in cache
	appConfig.redisTime = parseInt(process.env.REDIS_TIME, 10) || 864000; // seconds (10days)
	appConfig.fileImageMaxSize =
		parseInt(process.env.FILE_IMAGE_MAX_SIZE, 10) || 500000; //500kb
	appConfig.secretKey = process.env.SECRET_KEY || "SECRET_KEY";
	appConfig.paginationOffset =
		parseInt(process.env.PAGINATION_OFFSET, 10) || 0;
	appConfig.paginationLimit =
		parseInt(process.env.PAGINATION_LIMIT, 10) || 10;
}

/**
 * @desc variables to user for test environment
 */
if (process.env.NODE_ENV === "test") {
	(appConfig.name = process.env.PROJECT_NAME || "nest_base_api"),
	(appConfig.port = parseInt(process.env.PORT_TEST, 10) || 9000),
	(appConfig.environment = process.env.NODE_ENV || "test"),
	(appConfig.db =
			process.env.MONGO_URI_TEST ||
			`mongodb://localhost/${process.env.PROJECT_NAME}_test`);
	appConfig.redisHost = process.env.REDIS_HOST_TEST || "localhost";
	appConfig.redisPort = parseInt(process.env.REDIS_PORT, 10) || 6379;
	appConfig.redisMaxItem = parseInt(process.env.REDIS_MAX_ITEM, 10) || 1000; // maximum number of items in cache
	appConfig.redisTime = parseInt(process.env.REDIS_TIME, 10) || 864000; // seconds (10days)
	appConfig.fileImageMaxSize =
		parseInt(process.env.FILE_IMAGE_MAX_SIZE, 10) || 500000; //500kb
	appConfig.secretKey = process.env.SECRET_KEY || "SECRET_KEY";
	appConfig.paginationOffset =
		parseInt(process.env.PAGINATION_OFFSET, 10) || 0;
	appConfig.paginationLimit =
		parseInt(process.env.PAGINATION_LIMIT, 10) || 10;
}

export const swaggerConfig = {
	title: process.env.PROJECT_NAME || "nest_base_api",
	description:
		process.env.SWAGGER_DESCRIPTION || "An api endpoint documentation",
	version: process.env.PROJECT_VERSION || "1.0",
	swaggerBaseUrl: process.env.SWAGGER_BASE_URL || "swagger"
};
