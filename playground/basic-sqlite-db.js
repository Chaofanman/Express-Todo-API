var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-db.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 255]
		} 
	}, 
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

sequelize.sync()
	.then(() => {
		console.log('Everything is synced');

		Todo.create({
			description: 'Rock you back to sleep',	
			completed: false
		})
		.then((todo) => {
			return Todo.create({
				description: 'Clean office'
			})
		})
		.then(() => {
			return Todo.findAll({
				where: {
					description: {
						$like: '%rock%'
					}
				}
			})
		})
		.then((todos) => {
			if (todos) {
				todos.forEach((todo) => {
					console.log(todo.toJSON());
				});
			} else {
				console.log('Doesnt exist');
			}
		})
		.catch((err) => {
			console.log(err);
		});
	});