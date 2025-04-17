const express = require('express');
const mineflayer = require('mineflayer');
const { GoalNear } = require('mineflayer-pathfinder').goals;
const pathfinder = require('mineflayer-pathfinder');
const app = express();
const port = 3000;

let botConfig = {
  host: 'mapatest97.aternos.me',  // IP padrão
  port: 25565,                    // Porta padrão
  username: 'bot_espectador',     // Nome padrão do bot
  version: '1.21.4'               // Versão padrão do Minecraft
};

// Função para formatar o tempo de atividade
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
}

let startTime = Date.now();

// Inicializa o servidor express
app.use(express.static('public'));  // Serve arquivos estáticos (HTML, CSS, JS)

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Rota para retornar status e tempo de atividade do bot
app.get('/status', (req, res) => {
  const uptime = Date.now() - startTime;
  const players = bot.players;
  const numPlayers = Object.keys(players).length;

  res.json({
    uptime: formatUptime(uptime),
    numPlayers: numPlayers
  });
});

// Rota para configurar o bot (IP, porta, nome e versão)
app.get('/config', (req, res) => {
  const { host, port, username, version } = req.query;

  // Atualiza as configurações com base nos parâmetros passados na URL
  if (host) botConfig.host = host;
  if (port) botConfig.port = port;
  if (username) botConfig.username = username;
  if (version) botConfig.version = version;

  // Reinicia o bot com as novas configurações
  initializeBot();
  res.json({ message: 'Configurações atualizadas com sucesso', botConfig });
});

// Função para inicializar o bot com as configurações fornecidas
function initializeBot() {
  if (bot) {
    bot.quit(); // Desconecta o bot anterior se ele estiver rodando
  }

  // Cria um novo bot com as configurações atualizadas
  bot = mineflayer.createBot({
    host: botConfig.host,
    port: botConfig.port,
    username: botConfig.username,
    version: botConfig.version
  });

  // Carrega o plugin de pathfinder
  bot.loadPlugin(pathfinder);

  bot.on('spawn', () => {
    console.log(`Bot "${botConfig.username}" entrou no servidor!`);

    // Define o comportamento do bot (mover-se dentro de um quadrado 100x100)
    const areaLimit = 50; // Limite de 50 blocos (quadrado de 100x100)
    setInterval(() => {
      const x = Math.floor(Math.random() * areaLimit * 2) - areaLimit;
      const z = Math.floor(Math.random() * areaLimit * 2) - areaLimit;
      const y = bot.entity.position.y;
      bot.pathfinder.setGoal(new GoalNear(x, y, z, 1)); // Objetivo de movimento
    }, 5000);

    setInterval(() => {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 200);
      bot.look(Math.random() * 360, Math.random() * 360, true);
    }, 10000);

    setInterval(() => {
      bot.setControlState('forward', true);
      setTimeout(() => bot.setControlState('forward', false), 2000);
    }, 15000);

    setInterval(() => {
      bot.setControlState('sprint', true);
      setTimeout(() => bot.setControlState('sprint', false), 5000);
    }, 20000);
  });

  bot.on('end', () => {
    console.log('Bot caiu, tentando reconectar...');
    setTimeout(() => bot.connect(), 5000);
  });

  bot.on('error', (err) => {
    console.log('Erro:', err);
  });
}

// Inicializa o bot ao iniciar o servidor
initializeBot();
