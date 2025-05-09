let currentUser = null;
let config = {};
let menus = {};
let zanpChat = null;

// Carrega configurações
async function loadConfig() {
    try {
        const response = await fetch('lib/config.json');
        config = await response.json();
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

// Carrega menus
async function loadMenus() {
    try {
        const response = await fetch('lib/menus.json');
        menus = await response.json();
    } catch (error) {
        console.error('Erro ao carregar menus:', error);
    }
}

// Configura o formulário de login
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const user = config.credentials.find(cred => 
            cred.username === username && cred.password === password
        );
        
        if (user) {
            currentUser = user;
            showDashboard();
        } else {
            alert('Usuário ou senha incorretos!');
        }
    });
}

// Mostra a tela de boas-vindas com efeito de digitação
function showWelcomeScreen() {
    const welcomeMessages = [
        "infinite possibilities",
        "Zaan esteve aqui",
        "yeh, im hacker",
        "the future is now"
    ];
    let currentMessage = 0;
    
    const subtitleElement = document.querySelector('.welcome-subtitle');
    const titleElement = document.querySelector('.welcome-title');
    
    // Atualiza o nome do usuário no título
    titleElement.innerHTML = `Bem-vindo de volta, <span class="highlight">${currentUser.username}</span>`;
    
    function typeWriter(text, i, cb) {
        if (i < text.length) {
            subtitleElement.innerHTML = text.substring(0, i + 1) + '<span class="typewriter"></span>';
            setTimeout(() => typeWriter(text, i + 1, cb), 100);
        } else if (cb) {
            setTimeout(cb, 1500);
        }
    }
    
    function eraseText(cb) {
        let text = subtitleElement.textContent;
        let length = text.length;
        
        if (length > 0) {
            subtitleElement.innerHTML = text.substring(0, length - 1) + '<span class="typewriter"></span>';
            setTimeout(() => eraseText(cb), 50);
        } else if (cb) {
            setTimeout(cb, 500);
        }
    }
    
    function cycleMessages() {
        eraseText(() => {
            currentMessage = (currentMessage + 1) % welcomeMessages.length;
            typeWriter(welcomeMessages[currentMessage], 0, () => {
                setTimeout(cycleMessages, 2000);
            });
        });
    }
    
    // Iniciar o ciclo
    typeWriter(welcomeMessages[0], 0, () => {
        setTimeout(cycleMessages, 2000);
    });
}

// Mostra o dashboard após login
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'block';
    
    // Atualiza informações do usuário
    document.getElementById('userDescription').textContent = `Bem-vindo, ${currentUser.username}`;
    
    // Inicializa o chat
    zanpChat = new ZanpChat(currentUser);
    
    // Configura os listeners do menu
    setupMenuListeners();
    
    // Mostra a tela de boas-vindas
    showWelcomeScreen();
}

// Configura os listeners do menu
function setupMenuListeners() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove a classe active de todos os itens
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Adiciona a classe active apenas ao item clicado
            this.classList.add('active');
            
            // Esconde todas as seções de conteúdo
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Mostra a seção correspondente
            const sectionId = this.getAttribute('data-section') + '-section';
            document.getElementById(sectionId).classList.add('active');
            
            // Inicializa a seção específica se necessário
            switch(this.getAttribute('data-section')) {
                case 'tools':
                    initTools();
                    break;
                case 'discord':
                    initDiscord();
                    break;
                case 'files':
                    initFiles();
                    break;
            }
        });
    });
    
    // Listener para logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        currentUser = null;
        document.getElementById('dashboardScreen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginForm').reset();
    });
}

// Ferramentas
function initTools() {
    const toolsSection = document.getElementById('tools-section');
    toolsSection.innerHTML = `
        <h2><i class="fas fa-tools"></i> Ferramentas</h2>
        <div class="search-box">
            <input type="text" id="toolSearch" placeholder="Pesquisar ferramentas...">
        </div>
        <div class="tools-container" id="toolsContainer"></div>
    `;

    // Pesquisa
    document.getElementById('toolSearch').addEventListener('input', function() {
        filterTools(this.value);
    });

    renderTools();
}

function renderTools(filter = '') {
    const container = document.getElementById('toolsContainer');
    container.innerHTML = '';

    for (const [category, tools] of Object.entries(menus.ferramentas)) {
        const filteredTools = tools.filter(tool => 
            tool.nome.toLowerCase().includes(filter.toLowerCase()) || 
            tool.descricao.toLowerCase().includes(filter.toLowerCase())
        );

        if (filteredTools.length > 0) {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'tool-category';
            categoryElement.innerHTML = `<h3>${category}</h3>`;
            
            const toolsGrid = document.createElement('div');
            toolsGrid.className = 'tools-grid';
            
            filteredTools.forEach(tool => {
                toolsGrid.innerHTML += `
                    <div class="tool-card" onclick="window.open('${tool.link}', '_blank')">
                        <i class="${tool.icone}"></i>
                        <h4>${tool.nome}</h4>
                        <p>${tool.descricao}</p>
                    </div>
                `;
            });
            
            categoryElement.appendChild(toolsGrid);
            container.appendChild(categoryElement);
        }
    }
}

function filterTools(searchTerm) {
    renderTools(searchTerm);
}

// Discord
function initDiscord() {
    const discordSection = document.getElementById('discord-section');
    discordSection.innerHTML = `
        <h2><i class="fab fa-discord"></i> Discord</h2>
        <div class="discord-container">
            <div class="discord-widget">
                <iframe src="" 
                        width="0%" height="0 allowtransparency="true" 
                        frameborder="0"></iframe>
            </div>
            <div class="discord-input">
                <input type="text" id="discordMessage" placeholder="Enviar mensagem...">
                <button id="sendToDiscord"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;

    document.getElementById('sendToDiscord').addEventListener('click', sendDiscordMessage);
}

async function sendDiscordMessage() {
    const message = document.getElementById('discordMessage').value;
    if (!message) return;

    try {
        const response = await fetch(config.discordWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `${currentUser.username}: ${message}`
            })
        });
        
        if (response.ok) {
            alert('Mensagem enviada para o Discord!');
            document.getElementById('discordMessage').value = '';
        }
    } catch (error) {
        console.error('Erro ao enviar para Discord:', error);
    }
}

// Files
function initFiles() {
    const filesSection = document.getElementById('files-section');
    filesSection.innerHTML = `
        <h2><i class="fas fa-folder"></i> Files</h2>
        <div class="coming-soon">
            <i class="fas fa-hourglass-half"></i>
            <p>Em breve - Sistema de arquivos em desenvolvimento</p>
        </div>
    `;
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    await loadConfig();
    await loadMenus();
    setupLoginForm();
    
    // Configura a tela inicial no dashboard
    const dashboardSection = document.getElementById('dashboard-section');
    dashboardSection.innerHTML = `
        <div class="welcome-screen">
            <h1 class="welcome-title">Bem-vindo de volta, <span class="highlight">%user%</span></h1>
            <div class="welcome-subtitle"></div>
            
            <div class="team-members">
                <div class="member-card">
                    <img src="lib/img/1.png" alt="Zaan" class="member-photo">
                    <div class="member-name">Zaan</div>
                </div>
                <div class="member-card">
                    <img src="lib/img/2.png" alt="V3rley" class="member-photo">
                    <div class="member-name">V3rley</div>
                </div>
                <div class="member-card">
                    <img src="lib/img/3.png" alt="GC" class="member-photo">
                    <div class="member-name">GC</div>
                </div>
                <div class="member-card">
                    <img src="lib/img/4.png" alt="x64neverdie" class="member-photo">
                    <div class="member-name">x64neverdie</div>
                </div>
            </div>
        </div>
    `;
});
