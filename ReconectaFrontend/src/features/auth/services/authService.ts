export interface LoginCredentials {
    identifier: string;
    password: string;
}
/** O servidor deve criar uma sessão com cookie HttpOnly; não armazenamos senhas ou tokens. */
export async function login(credentials: LoginCredentials): Promise<void> {
    const endpoint = import.meta.env.VITE_AUTH_LOGIN_URL;
    if (!endpoint)
        throw new Error('Esta é uma demonstração. O acesso à conta estará disponível quando o serviço de autenticação for conectado.');
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
        signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
        if (response.status === 401)
            throw new Error('Não foi possível entrar. Confira seus dados e tente novamente.');
        if (response.status === 429)
            throw new Error('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
        throw new Error('O serviço está indisponível no momento. Tente novamente em instantes.');
    }
}
