export type Song = {
  id: string;
  season: number;
  nickname: string;
  title: string;
  youtube_url: string;
  comment: string;
  thumbnail_url?: string;
  votes?: number;
  created_at?: string;
};
