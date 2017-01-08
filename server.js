var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var bcrypt = require('bcrypt');

var db = require('./db.js');
var middleware = require('./middleware.js')(db);
var app = express();
var PORT = process.env.PORT || 3000;


app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send('Todo API Root');
});

app.get('/todos', middleware.requireAuthentication, (req, res) => {
	var query = req.query;
	var where = {
		userId: req.user.get('id')
	};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0){
		where.description = {
			$like: '%' + query.q + '%',
		};
	}

	db.todo.findAll({where: where})
		.then((todos) => {
			res.json(todos);
		})
		.catch((err) => {
			res.status(500).send(err);	
		});
});

app.get('/todos/:id', middleware.requireAuthentication, (req, res) => {
	var todoId = parseInt(req.params.id, 10);
	
	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	})
		.then((matchedTodo) => {
			if (matchedTodo) {
				res.json(matchedTodo.toJSON());
			} else {
					res.status(404).json({
						"error": "Todo with id " + todoId + " was not found"
					})
				}
			})
		.catch((err) => {
			res.status(500).send(err);
		});
});

app.post('/todos', middleware.requireAuthentication, (req, res) => {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body)
		.then((todo) => {
			req.user.addTodo(todo)
				.then(() => {
					return todo.reload();
				})
				.then(() =>  {
					res.json(todo.toJSON());
				});
			})
			.catch((err) => {
				res.status(400).json(err);
			});
});

app.delete('/todos/:id', middleware.requireAuthentication, (req, res) => {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	})
	.then((rowsDeleted) => {
		if (rowsDeleted === 0) {
			res.status(404).json({
				"error": "No todo with id " + todoId
			});
		} else {
			res.json(204).send();
		}
	}) 
	.catch((err) => {
		res.status(500).send(err);
	});
});

app.put('/todos/:id', middleware.requireAuthentication, (req, res) => {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	} 
	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findOne({
		where: {
			id: todoId,
			userId: req.user.get('id')
		}
	})
		.then((todo) => {
			if (todo) { 
				return todo.update(attributes);
			} else {
				res.status(404).json({
					"error": "No todo with id " + todoId
				});
			}
		})
		.catch((err) => {
			res.status(500).send(err);
		})
		.then((updatedTodo) => {
			res.json(updatedTodo.toJSON());
		})
		.catch((err) => {
			res.status(400).json(err);
		});
});

app.post('/users', (req, res) => {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body)
		.then((user) => {
			res.json(user.toPublicJSON());
		})
		.catch((err) => {
			res.status(400).json(err);
		})
});

app.post('/users/login', (req, res) => {
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body)
		.then((user) => {
			var token = user.generateToken('authenticate');
			userInstance = user;

			return db.token.create({
				token: token
			});
		})
		.then((tokenInstance) => {
			res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
		})
		.catch((err) => {
			res.status(401).send();
		})
})

app.delete('/users/login', middleware.requireAuthentication, (req, res) => {
	req.token.destroy()
		.then(() => {
			res.status(204).send();
		})
		.catch(() => {
			res.status(500).send();
		})
});

db.sequelize.sync()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Express listening on port ${PORT}`)
		});
	});

