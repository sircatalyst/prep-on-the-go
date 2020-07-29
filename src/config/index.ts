import "dotenv/config";

export const appConfig: any = {};

console.log(process.env.NODE_ENV == "test");
/**
 * @desc variables to user for production
 */
if (process.env.NODE_ENV === "production") {
	(appConfig.version = process.env.APP_VERSION || "v1"),
		(appConfig.name = process.env.PROJECT_NAME || "nest_base_api"),
		(appConfig.port = process.env.PORT || 3000),
		(appConfig.db = process.env.MONGO_URI_PRODUCTION),
		(appConfig.redisHost = process.env.REDIS_HOST || "localhost");
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
	appConfig.timberSourceId =
		parseInt(process.env.TIMBER_SOURCE_ID, 10) || 40283;
	appConfig.timberApiKey =
		parseInt(process.env.TIMBER_API_KEY, 10) ||
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2FwaS50aW1iZXIuaW8vIiwiZXhwIjpudWxsLCJpYXQiOjE1OTU0NjA4NTQsImlzcyI6Imh0dHBzOi8vYXBpLnRpbWJlci5pby9hcGlfa2V5cyIsInByb3ZpZGVyX2NsYWltcyI6eyJhcGlfa2V5X2lkIjo1NjcwLCJ1c2VyX2lkIjoiYXBpX2tleXw1NjcwIn0sInN1YiI6ImFwaV9rZXl8NTY3MCJ9.jQ36ZZxw9UnTSHuWWhVAK1IJudGV5aTl1qy4aa7w-ls";
}

/**
 * @desc variables to user for development environment
 */
if (process.env.NODE_ENV === "development") {
	(appConfig.name = process.env.PROJECT_NAME || "nest_base_api"),
		(appConfig.port = parseInt(process.env.PORT, 10) || 3001),
		(appConfig.db = process.env.MONGO_URI),
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
	appConfig.timberSourceId =
		parseInt(process.env.TIMBER_SOURCE_ID, 10) || 40283;
	appConfig.timberApiKey =
		parseInt(process.env.TIMBER_API_KEY, 10) ||
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2FwaS50aW1iZXIuaW8vIiwiZXhwIjpudWxsLCJpYXQiOjE1OTU0NjA4NTQsImlzcyI6Imh0dHBzOi8vYXBpLnRpbWJlci5pby9hcGlfa2V5cyIsInByb3ZpZGVyX2NsYWltcyI6eyJhcGlfa2V5X2lkIjo1NjcwLCJ1c2VyX2lkIjoiYXBpX2tleXw1NjcwIn0sInN1YiI6ImFwaV9rZXl8NTY3MCJ9.jQ36ZZxw9UnTSHuWWhVAK1IJudGV5aTl1qy4aa7w-ls";
}

/**
 * @desc variables to user for test environment
 */

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
appConfig.paginationOffset = parseInt(process.env.PAGINATION_OFFSET, 10) || 0;
appConfig.paginationLimit = parseInt(process.env.PAGINATION_LIMIT, 10) || 10;
appConfig.timberSourceId = process.env.TIMBER_SOURCE_ID || 40283;
appConfig.timberApiKey =
	process.env.TIMBER_API_KEY ||
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2FwaS50aW1iZXIuaW8vIiwiZXhwIjpudWxsLCJpYXQiOjE1OTU0NjA4NTQsImlzcyI6Imh0dHBzOi8vYXBpLnRpbWJlci5pby9hcGlfa2V5cyIsInByb3ZpZGVyX2NsYWltcyI6eyJhcGlfa2V5X2lkIjo1NjcwLCJ1c2VyX2lkIjoiYXBpX2tleXw1NjcwIn0sInN1YiI6ImFwaV9rZXl8NTY3MCJ9.jQ36ZZxw9UnTSHuWWhVAK1IJudGV5aTl1qy4aa7w-ls";

export const swaggerConfig = {
	title: process.env.PROJECT_NAME || "nest_base_api",
	description:
		process.env.SWAGGER_DESCRIPTION || "An api endpoint documentation",
	version: process.env.PROJECT_VERSION || "1.0",
	swaggerBaseUrl: process.env.SWAGGER_BASE_URL || "swagger"
};
