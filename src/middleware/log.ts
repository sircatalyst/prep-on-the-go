import { Timber } from "@timberio/node";
import "dotenv/config";

const { TIMBER_API_KEY, TIMBER_SOURCE_ID, NODE_ENV } = process.env;

let showTimberErrorLog = false;
if (NODE_ENV === "test") {
	showTimberErrorLog = true;
}
export const log = new Timber(TIMBER_API_KEY, TIMBER_SOURCE_ID, {
	// Maximum number of logs to sync in a single request to Timber.io
	batchSize: 1000,

	// Max interval (in milliseconds) before a batch of logs proceeds to syncing
	batchInterval: 1000,

	// Maximum number of sync requests to make concurrently (useful to limit
	// network I/O)
	syncMax: 100, // <-- we've increased concurrent network connections up to 100

	// Boolean to specify whether thrown errors/failed logs should be ignored
	ignoreExceptions: showTimberErrorLog
});