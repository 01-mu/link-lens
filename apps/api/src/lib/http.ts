export function jsonError(code: string, message: string) {
  return {
    ok: false as const,
    error: {
      code,
      message,
    },
  };
}
