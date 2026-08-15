"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  postBody: string;
}

export default function PostBody({ postBody }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldExpand = postBody.length > 512;

  return (
    <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
      {shouldExpand && !isExpanded ? (
        <>
          <p>{postBody.slice(0, 450)}...</p>
          <Button
            variant="link"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="p-0 h-auto text-xs mt-2 text-primary"
          >
            Show full post
          </Button>
        </>
      ) : (
        <p>{postBody}</p>
      )}
    </div>
  );
}
