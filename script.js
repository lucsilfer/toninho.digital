const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat-btn');

// Aponta para a nossa função segura na Netlify
const apiUrl = '/.netlify/functions/chat'; 

const systemInstruction = "Você é o 'Toninho Digital', um assistente católico com a personalidade de um jovem estudioso, amigável e inspirador. Sua missão é tirar dúvidas sobre a doutrina católica, usando uma linguagem lúdica e clara, ideal para jovens. Suas fontes são EXCLUSIVAMENTE o Catecismo da Igreja Católica e as Sagradas Escrituras. Sempre cite as referências (ex: João 3:16 ou CIC 2558). Use emojis de forma moderada para tornar a conversa mais divertida. 😊 REGRA MAIS IMPORTANTE: Para estimular a curiosidade, sempre finalize suas respostas em duas partes: 1. Responda à pergunta original. 2. Ao final, adicione uma 'Curiosidade ✨' com um fato interessante relacionado ao tema e, em seguida, faça uma pergunta convidativa para que o usuário queira saber mais. Exemplo: 'Você sabia que São Longuinho era o soldado que perfurou o lado de Jesus? Se quiser, posso te contar a história completa dele!'";
const welcomeMessage = "Olá! Sou o Toninho. Em que posso te ajudar ?";
let conversationHistory = [];

// --- EVENT LISTENERS ---
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
        userInput.style.height = 'auto';
    }
});
sendBtn.addEventListener('click', () => {
    sendMessage();
    userInput.style.height = 'auto';
});
newChatBtn.addEventListener('click', resetChat);
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = `${userInput.scrollHeight}px`;
});

// --- FUNÇÕES ---

function resetChat() {
    chatBox.innerHTML = '';
    conversationHistory = [{ role: 'system', content: systemInstruction }];
    if (welcomeMessage) {
        addMessage(welcomeMessage, "ai");
        conversationHistory.push({ role: 'assistant', content: welcomeMessage });
    }
}

async function sendMessage() {
    const messageText = userInput.value.trim();
    if (messageText === '') return;
    
    addMessage(messageText, 'user');
    conversationHistory.push({ role: 'user', content: messageText });

    userInput.value = '';
    showLoadingIndicator();

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: conversationHistory 
            })
        });

        if (!response.ok) {
            throw new Error('A resposta do nosso servidor não foi bem-sucedida.');
        }

        const data = await response.json();
        removeLoadingIndicator();
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        const aiResponse = data.choices[0].message.content;
        
        addMessage(aiResponse, 'ai');
        conversationHistory.push({ role: 'assistant', content: aiResponse });

    } catch (error) {
        console.error('Erro ao chamar a API:', error);
        removeLoadingIndicator();
        addMessage('Ocorreu algum erro no sistema, poderia repetir a pergunta por gentileza?', 'ai');
    }
}

function addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    const icon_ai = 'system.png';
    const icon_user = 'user.png';
    const avatarSrc = sender === 'ai' ? icon_ai : icon_user;
    const textContainerClass = sender === 'ai' ? 'class="text-container"' : '';
    messageElement.innerHTML = `<img src="${avatarSrc}" alt="${sender} icon" class="avatar"><div ${textContainerClass}><div class="text">${text}</div></div>`;
    chatBox.appendChild(messageElement);

    // --- LÓGICA DE ROLAGEM CORRIGIDA E MAIS ROBUSTA ---
    setTimeout(() => {
        if (sender === 'ai') {
            // Pega TODAS as mensagens do usuário e seleciona a última da lista
            const allUserMessages = chatBox.querySelectorAll('.user-message');
            if (allUserMessages.length > 0) {
                const lastUserMessage = allUserMessages[allUserMessages.length - 1];
                // Rola a tela para que o TOPO da última pergunta do usuário fique visível
                lastUserMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // Se por algum motivo não houver pergunta (como na 1ª msg), rola para o início da msg da IA
                messageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            // Para mensagens do usuário, rola para o final
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, 0);
}

function showLoadingIndicator() {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading';
    loadingElement.classList.add('message', 'ai-message');
    const icon_ai = 'system.png';
    loadingElement.innerHTML = `<img src="${icon_ai}" alt="ai icon" class="avatar"><div class="text-container"><div class="loading-indicator"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>`;
    chatBox.appendChild(loadingElement);

    setTimeout(() => {
        loadingElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 0);
}

function removeLoadingIndicator() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Inicia o chat quando a página carrega
resetChat();