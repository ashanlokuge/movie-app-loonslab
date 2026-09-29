import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import LoginPage, { validateLogin } from './LoginPage';
import { renderWithProviders } from '../test-utils';
import { DEMO_USER } from '../config/constants';

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<p>Home page</p>} />
    </Routes>,
    { route: '/login' },
  );
}

describe('validateLogin', () => {
  test('requires both fields and a minimum password length', () => {
    expect(validateLogin({ username: '', password: '' })).toEqual({
      username: expect.any(String),
      password: expect.any(String),
    });
    expect(validateLogin({ username: 'a', password: '123' }).password).toMatch(/at least 6/);
    expect(validateLogin({ username: 'a', password: '123456' })).toEqual({});
  });
});

describe('LoginPage', () => {
  test('shows field errors when submitted empty', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });

  test('rejects wrong credentials with a friendly message', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/username/i), 'demo');
    await user.type(screen.getByLabelText(/^password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid username or password/i)).toBeInTheDocument();
    expect(localStorage.getItem('movie-explorer:session')).toBeNull();
  });

  test('logs in with the demo account and redirects home without storing the password', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/username/i), DEMO_USER.username);
    await user.type(screen.getByLabelText(/^password/i), DEMO_USER.password);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Home page')).toBeInTheDocument();
    const session = localStorage.getItem('movie-explorer:session');
    expect(JSON.parse(session).username).toBe('demo');
    expect(session).not.toContain(DEMO_USER.password);
  });
});
