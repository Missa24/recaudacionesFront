import CircularProgress from '@mui/material/CircularProgress';

export default function LoadingScreen() {
  return (
    <main
      role="status"
      aria-label="Cargando"
      style={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
    </main>
  );
}
