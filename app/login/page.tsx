'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

interface LoginFormInputs {
  email: string;
  password: string;
}
const LoginPage = () => {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: LoginFormInputs) => {
        setIsLoading(true);
        setError(null);
        const result = await signIn('credentials', {
            redirect: false,
            email: data.email,
            password: data.password,
        });
        if (result?.error) {
            setError('Invalid email or password');
        } else {    
            router.push('/create-event');
        }
    }

    return (
    <main className="flex-center min-h-screen">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl font-semibold text-gradient">Iniciar Sesión</h1>
            <p className="text-light-200 text-lg">Accede a tu cuenta</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Error Alert */}
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                disabled={isLoading}
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email inválido',
                  },
                })}
              />
              {errors.email && <span className="error">{errors.email.message}</span>}
            </div>

            {/* Password Field */}
            <div className="form-field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'Mínimo 6 caracteres',
                  },
                })}
              />
              {errors.password && <span className="error">{errors.password.message}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-light-200">
              ¿No tienes cuenta?{' '}
              <a href="/register" className="text-primary hover:text-primary/80 font-semibold">
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;