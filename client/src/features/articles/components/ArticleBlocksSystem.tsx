// ================================
// Article Blocks Types
// ================================
export type ArticleBlock =
  | { id: string; type: "title"; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "image"; url: string; caption?: string }
  | { id: string; type: "list"; items: string[] }
  | { id: string; type: "note"; text: string };

// ================================
// Article Renderer (View Page)
// ================================
export const ArticleBlocksRenderer = ({
  blocks,
}: {
  blocks: ArticleBlock[];
}) => {
  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        switch (block.type) {
          case "title":
            return (
              <h2 key={block.id} className="text-2xl font-bold">
                {block.text}
              </h2>
            );

          case "paragraph":
            return (
              <p key={block.id} className="leading-relaxed text-lg">
                {block.text}
              </p>
            );

          case "image":
            return (
              <figure key={block.id} className="space-y-2">
                <img
                  src={block.url}
                  className="rounded-lg w-full max-h-[400px] object-cover"
                />
                {block.caption && (
                  <figcaption className="text-sm text-muted-foreground">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case "list":
            return (
              <ul key={block.id} className="list-disc pl-6 space-y-2">
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );

          case "note":
            return (
              <div
                key={block.id}
                className="border-l-4 border-primary bg-primary/10 p-4 rounded"
              >
                <p className="font-medium">{block.text}</p>
              </div>
            );
        }
      })}
    </div>
  );
};
