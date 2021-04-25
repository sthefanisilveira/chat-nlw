import { io } from "../http";
import { ConnectionsService } from "../services/ConnectionsService";
import { UsersService } from "../services/UsersService";
import { MessagesService } from "../services/MessagesService";

interface IParams {
  text: string;
  email: string;
}

io.on("connect", (socket) => {
  const connectionsService = new ConnectionsService();
  const usersService = new UsersService();
  const messagesService = new MessagesService();

  // Verifica o primeiro acesso do usuário, recebendo o texto e o e-mail
  socket.on("client_first_access", async (params) => {
    const socket_id = socket.id;
    const { text, email } = params as IParams;
    let user_id = null;

    // Verifica se já existe usuário com o e-mail informado
    const userExists = await usersService.findByEmail(email);

    // Se não existir, cadastra o usuário com o e-mail informado
    if(!userExists) {
      const user = await usersService.create(email);
      
      await connectionsService.create({
        socket_id,
        user_id: user.id
      });

      user_id = user.id;
    }else {
      user_id = userExists.id;

      // Se já existir, encontra o id do usuário
      const connection = await connectionsService.findByUserId(userExists.id);

      // Cria a conexão do usuário com o ws
      if (!connection) {
        await connectionsService.create({
          socket_id,
          user_id: userExists.id,
        });
      }else {
        connection.socket_id = socket_id;
        await connectionsService.create(connection);
      }
    }

    //Criação da mensagem enviada pelo usuário
    await messagesService.create({
      text,
      user_id
    });
  });
});