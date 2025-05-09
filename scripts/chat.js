class ZanpChat {
    constructor(currentUser) {
        this.currentUser = currentUser;
        this.chatKey = 'zanp_chat_data';
        this.init();
    }

    init() {
        this.loadMessages();
        this.setupEventListeners();
        this.addSystemMessage("Chat conectado. Mensagens serão salvas.");
    }

    setupEventListeners() {
        document.getElementById('sendMessageBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatMessageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    loadMessages() {
        this.getMessages().forEach(msg => this.displayMessage(msg));
    }

    getMessages() {
        const chatData = localStorage.getItem(this.chatKey);
        return chatData ? JSON.parse(chatData).messages : [];
    }

    saveMessages(messages) {
        localStorage.setItem(this.chatKey, JSON.stringify({ messages }));
    }

    displayMessage({ user, text, color, timestamp, role }) {
        const time = new Date(timestamp).toLocaleTimeString();
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        const userClass = role === 'administrator' || role === 'owner' ? 'admin-user' : '';
        
        messageElement.innerHTML = `
            <span class="message-time">[${time}]</span>
            <span class="message-user ${userClass}" style="color: ${color};">${user}:</span>
            <span class="message-text">${text}</span>
        `;
        document.getElementById('chatMessages').appendChild(messageElement);
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
    }

    addSystemMessage(text) {
        const msg = {
            user: "Sistema",
            text,
            color: "#b36bff",
            timestamp: new Date().toISOString(),
            role: "system"
        };
        this.addMessage(msg);
    }

    addMessage(message) {
        const messages = this.getMessages();
        messages.push(message);
        this.saveMessages(messages);
        this.displayMessage(message);
    }

    sendMessage() {
        const input = document.getElementById('chatMessageInput');
        const message = input.value.trim();
        
        if (!message) return;

        if (message.startsWith('/')) {
            this.handleCommand(message);
            input.value = '';
            return;
        }

        const newMessage = {
            user: this.currentUser.username,
            text: message,
            color: '#d9b3ff',
            timestamp: new Date().toISOString(),
            role: this.currentUser.role
        };

        this.addMessage(newMessage);
        input.value = '';
    }

    handleCommand(command) {
        const cmd = command.toLowerCase().trim();

        if (cmd === '/clear') {
            if (this.currentUser.role === 'administrator' || this.currentUser.role === 'owner') {
                this.clearChat();
            } else {
                this.addSystemMessage("Você não tem permissão para isso!");
            }
        }
    }

    clearChat() {
        this.saveMessages([]);
        document.getElementById('chatMessages').innerHTML = '';
        this.addSystemMessage(`Chat limpo por ${this.currentUser.username}`);
    }
}