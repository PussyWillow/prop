export interface HistoricalEcho {
  id: number;
  type: string;
  era: string;
  author: string;
  text: string;
  context: string;
  location: string;
  theme: string;
  icon: string;
}

export interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  date: string;
  isHebrew: boolean;
  savedAt: string;
  echoes: HistoricalEcho[];
}

export interface GithubSyncConfig {
  username: string;
  repo: string;
  filePath: string;
  token: string;
}
