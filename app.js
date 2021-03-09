const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const users = require('./modelos/users');
const portarias = require('./modelos/portarias');
const jwt = require('jsonwebtoken');
const url = 'mongodb+srv://usuario2021:senha489@cluster0.tb4lv.mongodb.net/bdAdmin?retryWrites=true&w=majority';
const bcrypt = require('bcrypt');
const auth = require('./auth');


const options = {
    reconnectTries: Number.MAX_VALUE, reconnectInterval: 500, poolSize: 5, useNewUrlParser: true
}

mongoose.connect(url, options);

mongoose.connection.on('connected', () => {

    console.log("Aplicação conectada ao banco de dados!");

})

mongoose.connection.on('error', (err) => {

    console.log("Erro na conexão com banco de dados:" + err);

})

mongoose.connection.on('disconnected', () => {

    console.log("Aplicação desconectada do banco de dados!");

})


app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());


app.listen(3000, () => {

    console.log(`Example app listening at http://localhost:3000`)

})

app.get('/users', auth, (req, res) => {

    users.find({}, (err, data) => {

        if (err) return res.send({
            error: 'Erro na consulta de usuário!'
        });

        return res.send(data);

    });

})

app.get('/portarias', auth, (req, res) => {

    portarias.find({}, (err, data) => {

        if (err) return res.send({
            error: 'Erro na consulta de portaria!'
        });

        return res.send(data);

    });

})

app.post('/create/usuario', auth, (req, res) => {

    const { nome, email, senha, cargo, matricula } = req.body;
    if (!nome || !email || !senha || !cargo || !matricula) return res.send({
        error: 'Dados insuficientes!'
    });

    users.findOne({ matricula }, (err, data) => {
        if (err) return res.send({
            error: 'Erro ao buscar usuário!'
        });

        if (data) return res.send({
            error: 'usuário já cadastrado'
        });

        users.create(req.body, (err, data) => {
            if (err) return res.send({
                error: 'Erro ao criar usuário'
            });

            data.senha = undefined;
            return res.send({ data, token: createUserToken(data.id) });

        });
    });
})



app.post('/create/portaria', auth, (req, res) => {

    const { titulo, assunto } = req.body;
    if (!titulo || !assunto) return res.send({
        error: 'Dados insuficientes!'
    });

    portarias.findOne({ titulo }, (err, data) => {
        if (err) return res.send({
            error: 'Erro ao buscar portaria!'
        });

        if (data) return res.send({
            error: 'Portaria já cadastrada!'
        });

        portarias.create(req.body, (err, data) => {
            if (err) return res.send({
                error: 'Erro ao criar Portaria!'
            });

            return res.send({ data });

        });
    });
})


app.post('/return/portaria', async (req, res) => {
    try {
        const { titulo } = req.body;

        if (!titulo) return res.send({
            error: 'Dados insuficientes!'
        });

        const portaria = await portarias.findOne({ titulo })

        if (!portaria) return res.send({
            error: 'Portaria não registrada!'
        });

        return res.send(portaria);
    } catch {
        return res.send({
            error: 'Internal server error'
        });
    }
});


app.post('/return/usuario', auth, (req, res) => {

    const { matricula, senha } = req.body;

    if (!matricula || !senha) return res.send({
        error: 'Dados insuficientes!'
    });

    users.findOne({ matricula }, (err, data) => {

        if (err) return res.send({
            error: 'Erro ao buscar usuário!'
        });

        if (!data) return res.send({
            error: 'Usuário não registrado'
        });

        bcrypt.compare(senha, data.senha, (err, same) => {

            if (!same) return res.send({
                error: 'Erro ao autenticar usuário! Verifique sua senha.'
            });

            return res.send({ data, token: createUserToken(data.id) });

        });

    });

});

const createUserToken = (userId) => {

    return jwt.sign({ id: userId }, 'umasenha', { expiresIn: '14d' });

}




