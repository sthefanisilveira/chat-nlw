document.querySelector("#start_chat").addEventListener("click", (event) => {
  
  // Quando o chat for iniciado, uma nova janela será aberta, enquanto a antiga será fechada.
  const chat_help = document.getElementById("chat_help");
  chat_help.style.display = "none";

  const chat_in_support = document.getElementById("chat_in_support");
  chat_in_support.style.display = "block";
  
  // Inicialização do ws
  const socket = io();  

  // Recebendo as informações enviadas pelo usuário
  const email = document.getElementById("email").value;
  const text = document.getElementById("txt_help").value;

  socket.on("connect", () => {
    const params = {
      email,
      text,
    };
    socket.emit("client_first_access", params, (call, err) => {
      if (err) {
        console.log.err(err);
      } else {
        console.log(call);
      }
    });
  });
});
