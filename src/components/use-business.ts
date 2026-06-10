"use client";

import { useCallback, useEffect, useState } from "react";
import type { AssetDTO, BusinessFullDTO } from "@/lib/types";

export type GenKey =
  | "audit"
  | "strategy"
  | "calendar"
  | "pitch"
  | "competitors"
  | "proposal";

export function useBusiness(id: string) {
  const [business, setBusiness] = useState<BusinessFullDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<GenKey | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/businesses/${id}`, { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Le chargement a échoué. Veuillez réessayer.");
      }
      setBusiness((await res.json()) as BusinessFullDTO);
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Le chargement a échoué. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const generate = useCallback(
    async (type: GenKey): Promise<AssetDTO | null> => {
      setGenerating(type);
      try {
        const res = await fetch(`/api/businesses/${id}/generate/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.error ?? "La génération a échoué. Veuillez réessayer.",
          );
        }
        const asset = (await res.json()) as AssetDTO;
        await refresh();
        return asset;
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "La génération a échoué. Veuillez réessayer.",
        );
        return null;
      } finally {
        setGenerating(null);
      }
    },
    [id, refresh],
  );

  const patch = useCallback(
    async (fields: Record<string, unknown>): Promise<boolean> => {
      try {
        const res = await fetch(`/api/businesses/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        });
        if (!res.ok) throw new Error();
        await refresh();
        return true;
      } catch {
        setError("L'enregistrement a échoué. Veuillez réessayer.");
        return false;
      }
    },
    [id, refresh],
  );

  return { business, loading, error, generating, refresh, generate, patch };
}
