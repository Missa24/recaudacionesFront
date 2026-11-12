import { Typography } from "@mui/material";
import { requireSession } from "../session";

export default async function Home() {
  await requireSession();
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Sistema Institucional
      </Typography>
      <Typography>Seleccione un módulo.</Typography>
    </>
  );
}