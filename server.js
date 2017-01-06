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
	var queryParams = req.query;
	var filteredTodos = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(todos, {completed: true});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(todos, {completed: false});
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0){
		filteredTodos = _.filter(filteredTodos, (todo) => {
			return todo.description.indexOf(queryParams.q) > -1;
		})
	}

	res.json(filteredTodos);
});

app.get('/todos/:id', (req, res) => {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		return res.status(404).json({
			"error": "Todo with id " + todoId + " was not found"
		})
	}
});

app.post('/todos', (req, res) => {
	var body = _.pick(req.body, 'description', 'completed');

	if (!_.isBoolean(body.completed) || !_.isString(body.description) ||  body.description.trim().length === 0){
		return res.status(400).json({
			"error": "Error in data input"
		});
	}

	body.id = globalTodoId++;
	body.description = body.description.trim();
	todos.push(body);
	
	res.json(body);
});

app.delete('/todos/:id', (req, res) => {
	var todoId = parseInt(req.params.id, 10);
	var todoToDelete = _.findWhere(todos, {id: todoId});

	if (!todoToDelete){
		return res.status(400).json({
			"error": "Todo with id " + todoId + " was not found" 
		});
	} else {
		todos = _.without(todos, todoToDelete);
		res.json(todoToDelete);
	}	
});

app.put('/todos/:id', (req, res) => {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});	
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (!matchedTodo) {
		return res.status(404).json({
			"error": "Todo with id " + todoId + " was not found"
		})
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).json({
			error: "Completed attribute error"
		});
	} 

	if (body.hasOwnProperty('description') && _.isString(body.description) &&  body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')){
		return res.status(400).json({
			error: "Description attribute error"
		});
	}

	_.extend(matchedTodo, validAttributes);

	res.json(matchedTodo);
});

app.listen(PORT, () => {
	console.log(`Express listeninng on port ${PORT}`)
});