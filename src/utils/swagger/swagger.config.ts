import { SwaggerType } from "./swagger.interface";
import { swaggerConfig } from "../../config/index";

const { title, description, version } = swaggerConfig;

export const SWAGGER_CONFIG: SwaggerType = {
	title,
	description,
	version,
	tags: ["Template"]
};
