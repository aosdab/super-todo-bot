/**
 * Created by Vampiire on 6/1/17.
 */

// require the commands file which defines the commands the bot will accept from the user
const commands = require('./commands');

// require mongoose to enable interaction with mLab database
const mongoose = require('mongoose');

// connect mongoose to mLab database
// UN: chingu-todo, PW: todoBOT
mongoose.connect('mongodb://chingu-todo:todoBOT@ds161121.mlab.com:61121/todo-bot');

// create a schema for what is passed to the database
let newListSchema = new mongoose.Schema({
    // either channel or user ID will replace the default _id created by the database
    _id: String,
    item: {
        item: String,
        created: Date,
        completed: Boolean,
        id: String
    }
});

// create model that implements the list Schema
let listItem = mongoose.model('listItem', newListSchema);


// todoArray used for new todo lists
let todoArray = [];

module.exports = function(app) {

// Handle GET requests
    app.get('/', function (req, res) {
        handleQueries(req.query, res);
    });

// Handle POST requests
    app.post('/', function (req, res) {
        handleQueries(req.body, res);
    });

    function handleQueries(req, res) {
        // Validate token
        if (req.token !== "nPJ9nsPaIBb9dv2MDtDRY7sL") {
            console.error("Invalid Token");
            return res.json({text: "Error: Invalid Token"});
        }

        // Get unix timestamp
        let timestamp = Math.round(Date.now() / 1000.0);

        if (req.text) {
            let text = req.text;
            let user_id = req.user_id;
            let users = text.match(/<@[A-Z0-9]*\|\w*>/g);

            if (text.startsWith("add")) {
                // Create todo object
                let todo = {
                    text: text.substring(4),
                    completed: false,
                    time: timestamp,
                    id: (todoArray.length === 0 ? 1 : (todoArray.length + 1))
                };

                todoArray.forEach(function (e) {
                    if (e.id === todo.id) {
                        todo.id = todo.id + Number(Math.random().toFixed(1));
                    }
                });

                // Add to array
                commands.add(todoArray, todo);
            }

            // Delete todo
            if (text.startsWith("delete")) {
                // Get todo
                let todo = text.substring(7);
                // Delete from array
                commands.delete(todoArray, todo);
            }

            // Complete todo
            if (text.startsWith("done")) {
                let todo = text.substring(5);
                let todoTS = timestamp;
                if (todo = Number(todo)) {
                    commands.done(todoArray, todo, todoTS)
                }
                else {
                    console.error("Not a valid number");
                    return res.json({text: "Error: Use `/todo done #` where `#` is todo number"});
                }
            }

            // Get list
            if (text.startsWith("list")) {
                commands.view(todoArray);
            }

            let data = {
                response_type: 'ephemeral',
                attachments: [
                    {
                        title: "Todos",
                        text: "```" + commands.view(todoArray) + "```",
                        mrkdwn_in: ["text"]
                    }
                ]
            };
            res.json(data);
        }
    }
};

