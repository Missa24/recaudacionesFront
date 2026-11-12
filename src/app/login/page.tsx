'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CircularProgress from '@mui/material/CircularProgress';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import { useAuth } from '@/common/context/AuthContext';
import { useToast } from '@/common/components/ToastProvider';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      toast.warning('Completa los campos obligatorios');
      setError('Completa los campos obligatorios');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Inicio de sesión exitoso. Redirigiendo...');
      await new Promise((resolve) => window.setTimeout(resolve, 800));
      router.replace('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Credenciales inválidas';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel} aria-label="Información institucional">
        <div className={styles.brandContent}>
          <div className={styles.logo} aria-label="La Paz, Departamento Maravilloso">
            <Image
              className={styles.logoImage}
              src="/logo-gadlp.png"
              alt="Gobierno Autónomo Departamental de La Paz"
              width={675}
              height={291}
              priority
            />
          </div>

          <div className={styles.intro}>
            <span className={styles.eyebrow}><span /> PLATAFORMA INSTITUCIONAL</span>
            <h1>Gestión de Recaudaciones</h1>
            <p>Plataforma institucional para gestionar y consultar las recaudaciones del Gobierno Autónomo Departamental de La Paz.</p>
          </div>

          <ul className={styles.benefits}>
            <li><span className={styles.benefitIcon}><AccountBalanceRoundedIcon /></span><span>Gestión centralizada de recaudaciones.</span></li>
            <li><span className={`${styles.benefitIcon} ${styles.gold}`}><ReceiptLongRoundedIcon /></span><span>Seguimiento de cobros y pagos.</span></li>
            <li><span className={`${styles.benefitIcon} ${styles.blue}`}><GroupsRoundedIcon /></span><span>Información organizada según tu perfil.</span></li>
          </ul>
        </div>
        <div className={styles.brandFooter}><span>Gobierno Autónomo Departamental de La Paz</span><i /><i /></div>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardEyebrow}>ACCESO INSTITUCIONAL</span>
            <h2>Inicia sesión</h2>
            <p>Ingresa tus credenciales para acceder a la plataforma.</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label htmlFor="username">Usuario</label>
            <div className={`${styles.inputWrap} ${error && !username ? styles.inputError : ''}`}>
              <PersonOutlineRoundedIcon />
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Ingrese su nombre de usuario" autoComplete="username" />
            </div>
            {error && !username && <span className={styles.fieldError}>Este campo es requerido</span>}

            <label htmlFor="password">Contraseña</label>
            <div className={`${styles.inputWrap} ${error && !password ? styles.inputError : ''}`}>
              <LockOutlinedIcon />
              <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ingrese su contraseña" autoComplete="current-password" />
              <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showPassword ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
              </button>
            </div>
            {error && !password && <span className={styles.fieldError}>Este campo es requerido</span>}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? <><CircularProgress size={17} thickness={5} color="inherit" /> Ingresando...</> : <>Iniciar sesión <ArrowForwardRoundedIcon /></>}
            </button>
          </form>
          <p className={styles.helpText}>¿Necesitas ayuda? Contacta a la Unidad de Desarrollo Organizacional y Tecnologías de Información.</p>
        </div>
      </section>
    </main>
  );
}