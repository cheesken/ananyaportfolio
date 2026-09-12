import { useRef, useState, useEffect, type ReactNode } from 'react';

interface ExpandCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  header: ReactNode;
  pills?: ReactNode;
  expandedContent?: ReactNode;
  headerAction?: ReactNode;
  colSpan?: number;
}

export default function ExpandCard({ isExpanded, onToggle, header, pills, expandedContent, headerAction, colSpan = 3 }: ExpandCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      // Double-raf to ensure col-span reflow has fully completed before measuring
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
          }
        });
      });
      setShouldShow(true);
    } else {
      setHeight(0);
      setShouldShow(false);
    }
  }, [isExpanded]);

  // Re-measure on resize (handles responsive breakpoint changes)
  useEffect(() => {
    if (!isExpanded) return;
    const handleResize = () => {
      if (contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const spanClass =
    colSpan === 3
      ? 'col-span-1 sm:col-span-2 lg:col-span-3'
      : colSpan === 2
        ? 'col-span-1 sm:col-span-2'
        : 'col-span-1';

  return (
    <div
      className={`
        rounded-lg cursor-pointer
        transition-all duration-300 ease-in-out
        ${isExpanded
          ? `${spanClass} bg-[#E5D8BB]`
          : 'col-span-1 bg-[#E5D8BB]/70 hover:bg-[#E5D8BB] hover:-translate-y-0.5 hover:shadow-md'
        }
      `}
      style={{ boxShadow: isExpanded ? '0 4px 20px rgba(0,0,0,0.08)' : undefined }}
      onClick={onToggle}
    >
      <div className="p-3 sm:p-4 md:p-5">
        {/* Header + expand indicator */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {header}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isExpanded && headerAction}
            <span
              className={`
                text-[#5B5340] text-sm mt-1
                transition-transform duration-300
                ${isExpanded ? 'rotate-45' : 'rotate-0'}
              `}
            >
              +
            </span>
          </div>
        </div>

        {/* Pills */}
        {pills}

        {/* Expandable content */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: shouldShow ? `${height}px` : '0px',
            opacity: shouldShow ? 1 : 0,
          }}
        >
          <div ref={contentRef} className="pb-3">
            {expandedContent}
          </div>
        </div>
      </div>
    </div>
  );
}
