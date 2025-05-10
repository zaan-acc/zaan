let currentUser = null;
let config = {};
let menus = {};
let videos = {};
let zanpChat = null;

// Carrega configurações
async function loadConfig() {
    try {
        const response = await fetch('lib/config.json');
        config = await response.json();
        console.log('Configurações carregadas:', config);
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

// Carrega menus
async function loadMenus() {
    try {
        const response = await fetch('lib/menus.json');
        menus = await response.json();
        console.log('Menus carregados:', menus);
    } catch (error) {
        console.error('Erro ao carregar menus:', error);
    }
}

// Carrega vídeos - VERSÃO CORRIGIDA
async function loadVideos() {
    try {
        console.log('[DEBUG] Tentando carregar vídeos...');
        const response = await fetch('lib/menu2.json');
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        videos = await response.json();
        console.log('[DEBUG] Vídeos carregados com sucesso:', videos);
        
        // Verificação de estrutura
        if (!videos.videos) {
            console.error('Estrutura inválida - criando fallback');
            videos = {
                videos: {
                    "Debug": [{
                        "nome": "Vídeos carregados",
                        "descricao": "Estrutura verificada",
                        "icone": "fas fa-check",
                        "link": "#",
                        "duracao": "00:00"
                    }]
                }
            };
        }
    } catch (error) {
        console.error('Falha ao carregar vídeos. Usando fallback...', error);
        
        // Fallback hardcoded
        videos = {
            videos: {
                "Tutoriais": [
                    {
                        "nome": "Spy any computer on Kali Linux",
                        "descricao": "Monitoramento avançado com Kali - Linux",
                        "icone": "fas fa-eye",
                        "link": "https://www.youtube.com/embed/mCM3gQhGweA",
                        "duracao": "10:45"
                    },
                    {
                        "nome": "How Hackers make Undetectable Malware",
                        "descricao": "Técnicas de criação de malware stealth - Windows/Linux",
                        "icone": "fas fa-shield-virus",
                        "link": "https://www.youtube.com/embed/XSa1B1Hzaww",
                        "duracao": "15:22"
                    }
                ]
            }
        };
    }
}

// Configura o formulário de login
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
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

// Mostra a tela de boas-vindas
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
    
    typeWriter(welcomeMessages[0], 0, () => {
        setTimeout(cycleMessages, 2000);
    });
}

// Mostra o dashboard após login
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardScreen').style.display = 'block';
    
    document.getElementById('userDescription').textContent = `Bem-vindo, ${currentUser.username}`;
    
    const userPhoto = document.getElementById('userPhoto');
    if (currentUser.photo) {
        userPhoto.src = `lib/img/${currentUser.photo}`;
    } else {
        userPhoto.src = 'https://via.placeholder.com/80';
    }
    
    zanpChat = new ZanpChat(currentUser);
    setupMenuListeners();
    showWelcomeScreen();
}

// Configura os listeners do menu - VERSÃO ATUALIZADA
function setupMenuListeners() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            const sectionId = this.getAttribute('data-section') + '-section';
            const section = document.getElementById(sectionId);
            if (!section) {
                console.error(`Seção não encontrada: ${sectionId}`);
                return;
            }
            
            section.classList.add('active');
            
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
                case 'videos':
                    initVideos();
                    break;
            }
        });
    });
    
    document.getElementById('logoutBtn').addEventListener('click', function() {
        currentUser = null;
        document.getElementById('dashboardScreen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginForm').reset();
    });

    // Configura o botão de configurações
    document.getElementById('settingsBtn').addEventListener('click', function() {
        loadConfigScript();
    });
}

// Função para carregar o script de configurações
function loadConfigScript() {
    // Verifica se já existe um modal de configurações aberto
    if (document.getElementById('configModal')) {
        return;
    }

    // Cria um elemento script para carregar o config.js
    const script = document.createElement('script');
    script.src = '/scripts/config.js';
    
    // Adiciona ao body do documento
    document.body.appendChild(script);
    
    // Remove após carregar (opcional)
    script.onload = function() {
        console.log('Configurações carregadas com sucesso');
        
        // Se o config.js tiver uma função init, ela será chamada automaticamente
        if (typeof initConfig === 'function') {
            initConfig();
        }
    };
}

// Inicializa a seção de vídeos - VERSÃO CORRIGIDA
function initVideos() {
    console.log('[DEBUG] Inicializando seção de vídeos...', videos);
    
    const videosSection = document.getElementById('videos-section');
    if (!videosSection) {
        console.error('Seção de vídeos não encontrada!');
        return;
    }

    videosSection.innerHTML = `
        <h2><i class="fas fa-video"></i> Vídeos</h2>
        <div class="search-box">
            <input type="text" id="videoSearch" placeholder="Pesquisar vídeos...">
            <i class="fas fa-search"></i>
        </div>
        <div class="videos-container" id="videosContainer"></div>
    `;

    document.getElementById('videoSearch').addEventListener('input', function() {
        filterVideos(this.value);
    });

    renderVideos();
}

// Renderiza os vídeos - VERSÃO CORRIGIDA
function renderVideos(filter = '') {
    console.log('[DEBUG] Renderizando vídeos...');
    
    const container = document.getElementById('videosContainer');
    if (!container) {
        console.error('Container de vídeos não encontrado!');
        return;
    }

    container.innerHTML = '';

    if (!videos || !videos.videos || Object.keys(videos.videos).length === 0) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Nenhum vídeo disponível no momento</p>
                <p>Verifique o console para detalhes</p>
            </div>
        `;
        return;
    }

    for (const [category, videoList] of Object.entries(videos.videos)) {
        const filteredVideos = videoList.filter(video => 
            video.nome.toLowerCase().includes(filter.toLowerCase()) || 
            video.descricao.toLowerCase().includes(filter.toLowerCase())
        );

        if (filteredVideos.length > 0) {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'video-category';
            categoryElement.innerHTML = `<h3>${category}</h3>`;
            
            const videosGrid = document.createElement('div');
            videosGrid.className = 'videos-grid';
            
            filteredVideos.forEach(video => {
                const videoCard = document.createElement('div');
                videoCard.className = 'video-card';
                videoCard.innerHTML = `
                    <div class="video-wrapper">
                        <iframe src="${video.link}" frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                    <div class="video-info">
                        <h4>${video.nome}</h4>
                        <p>${video.descricao}</p>
                        <div class="video-meta">
                            <span><i class="fas fa-clock"></i> ${video.duracao || 'N/A'}</span>
                            <a href="${video.link}" target="_blank"><i class="fas fa-external-link-alt"></i></a>
                        </div>
                    </div>
                `;
                videosGrid.appendChild(videoCard);
            });
            
            categoryElement.appendChild(videosGrid);
            container.appendChild(categoryElement);
        }
    }
}

function filterVideos(searchTerm) {
    renderVideos(searchTerm);
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
                        width="0%" height="0" allowtransparency="true" 
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

// Inicialização - VERSÃO ATUALIZADA
document.addEventListener('DOMContentLoaded', async function() {
    console.log('[DEBUG] Iniciando carregamento...');
    
    try {
        await loadConfig();
        await loadMenus();
        await loadVideos();
        
        console.log('[DEBUG] Todos os dados carregados:', {
            config, menus, videos
        });
        
        setupLoginForm();
        
        // Configura a tela inicial no dashboard
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) {
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
        }
    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
});
