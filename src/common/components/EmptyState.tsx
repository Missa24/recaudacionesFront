import InboxOutlined from "@mui/icons-material/InboxOutlined";
import type { ReactNode } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

interface Props {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  minHeight?: number | string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = <InboxOutlined color="primary" sx={{ fontSize: 56 }} />,
  minHeight = 320,
}: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{ minHeight, display: "grid", placeItems: "center", p: 4 }}
    >
      <Stack
        spacing={1.5}
        sx={{ alignItems: "center", maxWidth: 520, textAlign: "center" }}
      >
        <Box>{icon}</Box>
        <Typography component="h1" variant="h4">
          {title}
        </Typography>
        {description ? (
          <Typography color="text.secondary">{description}</Typography>
        ) : null}
        {actionLabel && onAction ? (
          <Button variant="contained" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
}
