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

var User = sequelize.define('user', {
	email: Sequelize.STRING
})

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync()
	.then(() => {
		console.log('Everything is synced');
		User.findById(1)
			.then((user) => {
				user.getTodos()
						.then((todos) => {
							todos.forEach((todo) => {
								console.log(todo.toJSON());
							})
						});
			})

	// 	User.create({
	// 		email: 'example@example.com'
	// 	})
	// 	.then(() => {
	// 		return Todo.create({
	// 			description: 'Do stuff'
	// 		})
	// 	})
	// 	.then((todo) => {
	// 		User.findById(1)
	// 			.then((user) => {
	// 				user.addTodo(todo);
	// 			});
	// 	});
	// })
	.catch((err) => {
		console.log(err);
	})
});