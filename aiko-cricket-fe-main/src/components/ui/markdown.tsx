import { FC, memo, ComponentProps } from "react";
import { Streamdown } from "streamdown";

// Preserve the exported name `MemoizedReactMarkdown` for compatibility with
// existing callers. Streamdown is a drop-in replacement for react-markdown
// and supports the same props; use ComponentProps<typeof Streamdown> for
// accurate typing.
export const MemoizedReactMarkdown: FC<ComponentProps<typeof Streamdown>> =
  memo(
    Streamdown,
    (prevProps, nextProps) =>
      prevProps.children === nextProps.children &&
      prevProps.className === nextProps.className
  );
