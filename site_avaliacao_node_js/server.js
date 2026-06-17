const express = require('express');
const path = require('path');
const sequelize = require('./database');
const Avaliacao = require('./models/Avaliacao');
const { fn, col } = require('sequelize');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.get('/', (req, res) => {
    res.render('index');
});
app.post('/avaliacao', async (req, res) => {
    try {
        const { nome, nota, comentario } = req.body;
        if (!nome || !nota) {
            return res.status(400).json({ status: 'error', message: 'Nome e avaliação são obrigatórios.' });
        }
        await Avaliacao.create({ nome, nota: parseInt(nota), comentario });
        res.json({ status: 'success', message: 'Avaliação enviada com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});
app.get('/admin', (req, res) => {
    res.render('admin');
});
app.get('/api/status', async (req, res) => {
    try {
        const total = await Avaliacao.count();
        const avgResult = await Avaliacao.findAll({
            attributes: [
                [fn('AVG', col('nota')), 'mediaNota']
            ]
        });
        const media = parseFloat(avgResult[0].dataValues.mediaNota || 0).toFixed(1);
        const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const distResult = await Avaliacao.findAll({
            attributes: [
                'nota',
                [fn('COUNT', col('id')), 'count']
            ],
            group: 'nota'
        });
        distResult.forEach(item => {
            distribuicao[item.nota] = item.dataValues.count;
        });
        const recentRaw = await Avaliacao.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        const recente = recentRaw.map(e => ({
            id: e.id,
            nome: e.nome,
            nota: e.nota,
            comentario: e.comentario,
            horario: e.createdAt.toLocaleString('pt-BR')
        }));
        res.json({ total, media, distribuicao, recente });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
