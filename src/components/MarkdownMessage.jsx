import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownMessage({ content = "" }) {
  return (
    <div className="mt-2 min-w-0 text-sm leading-7 text-slate-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-5 text-lg font-bold leading-7 text-slate-950 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2.5 mt-5 text-base font-bold leading-7 text-slate-950 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-sm font-bold leading-7 text-slate-900 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-2 whitespace-pre-wrap leading-7 first:mt-0 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1.5 pl-5 marker:text-indigo-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-indigo-500">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1 leading-7 text-slate-700">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-950">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 rounded-r-xl border-l-4 border-indigo-200 bg-indigo-50/65 px-4 py-2 text-slate-600">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-4 max-w-full overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full border-collapse text-left text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100 text-slate-700">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100 bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="divide-x divide-slate-100">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="whitespace-nowrap px-3 py-2.5 font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="min-w-[110px] px-3 py-2.5 align-top leading-6">
              {children}
            </td>
          ),
          code: ({ children, className }) => (
            <code
              className={`rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-indigo-700 ${className ?? ""}`}
            >
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="my-4 max-w-full overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-6 text-slate-100 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              className="font-medium text-indigo-600 underline decoration-indigo-200 underline-offset-4 transition hover:text-indigo-800"
              href={href}
              rel="noreferrer"
              target="_blank"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
