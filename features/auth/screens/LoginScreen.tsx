
import React, { useState, useEffect } from 'react';
import { IconBookOpen, IconUser, IconLock, IconSparkles, IconRocket } from '@/ui/icons/IconSet';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${5 + Math.random() * 10}s`,
  }));

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-indigo-600">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 animate-gradient" />
      
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
            style={{ left: p.left, top: p.top, animationDelay: p.animationDelay, animationDuration: p.animationDuration }}
          />
        ))}
      </div>

      <div 
        className={`relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500 ${
          isAnimating ? 'translate-y-12 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl">
              <IconBookOpen className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Bíblia Sagrada
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Estude a Palavra com profundidade</p>

        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLoginSuccess(); }}>
          <div className="relative group">
            <input
              type="text"
              placeholder="Seu e-mail (digite qualquer coisa)"
              className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-transparent placeholder-gray-500 dark:placeholder-gray-400 focus:border-indigo-500 focus:outline-none transition-all"
            />
            <IconUser className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>

          <div className="relative group">
            <input
              type="password"
              placeholder="Sua senha (digite qualquer coisa)"
              className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-transparent placeholder-gray-500 dark:placeholder-gray-400 focus:border-indigo-500 focus:outline-none transition-all"
            />
            <IconLock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
          >
            Entrar
            <IconSparkles className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={onLoginSuccess}
            type="button"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <IconRocket className="w-5 h-5" />
            Entrar Direto (Demo)
          </button>
        </div>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-indigo-600 hover:underline">Esqueceu a senha?</a>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Não tem conta? <a href="#" className="text-indigo-600 font-semibold hover:underline">Criar conta</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
