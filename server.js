var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost/messageBoard')
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
    name: {type: String, minlength: 4, required: true},
    message: {type: String, minlength: 1, required: true},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comments'}]
}, {timestamps: true});

var CommentSchema = new mongoose.Schema({
    name: {type: String, minlength: 4, required: true},
    comment: {type: String, minlength: 1, required: true},
    _message: {type: Schema.Types.ObjectId, ref: 'Messages'}
}, {timestamps: true});

mongoose.model('Messages', MessageSchema);
mongoose.model('Comments', CommentSchema);
var Message = mongoose.model('Messages');
var Comment = mongoose.model('Comments');

app.get('/', function(req, res) {
    // get all messages and comments
    Message.find().
    populate('comments').
    exec(function(err, messages) {
        console.log(err);
        console.log(messages);
        res.render('index', { messages: messages })
    })
});

app.post('/new_message', function(req, res) {
    console.log('process route');
    let message = new Message( {
        name: req.body.name,
        message: req.body.message,
        comments: []
    });
    message.save(function(err) {
        if (err) {
            console.log('failed to save', err);
            res.redirect('/')
        } else {
            console.log('saved successfully');
            res.redirect('/');
        }
    })
})

app.post('/new_comment/:id', function(req, res) {
    Message.findOne({_id: req.params.id}, function(err, message) {
        var comment = new Comment({
            name: req.body.name,
            comment: req.body.comment
        });
        comment._message = message._id;
        comment.save(function(err) {
            message.comments.push(comment);
            message.save(function(err) {
                if(err) {
                    console.log(err);
                } else {
                    res.redirect('/');
                }
            })
        })
    })
})

app.listen(8000, function(){
    console.log('listening on port 8000');
})