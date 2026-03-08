# OAuth 2.0 - Guia de Implementação

Este documento explica como o OAuth 2.0 foi implementado neste projeto e como funciona o fluxo de autenticação com a API do Spotify.

## 📚

OAuth 2.0 é um protocolo de autorização que permite que aplicações acessem recursos de um usuário em outro serviço (como Spotify) **sem precisar da senha do usuário**. É o padrão usado por grandes serviços como Google, GitHub, Facebook e Spotify.

## 🔄 Fluxo de Autorização (Authorization Code Flow)

Este projeto utiliza o **Authorization Code Flow**, que é o fluxo mais seguro e recomendado para aplicações web. Vamos entender cada etapa:

### **Etapa 1: Usuário inicia o login**

Quando o usuário clica no botão de login, a aplicação redireciona para o Spotify com uma URL de autorização contendo os seguintes parâmetros:

```
https://accounts.spotify.com/authorize?
  client_id=SEU_CLIENT_ID
  &response_type=code
  &redirect_uri=http://127.0.0.1:5173/callback
  &scope=user-read-private user-read-email user-follow-read user-top-read
  &state=ABC123XYZ789
```

**Parâmetros importantes:**
- `client_id`: ID da sua aplicação no Spotify Developer Dashboard
- `response_type=code`: Indica que queremos receber um código de autorização
- `redirect_uri`: URL para onde o Spotify redirecionará após a autorização
- `scope`: Permissões que a aplicação está solicitando
- `state`: String aleatória para segurança (explicado abaixo)

### **Etapa 2: Spotify solicita autorização**

O Spotify exibe uma tela de autorização onde o usuário pode:
- ✅ **Aceitar** → Spotify gera um código de autorização
- ❌ **Negar** → Spotify retorna um erro e o fluxo é interrompido

### **Etapa 3: Spotify redireciona de volta**

Se o usuário aceitar, o Spotify redireciona para a URL configurada (`redirect_uri`) com os seguintes parâmetros:

```
http://127.0.0.1:5173/callback?
  code=NApCCg..BkWtQ
  &state=ABC123XYZ789
```

**Importante:** O `state` retornado deve ser **exatamente igual** ao `state` enviado na Etapa 1.

### **Etapa 4: Troca do código por token**

A aplicação faz uma requisição **segura** (com `client_secret`) para o endpoint de token do Spotify:

```
POST https://accounts.spotify.com/api/token
Headers:
  Authorization: Basic base64(client_id:client_secret)
  Content-Type: application/x-www-form-urlencoded
Body:
  grant_type=authorization_code
  code=NApCCg..BkWtQ
  redirect_uri=http://127.0.0.1:5173/callback
```

O Spotify responde com os tokens:

```json
{
  "access_token": "BQDx...",
  "refresh_token": "AQCx...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "user-read-private user-read-email ..."
}
```

### **Etapa 5: Uso do token**

Agora a aplicação pode fazer requisições autenticadas à API do Spotify:

```
GET https://api.spotify.com/v1/me/top/artists
Headers:
  Authorization: Bearer BQDx...
```

---

## 🛡️ Segurança: O parâmetro `state`

O parâmetro `state` é uma **medida de segurança crítica** para prevenir ataques CSRF (Cross-Site Request Forgery).

### **O Problema (sem `state`):**

Imagine este cenário de ataque:

1. Você está logado no Spotify em outra aba do navegador
2. Um site malicioso te engana e faz você clicar em um link:
   ```
   https://accounts.spotify.com/authorize?
     client_id=APP_MALICIOSA
     &redirect_uri=http://app-maliciosa.com/callback
     &response_type=code
   ```
3. Você autoriza (ou já está autorizado) sem perceber
4. O Spotify redireciona para `app-maliciosa.com/callback?code=CODIGO_ROUBADO`
5. A aplicação maliciosa rouba o código e pode acessar seus dados do Spotify

### **A Solução (com `state`):**

1. **A aplicação gera um `state` aleatório** e salva:
   ```javascript
   const state = generateRandomString(16); // Ex: "ABC123XYZ789"
   sessionStorage.setItem('spotify_oauth_state', state);
   ```

2. **Envia o `state` na URL de autorização:**
   ```
   https://accounts.spotify.com/authorize?...&state=ABC123XYZ789
   ```

3. **Spotify retorna o mesmo `state` no callback:**
   ```
   /callback?code=...&state=ABC123XYZ789
   ```

4. **A aplicação valida se o `state` corresponde:**
   ```javascript
   const savedState = sessionStorage.getItem('spotify_oauth_state');
   if (state !== savedState) {
     throw new Error('Ataque CSRF detectado!');
   }
   ```

### **Por que isso funciona?**

- Se um atacante tentar usar um código roubado, ele não terá o `state` correto
- O `state` é **único por sessão** e **impossível de adivinhar**
- Mesmo que o código seja roubado, sem o `state` correto, é inútil

---

## 🔐 Geração do `state` aleatório

A função `generateRandomString` gera uma string **imprevisível** e **única** para cada requisição de login.

### **Características importantes:**

1. **Aleatória**: Impossível de adivinhar
2. **Única**: Cada login tem um `state` diferente
3. **Longa o suficiente**: 16 caracteres = 62^16 possibilidades (extremamente seguro)

### **Implementação no projeto:**

```javascript
function generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
```

### **O que acontece se não usar `state`?**

- ❌ Vulnerável a ataques CSRF
- ❌ Não segue as melhores práticas de segurança
- ❌ A documentação do Spotify recomenda usar `state`

### **O que acontece se usar um `state` previsível?**

Se você usar algo como `state="123"` ou `state="meu-app"`:
- ❌ Um atacante pode adivinhar o `state`
- ❌ Pode criar URLs falsas que passam na validação
- ❌ A segurança é comprometida

---

## 📊 Diagrama do Fluxo Completo

```
┌─────────┐
│ Usuário │
└────┬────┘
     │ 1. Clica "Login"
     ▼
┌─────────────────┐
│  Aplicação      │
│  - Gera state   │
│  - Salva state  │
│    (sessionStorage)
└────┬────────────┘
     │ 2. Redireciona com state
     ▼
┌─────────────────┐
│  Spotify Auth   │
│  - Mostra tela  │
│  - Pede permissão│
└────┬────────────┘
     │ 3. Usuário autoriza
     ▼
┌─────────────────┐
│  Spotify Auth   │
│  - Gera code    │
│  - Retorna state│
└────┬────────────┘
     │ 4. Redireciona com code + state
     ▼
┌─────────────────┐
│  Aplicação      │
│  - Valida state │
│  - Troca code   │
│    por token    │
└────┬────────────┘
     │ 5. Recebe access_token
     ▼
┌─────────────────┐
│  Aplicação      │
│  - Salva token  │
│    (localStorage)
│  - Faz requests │
└─────────────────┘
```

---

## 🔄 Refresh Token - Renovação Automática

Os `access_token` expiram (geralmente em 1 hora). Para não pedir login toda hora, o Spotify também retorna um `refresh_token` (válido por muito tempo).

### **Como funciona:**

1. **Quando o `access_token` expira**, a aplicação usa o `refresh_token` para obter um novo
2. **O usuário não precisa fazer login novamente**
3. **O processo é automático e transparente**

### **Fluxo de renovação:**

```
Token expirado?
  ↓
POST https://accounts.spotify.com/api/token
  grant_type=refresh_token
  refresh_token=...
  client_id=...
  client_secret=...
  ↓
Novo access_token (válido por mais 1 hora)
```

### **Implementação no projeto:**

O serviço `oauthService` gerencia automaticamente a renovação de tokens. Quando uma requisição falha por token expirado, o serviço:
1. Detecta o erro 401 (Unauthorized)
2. Usa o `refresh_token` para obter um novo `access_token`
3. Repete a requisição original automaticamente

---

## 🔧 Configuração Necessária

### **1. Criar aplicação no Spotify Developer Dashboard**

1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Faça login com sua conta Spotify
3. Clique em "Create app"
4. Preencha os dados:
   - **App name**: Nome da sua aplicação
   - **App description**: Descrição (opcional)
   - **Redirect URI**: `http://127.0.0.1:5173/callback`
5. Aceite os termos e clique em "Save"

### **2. Obter credenciais**

Após criar a aplicação, você terá acesso a:
- **Client ID**: Identificador público da aplicação
- **Client Secret**: Chave secreta (nunca exponha no frontend!)

### **3. Configurar variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_CLIENT_ID=seu_client_id_aqui
VITE_REDIRECT_URI=http://127.0.0.1:5173/callback
```

**⚠️ Importante:**
- O Spotify **não aceita** `localhost` como Redirect URI
- Use `127.0.0.1` ao invés de `localhost`
- O `Client Secret` **não deve** ser exposto no frontend
- Para aplicações frontend, o Spotify usa o **Implicit Grant Flow** ou **PKCE**, mas este projeto usa um backend proxy (não implementado) ou assume que o `client_secret` está seguro

### **4. Scopes necessários**

Este projeto requer os seguintes scopes:

- `user-read-private`: Ler informações do perfil do usuário
- `user-read-email`: Ler email do usuário
- `user-follow-read`: Ler artistas seguidos pelo usuário
- `user-top-read`: Ler top artistas e músicas do usuário

---

## 📝 Estrutura de Arquivos

```
src/
├── services/
│   ├── oauthService.ts      # Serviço principal de OAuth
│   └── spotifyApi.ts        # Cliente HTTP para API do Spotify
├── configs/
│   └── userHttpClient/
│       └── userHttpClient.ts # Configuração do Axios com interceptors
└── pages/
    ├── Login/
    │   └── Login.tsx         # Página de login
    └── Callback/
        └── Callback.tsx      # Página de callback do OAuth
```

---

## 🔍 Como o projeto implementa

### **Serviço OAuth (`oauthService.ts`)**

O serviço centraliza toda a lógica de OAuth:

- **`initiateLogin()`**: Inicia o fluxo de login, gerando o `state` e redirecionando
- **`handleCallback()`**: Processa o callback do Spotify, valida o `state` e troca o código por token
- **`isAuthenticated()`**: Verifica se o usuário está autenticado
- **`getAccessToken()`**: Retorna o token de acesso atual
- **`refreshAccessToken()`**: Renova o token quando expirado
- **`logout()`**: Limpa os tokens e faz logout

### **Armazenamento de tokens**

Os tokens são armazenados no `localStorage`:
- `spotify_user_token`: Access token
- `spotify_refresh_token`: Refresh token
- `spotify_token_expiry`: Timestamp de expiração
- `spotify_token_scopes`: Scopes concedidos

### **Interceptores HTTP**

O `userHttpClient` configura interceptores do Axios para:
- Adicionar automaticamente o token nas requisições
- Renovar o token automaticamente quando expirado
- Tratar erros de autenticação

---

## ✅ Resumo: Componentes do OAuth

1. **`state`**: Previne ataques CSRF (string aleatória única por sessão)
2. **`code`**: Permissão temporária (válido por alguns minutos)
3. **`access_token`**: Acesso real à API (válido por ~1 hora)
4. **`refresh_token`**: Renova o `access_token` sem novo login (válido por muito tempo)

---

## 🎯 Boas Práticas Implementadas

✅ **Geração aleatória de `state`** para segurança  
✅ **Validação do `state`** no callback  
✅ **Armazenamento seguro** de tokens (localStorage)  
✅ **Renovação automática** de tokens  
✅ **Tratamento de erros** de autenticação  
✅ **Limpeza de tokens** no logout  

---

## 📚 Referências

- [Spotify Web API - Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

---

## ⚠️ Avisos Importantes

1. **Nunca exponha o `client_secret` no frontend** - Este projeto assume que você tem um backend para proteger o secret, ou está usando PKCE
2. **Use HTTPS em produção** - OAuth requer conexões seguras
3. **Valide sempre o `state`** - É crítico para segurança
4. **Gerencie tokens com cuidado** - Tokens expirados devem ser renovados ou o usuário deve fazer login novamente
5. **Respeite os scopes** - Solicite apenas as permissões necessárias

---