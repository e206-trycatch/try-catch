type Props = {
  log: string | null;
};

export default function TerminalLogView({ log }: Props) {
  return (
    <div className="flex-1 overflow-auto whitespace-pre-wrap p-4 text-base/7">
      {log ? log : 'No problems found'}
    </div>
  );
}
