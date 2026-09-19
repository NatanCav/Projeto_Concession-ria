import { useEffect } from "react";

interface DocumentMeta {
  title: string;
  description?: string;
}

function setMetaTag(name: string, content: string, attribute: "name" | "property" = "name") {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

/**
 * Updates document title and meta description/OG tags client-side.
 * This is a CSR app (no server-side rendering in this stack), so it covers
 * the tab title/social-preview case but not crawler-visible SSR meta tags.
 */
export function useDocumentMeta({ title, description }: DocumentMeta) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    setMetaTag("og:title", title, "property");

    if (description) {
      setMetaTag("description", description);
      setMetaTag("og:description", description, "property");
    }

    return () => {
      document.title = previousTitle;
    };
  }, [title, description]);
}
