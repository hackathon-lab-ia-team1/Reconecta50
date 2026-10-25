import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRegistration } from '../src/features/auth/utils/validateRegistration.ts';

const today = new Date(2026, 9, 20);
const valid = {
  fullName: 'Maria da Silva',
  phone: '(85) 99999-9999',
  birthDate: '1976-10-20',
  cpf: '529.982.247-25',
  address: 'Rua das Flores, 10, Centro, Fortaleza, CE',
  password: 'minha frase de acesso',
};

test('aceita quem completa exatamente 50 anos hoje', () => {
  assert.deepEqual(validateRegistration(valid, today), {});
});

test('aceita pessoas com menos de 50 anos, sem exigir idade mínima', () => {
  for (const birthDate of ['1976-10-21', '2000-01-15', '2010-03-20']) {
    assert.deepEqual(validateRegistration({ ...valid, birthDate }, today), {});
  }
});

test('rejeita datas impossíveis, ausentes e futuras', () => {
  for (const birthDate of ['1970-02-30', '', '2030-01-01']) {
    assert.ok(validateRegistration({ ...valid, birthDate }, today).birthDate);
  }
});

test('aceita data válida em ano bissexto', () => {
  assert.deepEqual(validateRegistration({ ...valid, birthDate: '1968-02-29' }, today), {});
});

test('valida nome, telefone, CPF, endereço e senha independentemente', () => {
  const errors = validateRegistration(
    { ...valid, fullName: 'Maria', phone: '123', cpf: '', address: ' ', password: 'curta' },
    today,
  );
  assert.ok(errors.fullName);
  assert.ok(errors.phone);
  assert.ok(errors.cpf);
  assert.ok(errors.address);
  assert.ok(errors.password);
});

test('aceita CPF sem pontuação e rejeita dígitos inválidos ou repetidos', () => {
  assert.deepEqual(validateRegistration({ ...valid, cpf: '52998224725' }, today), {});
  for (const cpf of ['11111111111', '52998224724', '5299822472', 'abc52998224725']) {
    assert.ok(validateRegistration({ ...valid, cpf }, today).cpf);
  }
});
