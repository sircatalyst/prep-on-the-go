import { Timber } from "@timberio/node";
import "dotenv/config";
import { appConfig } from "../config";

export const log = new Timber(appConfig.timberApiKey, appConfig.timberSourceId, {
	// Maximum number of logs to sync in a single request to Timber.io
	batchSize: 1000,

	// Max interval (in milliseconds) before a batch of logs proceeds to syncing
	batchInterval: 1000,

	// Maximum number of sync requests to make concurrently (useful to limit
	// network I/O)
	syncMax: 100, // <-- we've increased concurrent network connections up to 100

	// Boolean to specify whether thrown errors/failed logs should be ignored
	ignoreExceptions: true
});