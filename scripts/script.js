document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    
    // Função para mostrar a tela logada com chat
    function showLoggedInScreen(username) {
        // Criar HTML da tela logada
        const loggedInHTML = `
            <div class="login-container" style="max-width: 500px;">
                <div class="header">
                    <h1>Bem-vindo ao <span class="highlight">Zanp - Never Die</span></h1>
                    <div class="decoration">
                        <div class="circle purple"></div>
                        <div class="circle dark-purple"></div>
                        <div class="circle light-purple"></div>
                    </div>
                </div>
                
                <div class="welcome-message">
                    <h2>E aí, <span>${username}</span>!</h2>
                    <p>Você está dentro do sistema!</p>
                </div>
                
                <div class="chat-tab">
                    <div class="chat-header">
                        <i class="fas fa-comment-dots"></i>
                        <span>Chat Zanp</span>
                    </div>
                    <div class="chat-messages">
                        <div class="message">
                            <span class="message-user" style="color: #b36bff;">Sistema:</span>
                            <span class="message-text">Fala aí ${username}, manda a braba!</span>
                        </div>
                    </div>
                    <div class="chat-input">
                        <input type="text" placeholder="Manda a braba..." id="chatMessageInput">
                        <button id="sendMessageBtn"><i class="fas fa-paper-plane"></i></button>
                    </div>
                </div>
                
                <div class="footer">
                    <button id="logoutBtn" class="logout-btn">Vazar daqui</button>
                    <p>by <span class="zaan">Zaan</span></p>
                </div>
            </div>
        `;
        
        // Substituir o conteúdo
        document.querySelector('.main-container').innerHTML = loggedInHTML;
        
        // Adicionar eventos do chat
        setupChat();
    }
    
    // Configurar o chat
    function setupChat() {
        const sendBtn = document.getElementById('sendMessageBtn');
        const chatInput = document.getElementById('chatMessageInput');
        const chatMessages = document.querySelector('.chat-messages');
        
        function sendMessage() {
            const message = chatInput.value.trim();
            if (message) {
                // Adicionar mensagem do usuário
                const userMsg = document.createElement('div');
                userMsg.className = 'message';
                userMsg.innerHTML = `
                    <span class="message-user" style="color: #d9b3ff;">Você:</span>
                    <span class="message-text">${message}</span>
                `;
                chatMessages.appendChild(userMsg);
                chatInput.value = '';
                
                // Rolagem automática
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // Resposta automática (aleatória)
                setTimeout(() => {
                    const responses = [
                        "TOMA NO CU KKKKKKK",
                        "Sabe de nada inocente!",
                        "Manda foto do pé",
                        "Hahahahaha que merda",
                        "Fala sério...",
                        "Aqui é zanp nunca morre porra"
                    ];
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    
                    const systemMsg = document.createElement('div');
                    systemMsg.className = 'message';
                    systemMsg.innerHTML = `
                        <span class="message-user" style="color: #b36bff;">Sistema:</span>
                        <span class="message-text">${randomResponse}</span>
                    `;
                    chatMessages.appendChild(systemMsg);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 800);
            }
        }
        
        // Eventos
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
        
        // Evento de logout
        document.getElementById('logoutBtn').addEventListener('click', function() {
            location.reload(); // Recarrega a página
        });
    }
    
    // Evento de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (username && password) {
            // Simulação de login bem-sucedido
            showLoggedInScreen(username);
        } else {
            alert('Preencha os campos porra!');
        }
    });
    
    // Evento do link "Esqueci a senha"
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('TOMO NO CU KKKKKKKKKKKK');
    });
});
