import axios from 'axios';

interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

interface UserProfile {
    id: string;
    display_name: string;
    email: string;
    images: Array<{ url: string }>;
}

/**
 * Gera uma string aleatória para o parâmetro state
 */
function generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// Estado privado (usando closures)
let userToken: string | null = null;
let refreshToken: string | null = null;
let tokenExpiry: number = 0;
let tokenScopes: string = '';

// Configuração
const clientId = import.meta.env.VITE_CLIENT_ID || '';
const requiredScopes = [
    'user-read-private',
    'user-read-email',
    'user-follow-read',
    'user-top-read',
];

// Para desenvolvimento local, usa 127.0.0.1 ao invés de localhost
// porque o Spotify Dashboard não aceita http://localhost por segurança
const defaultRedirectUri = window.location.origin.includes('localhost')
    ? window.location.origin.replace('localhost', '127.0.0.1') + '/callback'
    : `${window.location.origin}/callback`;

const redirectUri = import.meta.env.VITE_REDIRECT_URI || defaultRedirectUri;

// Funções auxiliares privadas
function saveTokensToStorage(): void {
    if (userToken) {
        localStorage.setItem('spotify_user_token', userToken);
    }
    if (refreshToken) {
        localStorage.setItem('spotify_refresh_token', refreshToken);
    }
    localStorage.setItem('spotify_token_expiry', tokenExpiry.toString());
    localStorage.setItem('spotify_token_scopes', tokenScopes);
}

function loadTokensFromStorage(): void {
    userToken = localStorage.getItem('spotify_user_token');
    refreshToken = localStorage.getItem('spotify_refresh_token');
    tokenScopes = localStorage.getItem('spotify_token_scopes') || '';
    const expiry = localStorage.getItem('spotify_token_expiry');
    if (expiry) {
        tokenExpiry = parseInt(expiry, 10);
    }
}

function clearTokensFromStorage(): void {
    localStorage.removeItem('spotify_user_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expiry');
    localStorage.removeItem('spotify_token_scopes');
    sessionStorage.removeItem('spotify_oauth_state');
}

function hasRequiredScopes(scopes: string): boolean {
    const scopeList = scopes.split(' ');
    return requiredScopes.every(required => scopeList.includes(required));
}

function checkScopes(): boolean {
    if (!tokenScopes) {
        return false;
    }
    return hasRequiredScopes(tokenScopes);
}

/**
 * Valida o parâmetro state retornado pelo Spotify
 */
function validateState(state: string | null): boolean {
    // Lê o state salvo ANTES de qualquer outra operação
    const savedState = sessionStorage.getItem('spotify_oauth_state');

    // Caso especial: se não há state salvo E não foi recebido
    // Pode ser um refresh da página ou navegação direta
    if (!savedState && !state) {
        return false;
    }

    // Se há state recebido mas não há state salvo
    // Pode ser que já foi processado (React StrictMode executa duas vezes)
    if (state && !savedState) {
        // Verifica se já há token salvo (indica que já foi processado)
        const existingToken = localStorage.getItem('spotify_user_token');
        if (existingToken) {
            return true; // Permite continuar se já está autenticado
        }
        return false;
    }

    // Se há state salvo mas não foi recebido, pode ser problema
    if (savedState && !state) {
        // Remove o state inválido
        sessionStorage.removeItem('spotify_oauth_state');
        return false;
    }

    // Valida se correspondem
    const isValid = state !== null && savedState !== null && state === savedState;

    // Remove o state APENAS se a validação passou (só pode ser usado uma vez)
    if (isValid && savedState) {
        sessionStorage.removeItem('spotify_oauth_state');
    } else if (!isValid) {
        // Remove o state inválido para evitar confusão
        if (savedState) {
            sessionStorage.removeItem('spotify_oauth_state');
        }
    }

    return isValid;
}

/**
 * Renova o token de acesso usando o refresh token
 * Conforme documentação: https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens
 */
async function refreshAccessToken(): Promise<void> {
    if (!refreshToken) {
        throw new Error('Refresh token não disponível');
    }

    try {
        const response = await axios.post<TokenResponse>(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${clientId}:${import.meta.env.VITE_CLIENT_SECRET}`)}`,
                },
            }
        );

        userToken = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

        // Atualiza os scopes (podem mudar após refresh)
        if (response.data.scope) {
            tokenScopes = response.data.scope;
        }

        // O refresh token pode ser renovado também
        if (response.data.refresh_token) {
            refreshToken = response.data.refresh_token;
        }

        saveTokensToStorage();
    } catch (error: any) {
        console.error('Erro ao renovar token:', error);

        // Se o refresh token expirou ou é inválido, faz logout
        if (error.response?.status === 400) {
            logout();
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        throw error;
    }
}

// Funções públicas
/**
 * Gera a URL de autorização do Spotify
 * Conforme documentação: https://developer.spotify.com/documentation/web-api/tutorials/code-flow
 */
export function getAuthorizationUrl(state?: string): string {
    const scopes = requiredScopes.join(' ');
    const stateParam = state || generateRandomString(16);

    // Salva o state para validação no callback
    sessionStorage.setItem('spotify_oauth_state', stateParam);

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: scopes,
        state: stateParam,
        show_dialog: 'false',
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * Inicia o fluxo de login redirecionando para o Spotify
 * @param forceApproval - Se true, força o usuário a aprovar novamente mesmo se já aprovou antes
 */
export function login(forceApproval: boolean = false): void {
    const scopes = requiredScopes.join(' ');
    const stateParam = generateRandomString(16);

    // Salva o state para validação no callback
    sessionStorage.setItem('spotify_oauth_state', stateParam);

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: scopes,
        state: stateParam,
        show_dialog: forceApproval ? 'true' : 'false',
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * Processa o callback após autorização do usuário
 * Conforme documentação: https://developer.spotify.com/documentation/web-api/tutorials/code-flow
 */
export async function handleCallback(code: string, state: string | null): Promise<void> {
    // Valida o state para segurança
    const isValidState = validateState(state);

    if (!isValidState) {
        // Se não há state, pode ser um problema de navegação ou refresh
        // Mas ainda tentamos processar se houver código válido
        if (!state) {
            // Verifica se há state salvo que não foi recebido
            const savedState = sessionStorage.getItem('spotify_oauth_state');
            if (savedState) {
                // Se há state salvo mas não foi recebido, é suspeito
                sessionStorage.removeItem('spotify_oauth_state');
                throw new Error('State não recebido. Por segurança, faça login novamente.');
            }
            // Se não há state salvo nem recebido, pode ser refresh da página
            // Mas sem código também não podemos continuar
            if (!code) {
                throw new Error('Código de autorização não encontrado. Faça login novamente.');
            }
            // Se há código mas não há state, pode ser um caso edge
            // Por segurança, não permitimos
            throw new Error('State não encontrado. Por segurança, faça login novamente.');
        } else {
            // State recebido mas não corresponde
            throw new Error('State mismatch. Possível ataque CSRF. Tente novamente.');
        }
    }

    try {
        const response = await axios.post<TokenResponse>(
            'https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${clientId}:${import.meta.env.VITE_CLIENT_SECRET}`)}`,
                },
            }
        );

        // Verifica se os scopes necessários foram concedidos
        if (!hasRequiredScopes(response.data.scope)) {
            const missingScopes = requiredScopes.filter(
                scope => !response.data.scope.split(' ').includes(scope)
            );
            throw new Error(
                `Scopes insuficientes. Faltam: ${missingScopes.join(', ')}. ` +
                'Faça logout e login novamente para conceder todas as permissões necessárias.'
            );
        }

        userToken = response.data.access_token;
        refreshToken = response.data.refresh_token || null;
        tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
        tokenScopes = response.data.scope;

        saveTokensToStorage();
    } catch (error: any) {
        console.error('Erro ao processar callback:', error);

        if (error.response?.data?.error_description) {
            throw new Error(error.response.data.error_description);
        }

        if (error.message) {
            throw error;
        }

        throw new Error('Falha ao autenticar. Tente novamente.');
    }
}

/**
 * Obtém o token de acesso do usuário (com refresh automático)
 */
export async function getUserAccessToken(): Promise<string | null> {
    if (!userToken) {
        return null;
    }

    // Se o token está próximo de expirar, tenta renovar
    if (Date.now() >= tokenExpiry && refreshToken) {
        await refreshAccessToken();
    }

    return userToken;
}

/**
 * Verifica se o usuário está autenticado e tem os scopes necessários
 */
export function isAuthenticated(): boolean {
    const hasToken = !!userToken && Date.now() < tokenExpiry;
    if (!hasToken) {
        return false;
    }

    // Verifica se tem os scopes necessários
    return checkScopes();
}

/**
 * Faz logout do usuário
 */
export function logout(): void {
    userToken = null;
    refreshToken = null;
    tokenExpiry = 0;
    tokenScopes = '';
    clearTokensFromStorage();
}

/**
 * Obtém o perfil do usuário autenticado
 */
export async function getUserProfile(): Promise<UserProfile> {
    const token = await getUserAccessToken();
    if (!token) {
        throw new Error('Usuário não autenticado');
    }

    const response = await axios.get<UserProfile>('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    return response.data;
}

// Carrega tokens salvos na inicialização
loadTokensFromStorage();
