export type RedisMemberDetailFormat = "json" | "text";

export interface RedisMemberDetail {
  text: string;
  format: RedisMemberDetailFormat;
}

export function formatRedisMemberDetail(value: unknown): RedisMemberDetail {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) {
      try {
        return { text: JSON.stringify(JSON.parse(trimmed), null, 2), format: "json" };
      } catch {
        /* fall through to plain text */
      }
    }
    return { text: value, format: "text" };
  }

  try {
    return { text: JSON.stringify(value, null, 2), format: "json" };
  } catch {
    return { text: String(value), format: "text" };
  }
}
