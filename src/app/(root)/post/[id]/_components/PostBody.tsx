"use client";
import { useState } from "react";

interface Props {
  postBody: string;
}

export default function PostBody({ postBody }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldExpand = postBody.length > 512;
  return (
    <p className="px-4">
      {shouldExpand ? (
        <>
          {isExpanded ? postBody : `${postBody.slice(0, 200)}...`}
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="font-semibold mx-2 underline"
            >
              Show more
            </button>
          )}
        </>
      ) : (
        postBody
      )}
    </p>
  );
}
