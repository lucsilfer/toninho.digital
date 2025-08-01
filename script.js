// Este código roda no servidor seguro da Netlify

const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  // 1. Verifica se a requisição é do tipo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body);
    
    // 2. Pega a chave API da variável de ambiente segura
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Chave API não configurada no servidor' }),
      };
    }

    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        return {
            statusCode: response.status,
            body: JSON.stringify(errorData),
        };
    }
    
    const data = await response.json();

    // 3. Envia a resposta da OpenAI de volta para o frontend
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};