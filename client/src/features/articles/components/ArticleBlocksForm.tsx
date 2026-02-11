// ================================
// Article Blocks Form (Create/Edit)
// ================================
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

export const ArticleBlocksForm = ({
  onChange,
}: {
  onChange: (blocks: ArticleBlock[]) => void;
}) => {
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);

  const addBlock = (block: ArticleBlock) => {
    const updated = [...blocks, block];
    setBlocks(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Article Content Blocks</h2>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() =>
            addBlock({
              id: crypto.randomUUID(),
              type: "title",
              text: "New Section Title",
            })
          }
        >
          + Title
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            addBlock({
              id: crypto.randomUUID(),
              type: "paragraph",
              text: "New paragraph text...",
            })
          }
        >
          + Text
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            addBlock({
              id: crypto.randomUUID(),
              type: "image",
              url: "/placeholder.svg",
            })
          }
        >
          + Image
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            addBlock({
              id: crypto.randomUUID(),
              type: "list",
              items: ["List item"],
            })
          }
        >
          + List
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            addBlock({
              id: crypto.randomUUID(),
              type: "note",
              text: "Important note",
            })
          }
        >
          + Note
        </Button>
      </div>

      {/* Raw preview (editable later) */}
      <pre className="bg-accent/30 p-4 rounded text-xs overflow-auto">
        {JSON.stringify(blocks, null, 2)}
      </pre>
    </div>
  );
};
