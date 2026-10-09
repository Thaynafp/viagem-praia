const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const BACKUP_FILE = path.join(__dirname, 'data.backup.json');

// Middlewares
app.use(express.json());
app.use(express.static('public'));
app.use(cors()); // Permite que o GitHub Pages acesse essa API

// Inicia com dados em branco se o arquivo não existir
if (!fs.existsSync(DATA_FILE)) {
    const initialData = { friends: [], beaches: [], places: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
}

if (!fs.existsSync(BACKUP_FILE)) {
    fs.copyFileSync(DATA_FILE, BACKUP_FILE);
}

// ROTA GET: Envia os dados atuais para quem acessar o site
app.get('/api/data', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error("Erro ao ler data.json:", error);
        res.status(500).json({ error: 'Erro interno ao ler os dados' });
    }
});

// ROTA POST: Recebe os dados atualizados de um voto/cadastro e salva no JSON
app.post('/api/data', (req, res) => {
    try {
        const newData = req.body;
        if (!newData || !Array.isArray(newData.friends) || !Array.isArray(newData.beaches) || !Array.isArray(newData.places)) {
            return res.status(400).json({ error: 'Formato de dados inválido' });
        }

        fs.copyFileSync(DATA_FILE, BACKUP_FILE);
        fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2), 'utf8');
        res.status(200).json({ message: 'Dados sincronizados com sucesso!' });
    } catch (error) {
        console.error("Erro ao salvar data.json:", error);
        res.status(500).json({ error: 'Erro interno ao salvar os dados' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});