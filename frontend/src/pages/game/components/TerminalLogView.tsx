type Props = {
  log: string;
  loading: boolean;
  error: string | null;
};

export default function TerminalLogView({ log, loading, error }: Props) {
  if (loading) {
    <div className="p-4">로그 불러오는 중...</div>;
  }

  if (error) {
    <div className="p-4">{error}</div>;
  }

  return <div className="p-4">{log}</div>;
}
