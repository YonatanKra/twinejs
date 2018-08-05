const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

exports.addMessage = functions.https.onRequest((req, res) => {
	// Grab the text parameter.
	const original = req.query.text;
	// Push the new message into the Realtime Database using the Firebase Admin SDK.
	return admin.database().ref('/messages').push({original: original}).then((snapshot) => {
		// Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
		return res.redirect(303, snapshot.ref.toString());
	});
});

exports.saveStory = functions.https.onRequest((req, res) => {
	// Grab the text parameter.
	const original = req.query.text;
	console.log(req.body);
	// Push the new message into the Realtime Database using the Firebase Admin SDK.
	return admin.database().ref('/stories').push( req.body).then((snapshot) => {
		// Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
		console.log('MM ' +  snapshot.ref.toString());
		return res.send(  snapshot.ref.toString());
		//return snapshot.exportVal();
	});
});

exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
	.onCreate((snapshot, context) => {
		// Grab the current value of what was written to the Realtime Database.
		const original = snapshot.val();
		console.log('Uppercasing', context.params.pushId, original);
		const uppercase = original.toUpperCase();
		// You must return a Promise when performing asynchronous tasks inside a Functions such as
		// writing to the Firebase Realtime Database.
		// Setting an "uppercase" sibling in the Realtime Database returns a Promise.
		return snapshot.ref.parent.child('uppercase').set(uppercase);
	});
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
