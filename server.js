const express = require("express");
const path = require("path");

const app = express();
// config protocolo http
const server = require("http").createServer(app);
// config protocolo socket.io
const io = require("socket.io")(server);
// config arquivos públicos(estáticos) acessados pela aplicação
app.use(express.static(path.join(__dirname, "public")));
// apontando a pasta onde estarão as views
app.set("views", path.join(__dirname, "public"));
// definindo a engine da view como html e
// utilizando o ejs para renderizar o html
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

// configurando a rota principal,
// para que quando ela seja acessada o arquivo index.html seja renderizado
app.use("/", (req, res) => {
  res.render("index.html");
});

// iremos criar um array para armazenar as mensagens
let messages = [];

// toda vez que um cliente conectar ao socket,
// iremos receber um parâmetro(socket),
// onde iremos executar uma função para determinar o que irá ocorrer
io.on("connection", socket => {
  console.log(`Socket conectado: ${socket.id}`);
  // aqui nós iremos ter dentro da função on o mesmo evento que
  // foi definido no front-end dentro da função emit(), ou seja, o sendMessage,
  // que é o evento responsável por enviar a mensagem através do socket.
  // ou seja, o que estamos fazendo aqui é receber os dados que estão vindo
  // do front.
  // o segundo parâmetro do método on, além do nome do evento definido no envio
  // da mensagem do front, será o parâmetro data,
  // que irá conter os dados enviados no front.

  // enviando todas as mensagens anteriores armazenadas no array messages
  // agora iremos ouvir esse evento no front para
  // que quando o navegador sera atualizado, não percamos as mensagens
  socket.emit("previousMessages", messages);

  socket.on("sendMessage", data => {
    console.log(data);
    messages.push(data);
    // o socket tem basicamente 3 eventos:
    // o emit que serve para enviar uma mensagem para o socket do
    // evento de connection
    // o socket.on() serve para ouvir uma mensagem,
    // que nesse caso é a mensagem vinda do front.
    // e temos o socket.broadcast.emit()
    // o broadcast vai enviar para todos os sockets conectados na aplicação.
    // abaixo utilizaremos o broadcast, enviando a mensagem que está vindo
    // do front, contida no parâmetro data
    // no front precvisaremos escutar esse receivedMessage
    socket.broadcast.emit("receivedMessage", data);
  });
});

server.listen(3000);
