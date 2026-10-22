import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useRef } from 'react';
import { App } from '../src/app/App';
import { LoginForm } from '../src/features/auth/components/LoginForm';
import { RegisterForm } from '../src/features/auth/components/RegisterForm';
import { ShareButton } from '../src/components/ShareButton';
import { FormField } from '../src/components/FormField';
import { TextAreaField } from '../src/components/TextAreaField';
import { usePageReader } from '../src/features/accessibility/usePageReader';

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/login');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Recursos compartilhados', () => {
  it('impede compartilhamentos simultâneos e permite tentar novamente após cancelar', async () => {
    let rejectShare!: (reason: Error) => void;
    const share = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((_resolve, reject) => {
            rejectShare = reject;
          }),
      )
      .mockResolvedValue(undefined);
    const writeText = vi.fn();
    vi.stubGlobal('navigator', { share, clipboard: { writeText } });
    render(<ShareButton />);
    const button = screen.getByRole('button', { name: 'Compartilhar aplicativo' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(share).toHaveBeenCalledTimes(1);
    expect(button.hasAttribute('disabled')).toBe(true);
    await act(async () => {
      rejectShare(Object.assign(new Error('Cancelado'), { name: 'AbortError' }));
    });
    expect(writeText).not.toHaveBeenCalled();
    expect(button.hasAttribute('disabled')).toBe(false);
    fireEvent.click(button);
    await waitFor(() => expect(share).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(button.hasAttribute('disabled')).toBe(false));
  });

  it('oferece cópia manual quando o compartilhamento e a área de transferência falham', async () => {
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(new Error('Indisponível')),
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Sem permissão')) },
    });
    render(<ShareButton text="Conheça a plataforma!" url="https://example.com" />);
    fireEvent.click(screen.getByRole('button', { name: 'Compartilhar aplicativo' }));
    const field = await screen.findByLabelText<HTMLTextAreaElement>(
      'Mensagem e link do aplicativo para copiar',
    );
    expect(field.value).toBe('Conheça a plataforma!\n\nhttps://example.com');
    expect(field.readOnly).toBe(true);
    expect(
      screen.getByRole('button', { name: 'Compartilhar aplicativo' }).hasAttribute('disabled'),
    ).toBe(false);
  });

  it('copia a mensagem configurada junto com o link', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText }, userAgent: navigator.userAgent });
    render(<ShareButton text="Venha conhecer o Reconecta!" url="https://example.com/login" />);
    fireEvent.click(screen.getByRole('button', { name: 'Compartilhar aplicativo' }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        'Venha conhecer o Reconecta!\n\nhttps://example.com/login',
      ),
    );
    expect(screen.getByRole('status').textContent).toContain('Mensagem e link copiados');
  });

  it('lê o conteúdo e ignora cabeçalho e valores digitados', () => {
    const spoken: string[] = [];
    class SpeechMock {
      text: string;
      onend?: () => void;
      constructor(text: string) {
        this.text = text;
      }
    }
    vi.stubGlobal('SpeechSynthesisUtterance', SpeechMock);
    vi.stubGlobal('speechSynthesis', {
      cancel: vi.fn(),
      speak: (utterance: SpeechMock) => {
        spoken.push(utterance.text);
        utterance.onend?.();
      },
    });
    function ReaderExample() {
      const ref = useRef<HTMLDivElement>(null);
      const { readPage } = usePageReader(ref);
      return (
        <div ref={ref}>
          <header data-read-skip>
            Texto do cabeçalho<button onClick={readPage}>Ouvir a página</button>
          </header>
          <main>
            <h1>Conteúdo principal</h1>
            <input aria-label="Sua senha" type="password" defaultValue="segredo" />
          </main>
        </div>
      );
    }
    render(<ReaderExample />);
    fireEvent.click(screen.getByRole('button', { name: 'Ouvir a página' }));
    const text = spoken.join(' ');
    expect(text).toContain('Conteúdo principal');
    expect(text).not.toContain('cabeçalho');
    expect(text).not.toContain('Ouvir a página');
    expect(text).not.toContain('segredo');
  });
});

function fillLogin() {
  fireEvent.change(screen.getByLabelText('CPF ou telefone'), { target: { value: '85999999999' } });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'minha senha' } });
}

function fillRegistration() {
  for (const [label, value] of [
    ['Nome completo', 'Maria da Silva'],
    ['Telefone com DDD', '85999999999'],
    ['CPF', '52998224725'],
    ['Data de nascimento', '1960-01-01'],
    ['Endereço', 'Rua das Flores, 10, Fortaleza, CE'],
    ['Crie uma senha', 'minha senha'],
  ])
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe('Preferência de fonte', () => {
  it('mantém a escolha entre login, cadastro e recarregamento', () => {
    const view = render(<App />);
    expect(document.documentElement.style.fontSize).toBe('130%');
    fireEvent.click(screen.getByRole('button', { name: 'Diminuir texto' }));
    fireEvent.click(screen.getByRole('link', { name: 'Cadastre-se gratuitamente' }));
    expect(screen.getByRole('heading', { name: 'Vamos criar sua conta?' })).toBeTruthy();
    expect(document.documentElement.style.fontSize).toBe('120%');
    fireEvent.click(screen.getByRole('link', { name: 'Entrar na minha conta' }));
    expect(document.documentElement.style.fontSize).toBe('120%');
    view.unmount();
    render(<App />);
    expect(document.documentElement.style.fontSize).toBe('120%');
  });

  it('usa 130% quando a preferência salva é inválida', () => {
    localStorage.setItem('reconecta.fontScale', '999');
    render(<App />);
    expect(document.documentElement.style.fontSize).toBe('130%');
  });

  it('navega pela logo sem substituir o documento', () => {
    window.history.replaceState({}, '', '/cadastro');
    render(<App />);
    const documentElement = document.documentElement;
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    fireEvent(screen.getByRole('link', { name: 'Reconecta 50+, início' }), click);
    expect(click.defaultPrevented).toBe(true);
    expect(window.location.pathname).toBe('/login');
    expect(document.documentElement).toBe(documentElement);
    expect(screen.getByRole('heading', { name: 'Vamos nos reconectar?' })).toBeTruthy();
  });
});

describe('Formulários reutilizáveis', () => {
  it('preserva a validação acessível externa e prioriza erros próprios dos campos', () => {
    const view = render(
      <>
        <FormField
          label="Contato"
          aria-invalid="grammar"
          aria-describedby="external-hint"
          hint="Use seu contato principal."
        />
        <TextAreaField label="Apresentação" aria-invalid="spelling" />
      </>,
    );
    expect(screen.getByLabelText('Contato').getAttribute('aria-invalid')).toBe('grammar');
    expect(screen.getByLabelText('Contato').getAttribute('aria-describedby')).toContain(
      'external-hint',
    );
    expect(screen.getByLabelText('Apresentação').getAttribute('aria-invalid')).toBe('spelling');
    view.rerender(
      <>
        <FormField label="Contato" aria-invalid={false} error="Contato inválido." />
        <TextAreaField label="Apresentação" aria-invalid={false} error="Revise a apresentação." />
      </>,
    );
    expect(screen.getByLabelText('Contato').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByLabelText('Apresentação').getAttribute('aria-invalid')).toBe('true');
  });

  it('desabilita também a exibição da senha quando o campo está desabilitado', () => {
    render(<FormField label="Senha" type="password" disabled defaultValue="segredo" />);
    const button = screen.getByRole('button', { name: 'Mostrar senha' });
    expect(button.hasAttribute('disabled')).toBe(true);
    fireEvent.click(button);
    expect(screen.getByLabelText('Senha').getAttribute('type')).toBe('password');
  });

  it('foca o campo inválido e permite mostrar a senha com o campo compartilhado', () => {
    render(<LoginForm onAuthenticate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar na minha conta' }));
    expect(document.activeElement).toBe(screen.getByLabelText('CPF ou telefone'));
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(screen.getByLabelText('Senha').getAttribute('type')).toBe('text');
  });

  it('mantém falha de autenticação separada da continuação após sucesso', async () => {
    const onAuthenticate = vi.fn().mockRejectedValue(new Error('Dados inválidos.'));
    const onSuccess = vi.fn();
    render(<LoginForm onAuthenticate={onAuthenticate} onSuccess={onSuccess} />);
    fillLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar na minha conta' }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('Dados inválidos.'),
    );
    expect(onSuccess).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Entrar na minha conta' }).hasAttribute('disabled'),
    ).toBe(false);
  });

  it('não apresenta erro de login quando a continuação falha depois de autenticar', async () => {
    render(
      <LoginForm
        onAuthenticate={vi.fn().mockResolvedValue(undefined)}
        onSuccess={vi.fn().mockRejectedValue(new Error('Falha na navegação'))}
      />,
    );
    fillLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar na minha conta' }));
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Seu acesso foi realizado'),
    );
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('button', { name: 'Acesso realizado' }).hasAttribute('disabled')).toBe(
      true,
    );
  });

  it('mantém a confirmação de cadastro quando o callback posterior falha', async () => {
    const onRegister = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <RegisterForm
          onRegister={onRegister}
          onSuccess={() => {
            throw new Error('Falha posterior');
          }}
        />
      </MemoryRouter>,
    );
    fillRegistration();
    fireEvent.click(screen.getByRole('button', { name: 'Criar minha conta' }));
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Sua conta foi criada'),
    );
    expect(screen.queryByRole('alert')).toBeNull();
    expect(onRegister).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('button', { name: 'Cadastro realizado' }).hasAttribute('disabled'),
    ).toBe(true);
  });

  it('gera IDs distintos em múltiplas instâncias do formulário', () => {
    render(
      <>
        <LoginForm onAuthenticate={vi.fn()} />
        <LoginForm onAuthenticate={vi.fn()} />
      </>,
    );
    const fields = screen.getAllByLabelText('CPF ou telefone');
    expect(fields[0].id).not.toBe(fields[1].id);
  });
});
