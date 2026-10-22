import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChangePasswordForm } from '../src/features/auth/components/ChangePasswordForm';

afterEach(cleanup);

it('envia somente as senhas necessárias à função recebida e limpa os campos após a resposta', async () => {
  const onChangePassword = vi.fn().mockRejectedValue(new Error('Serviço ainda indisponível.'));
  render(<ChangePasswordForm onChangePassword={onChangePassword} />);
  fireEvent.change(screen.getByLabelText('Senha atual'), { target: { value: 'senha antiga' } });
  fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: 'nova senha segura' } });
  fireEvent.change(screen.getByLabelText('Confirme a nova senha'), {
    target: { value: 'nova senha segura' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Alterar minha senha' }));
  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toBe('Serviço ainda indisponível.'),
  );
  expect(onChangePassword).toHaveBeenCalledExactlyOnceWith({
    currentPassword: 'senha antiga',
    newPassword: 'nova senha segura',
  });
  for (const label of ['Senha atual', 'Nova senha', 'Confirme a nova senha'])
    expect((screen.getByLabelText(label) as HTMLInputElement).value).toBe('');
});
