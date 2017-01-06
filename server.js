var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
	id: 1,
	description: 'Start todo api',
	completed: true,
}, {
	id: 2,
	description: 'Commit to github',
	completed: false
}];

var globalTodoId = 3;

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send('Todo API Root');
});

app.get('/todos', (req, res) => {
	res.json(todos);
});

app.get('/todos/:id', (req, res) => {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.err(404).send();
	}
});

app.post('/todos', (req, res) => {
	var body = _.pick(req.body, 'description', 'completed');

	if (!_.isBoolean(body.completed) || !_.isString(body.description) ||  body.description.trim().length === 0){
		return res.status(400).send();
	}

	body.id = globalTodoId++;

	body.description = body.description.trim();

	todos.push(body);
	
	res.json(body);
});

app.listen(PORT, () => {
	console.log(`Express listeninng on port ${PORT}`)
});