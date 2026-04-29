import type { Song } from "@/types/song";

type CsvSongRow = {
  id?: string;
  season?: string;
  nickname?: string;
  title?: string;
  youtube_url?: string;
  comment?: string;
  thumbnail_url?: string;
  votes?: string;
  created_at?: string;
};

const DEFAULT_SEASON = 2;
const SEASON_2_CSV_PATH = "/data/season2.csv";

function parseCsv(text: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let isQuoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (isQuoted && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        isQuoted = !isQuoted;
      }
      continue;
    }

    if (char === "," && !isQuoted) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !isQuoted) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(currentValue);
      if (currentRow.some((value) => value.trim() !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  currentRow.push(currentValue);
  if (currentRow.some((value) => value.trim() !== "")) {
    rows.push(currentRow);
  }

  return rows;
}

function normalizeSong(row: CsvSongRow, rowIndex: number): Song | null {
  const youtubeUrl = row.youtube_url?.trim() ?? "";

  if (!youtubeUrl) {
    return null;
  }

  return {
    id: row.id?.trim() || `season-2-${rowIndex}`,
    season: Number(row.season || DEFAULT_SEASON) || DEFAULT_SEASON,
    nickname: row.nickname?.trim() || "익명",
    title: row.title?.trim() || "YouTube Video",
    youtube_url: youtubeUrl,
    comment: row.comment?.trim() || "",
    thumbnail_url: row.thumbnail_url?.trim() || undefined,
    votes: Number(row.votes || 0) || 0,
    created_at: row.created_at?.trim() || undefined,
  };
}

export async function loadCsvSongs(csvPath = SEASON_2_CSV_PATH): Promise<Song[]> {
  const response = await fetch(csvPath, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to load CSV: ${response.status}`);
  }

  const text = await response.text();
  const [headers, ...rows] = parseCsv(text);
  const normalizedHeaders = headers.map((header) => header.trim());

  return rows
    .map((row, rowIndex) => {
      const record = normalizedHeaders.reduce<CsvSongRow>((acc, header, index) => {
        acc[header as keyof CsvSongRow] = row[index] ?? "";
        return acc;
      }, {});

      return normalizeSong(record, rowIndex + 1);
    })
    .filter((song): song is Song => song !== null);
}
