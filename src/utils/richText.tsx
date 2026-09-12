import type { ReactNode } from 'react';

const PATTERNS: { regex: RegExp; render: (text: string, i: number) => ReactNode }[] = [
  { regex: /\*_(.+?)_\*/g, render: (text, i) => <strong key={i}><em>{text}</em></strong> },
  { regex: /\*\*(.+?)\*\*/g, render: (text, i) => <strong key={i}>{text}</strong> },
  { regex: /__(.+?)__/g, render: (text, i) => <em key={i}>{text}</em> },
  { regex: /~~(.+?)~~/g, render: (text, i) => <u key={i}>{text}</u> },
];

const COMBINED = /(\*_.+?_\*|\*\*.+?\*\*|__.+?__|~~.+?~~)/;

export default function richText(str: string): ReactNode {
  if (!str || !COMBINED.test(str)) return str;

  const parts = str.split(COMBINED);
  return parts.map((part, i) => {
    for (const { regex, render } of PATTERNS) {
      regex.lastIndex = 0;
      const match = regex.exec(part);
      if (match && match[0] === part) return render(match[1], i);
    }
    return part;
  });
}
