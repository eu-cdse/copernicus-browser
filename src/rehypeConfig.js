import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeExternalLinks from 'rehype-external-links';

// setting React Markdown plugins:
// https://github.com/remarkjs/react-markdown?tab=readme-ov-file#use-remark-and-rehype-plugins-math

// allow `className` on all HTML elements that are provided to React Markdown:
// https://github.com/syntax-tree/hast-util-sanitize?tab=readme-ov-file#schema

// setting schema for rehype-sanitize used to sanitize HTML elements for React Markdown:
// https://github.com/rehypejs/rehype-sanitize?tab=readme-ov-file#example-math

export const REACT_MARKDOWN_REHYPE_PLUGINS = [
  rehypeRaw,
  [rehypeSanitize, { ...defaultSchema, attributes: { ...defaultSchema?.attributes, '*': ['className'] } }],
  [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
];
