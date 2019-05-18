const functions = require('firebase-functions');
const story = require('./repositories/story');
const asset = require('./repositories/asset');
const person = require('./repositories/person');
const assetType = require('./repositories/assetType');
const lesson = require('./repositories/lesson');
const lessonStories = require('./repositories/lessonStories');
const goal = require('./repositories/goal');
const lessonGoals = require('./repositories/lessonGoals');
const assignment = require('./repositories/assignment');
const assignmentLessons = require('./repositories/assignmentLessons');


const cors = require('cors')({
	origin: true
});
const {
	Pool,
	Client
} = require('pg')
/*
const pool = new Pool({
  user: 'ztuqhnkbhhwcgl',
  host: 'ec2-54-228-243-238.eu-west-1.compute.amazonaws.com',
  database: 'd3lhr997fs4s47',
  password: '76bbecf6b927b8c80c00b0701f1b18b5a7cc9af29da5796945629ea230a243ad',
  port: 5432,
  ssl: true
})
*/
const clientConne = {
	user: 'ztuqhnkbhhwcgl',
	host: 'ec2-54-228-243-238.eu-west-1.compute.amazonaws.com',
	database: 'd3lhr997fs4s47',
	password: '76bbecf6b927b8c80c00b0701f1b18b5a7cc9af29da5796945629ea230a243ad',
	port: 5432,
	ssl: true
};

//const admin = require('firebase');
const admin = require('firebase-admin');

admin.initializeApp();



exports.addMessage = functions.https.onRequest((req, res) => {
	// Grab the text parameter.
	const original = req.query.text;
	// Push the new message into the Realtime Database using the Firebase Admin SDK.
	return admin.database().ref('/messages').push({
		original: original
	}).then((snapshot) => {
		// Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
		return res.redirect(303, snapshot.ref.toString());
	});
});

exports.saveStory = functions.https.onRequest((req, res) => {
	// Grab the text parameter.
	// Push the new message into the Realtime Database using the Firebase Admin SDK.
	return admin.database().ref('/stories').update({
		[JSON.parse(req.body).id]: JSON.parse(req.body)
	}).then(() => {
		// Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
		cors(req, res, () => {});

		return res.send('OK');
		//return snapshot.exportVal();
	});

});


exports.saveStories = functions.https.onRequest((req, res) => {
	// Grab the text parameter.
	const original = req.query.text;
	console.log(req.body);
	// Push the new message into the Realtime Database using the Firebase Admin SDK.
	return admin.database().ref('/stories_meta').update({
		storyIds: req.body
	}).then(() => {
		// Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
		//console.log('MM ' +  snapshot.ref.toString());
		cors(req, res, () => {});

		return res.send('OK');
		//return snapshot.exportVal();
	});
});

exports.savePassages = functions.https.onRequest((req, res) => {
	// Grab the text parameter.
	const original = req.query.text;
	console.log(req.body);
	// Push the new message into the Realtime Database using the Firebase Admin SDK.
	return admin.database().ref('/stories_meta').update({
		passageIds: req.body
	}).then((snapshot) => {
		// Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
		//console.log('MM ' +  snapshot.ref.toString());
		cors(req, res, () => {});

		return res.send('OK');
		//return snapshot.exportVal();
	});
});

exports.getStory = functions.https.onRequest((req, res) => {
	// Grab the text parameter.
	const id = req.query.storyID;
	console.log(req.body);
	// Push the new message into the Realtime Database using the Firebase Admin SDK.
	return admin.database().ref('/stories').once("value", (snapshot) => {
		// Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
		console.log('MM ' + snapshot.val());
		cors(req, res, () => {});

		return res.send(snapshot.val()[id]);
		//return snapshot.exportVal();
	});
});


exports.getStories = functions.https.onRequest((req, res) => {
	// Grab the text parameter.
	const original = req.query.text;
	console.log(req.body);
	// Push the new message into the Realtime Database using the Firebase Admin SDK.
	return admin.database().ref('/stories_meta').once("value", (snapshot) => {
		// Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
		console.log('MM ' + snapshot.val());
		cors(req, res, () => {});

		return res.send(snapshot.val().storyIds);
		//return snapshot.exportVal();
	});
});

const dbQueryGet = (query, delegate, error) => {
	const client = new Client(clientConne);

	client.connect()
	return client.query(query)
		.then(result => delegate(result))
		.catch(e => error && error(e.stack))
		.then(() => client.end());
}

exports.getAssets = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	return asset.getAll().then(data => {
		return res.send(data);
	}).catch(err => {
		return res.status(500).send(err);
	});
});

exports.addAsset = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	return asset.add(req.body).then(data => {
		return res.send(data);
	}).catch(err => {
		return res.status(500).send(err);
	});

});

exports.getSubjects = functions.https.onRequest((req, res) => {
	dbQueryGet('select lss.id sub_subject_id, lss.name sub_subject_name, ls.name subject_name, ls.image , ls.id subject_id from public.lov_sub_subjects lss ' +
		' right join public.lov_subjects ls ' +
		' on ls.id = lss.subject_id', (result => {

			let subjects = result.rows.reduce((a, b) => {
				if (!a[b.subject_id]) {
					a[b.subject_id] = {
						name: b.subject_name,
						sub_subjects: [],
						image: b.image,
						subject_id: b.subject_id
					};
				}

				a[b.subject_id].sub_subjects.push({
					sub_subject_id: b.sub_subject_id,
					subject_id: b.subject_id,
					sub_subject_name: b.sub_subject_name
				})
				return a;
			}, {})

			cors(req, res, () => {});

			res.send(subjects);
		}));
});

exports.getStatuses = functions.https.onRequest((req, res) => {
	dbQueryGet('SELECT * FROM public.lov_statuses', (result => {
		cors(req, res, () => {});
		let statuses = {};

		result.rows.forEach(status => {
			statuses[status.id] = status.name;
		});

		res.send(statuses);
	}));
});

exports.getRoles = functions.https.onRequest((req, res) => {
	dbQueryGet('SELECT * FROM public.lov_roles', (result => {
		cors(req, res, () => {});
		let roles = {};

		result.rows.forEach(role => {
			roles[role.id] = role.name;
		});

		res.send(roles);
	}));
});

exports.getLessons = functions.https.onRequest((req, res) => {

	const query = `
	select row_to_json(t) lesson
	from (
	  select lessons_json.*,
		(
		  select array_to_json(array_agg(row_to_json(stories_json)))
		  from (
			select ls.story_id, ls.order
			from public.rel_lessons_stories ls
			where ls.lesson_id=lessons_json.id
			order by ls.order asc
		  ) stories_json
		) as stories,
		
		(
		  select array_to_json(array_agg(row_to_json(goals_json)))
		  from (
			select lg.goal_id
			from public.rel_lessons_goals lg
			where lg.lesson_id=lessons_json.id
		  ) goals_json
		) as goals
		
	  from public.tbl_lessons lessons_json
	) t
	`;


	dbQueryGet(query, (result => {
		cors(req, res, () => {});

		res.send(result.rows.map(lesson => {
			return lesson.lesson;
		}));
	}));
});


exports.getPersons = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	return person.getAll().then(data => {
		return res.send(data);
	}).catch(err => {
		return res.status(500).send(err);
	});
});

exports.updatePerson = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	return person.update(req.body.id, req.body).then(() => {
		return res.send('success');
	}).catch(err => {
		return res.status(500).send(err);
	});
});

exports.getGoals = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	return goal.getAll().then(data => {
		return res.send(data);
	}).catch(err => {
		return res.status(500).send(err);
	});
});

exports.addGoal = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	return goal.add(req.body).then(data => {
		return res.send(data);
	}).catch(err => {
		return res.status(500).send(err);
	});
});

const validateStudentObj = obj => {
	return obj && obj.first_name && obj.surname && obj.birth_date && obj.email && obj.phone && obj.class && obj.role;
}


exports.addPerson = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	return person.add(req.body).then(data => {
		return res.send(data);
	}).catch(err => {
		return res.status(500).send(err);
	});
});

exports.deletePerson = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	return person.destroy({
		where: {
			id: req.body.id
		}
	}).then(() => {
		return res.send('Done');
	}).catch(err => {
		return res.status(500).send(err);
	})
});

exports.addStudent = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	if (validateStudentObj(req.body)) {

		const query = {
			text: 'INSERT INTO public.tbl_persons(first_name,surname,birth_date,role,email, phone,class,profile_img) ' +
				'VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
			values: [req.body.first_name, req.body.surname, req.body.birth_date,
				req.body.role, req.body.email, req.body.phone,
				req.body.class, 'pppppp'
			]
		}
		//	dbQueryGet(query, result => res.send(result.rows), err => res.status(500).send(err));
	} else {
		res.status(422).send('Missing fields');
	}
});

exports.getClasses = functions.https.onRequest((req, res) => {
	dbQueryGet('SELECT * FROM public.tbl_classes', (result => {
		cors(req, res, () => {});

		res.send(result.rows);
	}));
});


const validateClassObj = obj => {
	return obj && obj.grade && obj.school && obj.city;
}

exports.addClass = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	if (validateClassObj(req.body)) {
		const query = {
			text: 'INSERT INTO public.tbl_classes(grade,school,city) VALUES($1, $2, $3) RETURNING *',
			values: [req.body.grade, req.body.school, req.body.city]
		}
		dbQueryGet(query, result => res.send(result.rows), err => res.status(500).send(err));
	} else {
		res.status(422).send('Missing fields');
	}
});

const validateStoryMetaDataObj = obj => {
	return obj && obj.id && obj.name && obj.sub_subject;

}

exports.addStoryMetaData = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	if (validateStoryMetaDataObj(req.body)) {
		const query = {
			text: 'INSERT INTO public.tbl_stories(id, name, sub_subject, path, tags, description) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
			values: [req.body.id, req.body.name, req.body.sub_subject, req.body.path, req.body.tags, req.body.description]
		}
		dbQueryGet(query, result => res.send(result.rows), err => res.status(500).send(err));
	} else {
		res.status(422).send('Missing fields');
	}
});

exports.updateStoryMetaData = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	if (validateStoryMetaDataObj(req.body)) {
		const query = {
			text: 'UPDATE public.tbl_stories SET(name, sub_subject, path, tags, description, status) = ($2, $3, $4, $5, $6,$7) WHERE id = $1 RETURNING *',
			values: [req.body.id, req.body.name, req.body.sub_subject, req.body.path, req.body.tags, req.body.description, req.body.status]
		}
		dbQueryGet(query, result => res.send(result.rows), err => res.status(500).send(err));
	} else {
		res.status(422).send('Missing fields');
	}
});



exports.updateClass = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	if (validateClassObj(req.body) && req.body.id) {
		const query = {
			text: 'UPDATE public.tbl_classes SET(grade,school,city) = ($1, $2, $3) WHERE id = $4 RETURNING *',
			values: [req.body.grade, req.body.school, req.body.city, req.body.id]
		}
		dbQueryGet(query, result => res.send(result.rows), err => res.status(500).send(err));
	} else {
		res.status(422).send('Missing fields');
	}
});

exports.getAssetTypes = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	assetType.getAll().then(data => {
		const assetTypes = data.reduce((a, b) => {
			a[b.id] = b;
			return a
		}, {});

		res.send(assetTypes);
	}).catch(err => {
		res.status(500).send(err);
	});
});


exports.addLesson = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	return lesson.add(req.body).then(newLesson => {
		var lessonId = newLesson.id;

		return lessonStories.remove(lessonId).then(data => {
			return lessonStories.addMany(lessonId, req.body.stories).then(ls => {
				return lessonGoals.remove(lessonId).then(data => {
					return lessonGoals.addMany(lessonId, req.body.goals).then(goals => {
						return res.send({
							lesson: newLesson,
							rels_stories: ls,
							rels_goals: goals
						});
					});
				});
			})
		})
	}).catch(err => {
		return res.status(500).send(err);
	});
});

exports.updateLesson = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	var lessonId = req.body.id;
	return lesson.update(lessonId, req.body).then(() => {
		return lesson.get(lessonId).then(data => {
			var updatedLesson = data[0];

			return lessonStories.remove(lessonId).then(data => {
				return lessonStories.addMany(lessonId, req.body.stories).then(ls => {
					return lessonGoals.remove(lessonId).then(data => {
						return lessonGoals.addMany(lessonId, req.body.goals).then(goals => {
							return res.send({
								lesson: updatedLesson,
								rels_stories: ls,
								rels_goals: goals
							});
						});
					});
				})
			})
		});
	}).catch(err => {
		return res.status(500).send(err);
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

exports.getData = functions.https.onRequest((req, res) => {
	// Grab the text parameter.
	const original = req.query.text;
	console.log(req.body);
	// Push the new message into the Realtime Database using the Firebase Admin SDK.
	return admin.database().ref('/stories').once("value", (stories) => {
		// Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
		return admin.database().ref('/passages').once("value", (passages) => {

			return story.getAll().then(result => {
				const results = result.reduce((a, story) => {
					a[story.id] = Object.assign(stories.val()[story.id], {
						name: story.name,
						sub_subject: story.sub_subject,
						path: story.path,
						tags: story.tags,
						description: story.description,
						status: story.status,
					});
					return a;

				}, {});

				cors(req, res, () => {});

				return res.send({
					stories: results || [],
					passages: passages.val() || []
				});

			}, err => res.status(500).send(err));

		});
	});
});

exports.syncData = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	const stories = req.body.stories.map(JSON.parse).reduce((a, b) => {
		a[b.id] = b;
		return a
	}, {});

	const passages = req.body.passages.map(JSON.parse).reduce((a, b) => {
		a[b.id] = b;
		return a
	}, {});


	return admin.database().ref('/stories').update(stories).then((a, b, c) => {
		return admin.database().ref('/passages').update(passages).then((d, e, f) => {
			// Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
			cors(req, res, () => {});

			return res.send('success');
			//return snapshot.exportVal();
		});
	});
});

const validMessage = message => {
	return message.from && message.to && message.content && message.timeSpan;
};

exports.postMessage = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	var message = req.body;

	if (validMessage(message)) {
		var item = {};
		item[message.id] = message;

		return admin.database().ref('/messages').update(item).then(() => {
			return res.send( 'success');
		})
	} else {
		res.status(422).send('Missing fields');
	}
});

exports.getAllMessages = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});

	return admin.database().ref('/messages').once("value", messages => {
		return res.send(messages.val());
	});
});

exports.getAssignments = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});
	const assignmentList = [];

	return assignment.getAll().then(assignments => {
		return assignmentLessons.getAll().then(assignmentLessons => {

			var m = assignments.map(s=>Object.assign(
				{},
				{assignment : s},
				{lessons : assignmentLessons.filter(al=>al.assignment_id===s.id)}
			))

			return res.send(m);
		});
	}).catch(err => {
		return res.status(500).send(err);
	});
});

exports.addAssignment = functions.https.onRequest((req, res) => {
	cors(req, res, () => {});
	const promises = [];

	const createAssignmentForStudent = (student, assignmentObj) => {
		return new Promise((resolve, reject) => {
			const assignmentToAdd = Object.assign({}, assignmentObj, {
				assignee: student
			});

			return assignment.add(assignmentToAdd).then(newAssignment => {
				var assignmentId = newAssignment.id;

				return assignmentLessons.remove(assignmentId).then(data => {
					return assignmentLessons.addMany(assignmentId, assignmentToAdd.lessons).then(ls => {
						return resolve({
							lessons: ls,
							assignment: newAssignment,
						});
					})
				})
			}).catch(err => {
				return reject(err);
			});
		})
	}
	req.body.students.forEach(student => {
		promises.push(createAssignmentForStudent(student, req.body))
	});



	return Promise.all(promises).then(values => {
		return res.send(values);
	}).catch(err => {
		return res.status(500).send(err);
	});

});