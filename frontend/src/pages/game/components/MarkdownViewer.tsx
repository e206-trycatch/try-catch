import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  code: string;
}

export default function MarkdownViewer({ code }: Props) {
  return (
    <div className="w-full h-full overflow-auto bg-[#1E1E1EB3] p-6 prose prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{code}</ReactMarkdown>
    </div>
  );
}
