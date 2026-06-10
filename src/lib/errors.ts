import "server-only";
import { prisma } from "./prisma";

/** Journalise une erreur côté serveur (consultable dans l'espace admin). */
export async function logError(scope: string, error: unknown): Promise<void> {
  const message =
    error instanceof Error ? error.message : String(error ?? "inconnue");
  try {
    await prisma.errorLog.create({
      data: { scope: scope.slice(0, 80), message: message.slice(0, 1000) },
    });
  } catch {
    // la journalisation ne doit jamais faire échouer la requête
  }
  console.error(`[${scope}]`, message);
}
