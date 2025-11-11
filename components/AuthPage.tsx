import React, { useState } from 'react';
import type { User } from '../types';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState(''); // Apenas para cadastro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let storedUsers: User[] = [];
    try {
        const usersData = localStorage.getItem('wellness-app-users');
        if (usersData) {
            storedUsers = JSON.parse(usersData);
        }
    } catch (error) {
        console.error("Erro ao carregar dados de usuários:", error);
        localStorage.removeItem('wellness-app-users');
        setError("Ocorreu um erro ao acessar os dados. Tente novamente.");
        return;
    }

    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        setError('Por favor, preencha o e-mail e a senha.');
        return;
      }
      const user = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user && user.password === password) { // ATENÇÃO: Verificação insegura, apenas para demo.
        onLoginSuccess(user);
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } else { // Sign Up
      if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        setError('Por favor, preencha todos os campos.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
      }
      const emailExists = storedUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        setError('Este e-mail já está cadastrado. Por favor, faça login.');
        return;
      }

      const newUser: User = { 
        id: Date.now().toString(), 
        username, 
        email, 
        password // ATENÇÃO: Armazenando senha em texto plano, apenas para demo.
      };
      const updatedUsers = [...storedUsers, newUser];
      localStorage.setItem('wellness-app-users', JSON.stringify(updatedUsers));
      onLoginSuccess(newUser);
    }
  };
  
  const PasswordInput: React.FC<{id: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string}> = ({ id, value, onChange, placeholder }) => (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-brand-primary"
        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
      >
        {showPassword ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-.858.11-1.687.316-2.481M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c1.274 0 2.502.213 3.654.61M21 12c-1.274 4.057-5.064 7-9.488 7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 3.98l16.04 16.04" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-primary mx-auto" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.25 14.5l-3.75-3.75 1.41-1.41L10.75 13.08l5.84-5.83 1.41 1.41L10.75 16.5z"/>
            </svg>
            <h1 className="text-3xl font-bold text-brand-dark mt-4">Bem-Estar Total</h1>
            <p className="text-gray-500">Sua jornada para uma vida mais saudável</p>
        </div>

        <h2 className="text-2xl font-bold text-center text-brand-dark mb-6">
          {isLogin ? 'Entrar' : 'Criar Conta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-gray-700 font-bold mb-1">
                Nome de Usuário
              </label>
              <input
                id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Como devemos te chamar?"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-gray-700 font-bold mb-1">
              E-mail
            </label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              placeholder="seuemail@exemplo.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-bold mb-1">
              Senha
            </label>
            <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
            />
          </div>
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-1">
                Confirmar Senha
              </label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:bg-brand-secondary transition-colors"
          >
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-brand-primary hover:underline"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
          </button>
        </div>
      </div>
    </div>
  );
};