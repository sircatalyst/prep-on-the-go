const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
// Database Name
const dbName = "prepOnTheGo";

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
	console.log("Connected successfully to server");
	const db = client.db(dbName);
	const userCollectionInstance = db.collection("users");
	userCollectionInstance
		.update(
			{},
			{ $set: { refreshToken: "" } },
			{ upsert: false, multi: true }
		)
		.then(fieldsCreated => {
			console.log(fieldsCreated.result);
		})
		.catch(error => {
			console.log(error);
		});
	client.close();
});
