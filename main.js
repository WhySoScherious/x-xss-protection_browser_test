global.xssMode = null;

const cors = require('cors');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');
const hbs = require('hbs');
const server = express();

const port = process.env.PORT || 8081;

/* Setttings */
server.set('views', __dirname + '/public/views');
server.set('view engine', 'html');
server.engine('html', require('hbs').__express);
server.set('view options', { layout: 'layout' });

/* Register Partials */
hbs.registerPartials(__dirname + '/public/views');

server.options('*', cors({
    'origin': '*',
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'allowedHeaders': ['Content-Type', 'X-XSS-Protection'],
    'preflightContinue': true
}));

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.use((req, res, next) => {
    if (global.xssMode !== null) {
        res.setHeader('X-XSS-Protection', global.xssMode);
    } else {
        res.removeHeader('X-XSS-Protection');
    }

    return next();
});

server.use(express.static(path.join(__dirname, 'public')));
server.use(errorhandler({ dumpExceptions: true, showStack: true }));
server.disable('x-powered-by');

const setXssMode = (mode, res) => {
    switch (mode) {
        case '0':
            global.xssMode = '0';
            res.json({ 'X-XSS-Protection': '0' });
            break;
        case '1':
            global.xssMode = '1';
            res.json({ 'X-XSS-Protection': '1' });
            break;
        case '1; mode=block':
            global.xssMode = '1; mode=block';
            res.json({ 'X-XSS-Protection': '1; mode=block' });
            break;
        case 'none':
            global.xssMode = null;
            res.json({ 'X-XSS-Protection': null });
            break;
    }
};

/* Routes */
server.options('/', (req, res) => {
    res.send('options');
});

server.get('/', (req, res) => {
    res.status(200);
    res.render('main', {
        title: 'XSS Filter Test',
        includeBootStrapCss: true,
        partial: () => {
            return 'main';
        }
    });
});

server.get('/back', (req, res) => {
    res.json({ 'X-XSS-Protection': global.xssMode });
});

server.get('/xss', (req, res) => {
    res.status(200);
    res.render('xss', {
        title: 'XSS Attack Page (GET)',
        rawScript: decodeURIComponent(req.query.txtName),
        xssScript: () => {
            return new hbs.handlebars.SafeString(req.query.txtName);
        },
        partial: () => {
            return 'xss';
        }
    });
});

server.post('/xss', (req, res) => {
    res.status(200);
    res.render('xss', {
        title: 'XSS Attack Page (POST)',
        rawScript: decodeURIComponent(req.body.txtName),
        xssScript: () => {
            return new hbs.handlebars.SafeString(req.body.txtName);
        },
        partial: () => {
            return 'xss';
        }
    });
});

server.post('/setXSS', (req, res) => {
    if (req.body && req.body.hasOwnProperty('xssMode')) {
        setXssMode(req.body.xssMode, res);
    } else {
        console.log('Invalid X-XSS-Protection mode');

        res.removeHeader('X-XSS-Protection');
        res.status(400);
        res.send('Invalid X-XSS-Protection mode');
    }
});

const listener = server.listen(port, (err) => {
    if (err) {
        throw err;
    }

    console.log('Server running at:', listener.address().port);
});
