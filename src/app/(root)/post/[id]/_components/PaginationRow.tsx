import { PostWithComments } from "@/server/db/schema/types";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Props {
  post: PostWithComments;
  pageNumber: number;
}

const toUrlPath = (
  pageNum: number,
  searchParams: ReadonlyURLSearchParams,
  path: string
): string => {
  const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
  currentParams.set("commentPage", String(pageNum));
  return `${path}?${currentParams.toString()}`;
};

export function PaginationRow({ post, pageNumber }: Props) {
  const totalCommentPages = Math.ceil(post.commentCount / 10);
  // const [prevPageHref, setPrevPageHref] = useState("");
  const path = usePathname();
  const searchParams = useSearchParams();

  const prevPageHref = useMemo(() => {
    return pageNumber == 1
      ? "#"
      : toUrlPath(pageNumber - 1, searchParams, path);
  }, [pageNumber, path, searchParams]);

  const nextPageHref = useMemo(() => {
    return pageNumber == totalCommentPages
      ? "#"
      : toUrlPath(pageNumber + 1, searchParams, path);
  }, [pageNumber, path, searchParams, totalCommentPages]);

  return (
    <Pagination className="mt-3">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={prevPageHref} />
        </PaginationItem>
        {...new Array(totalCommentPages).fill(1).map((v, i) => (
          <PaginationItem key={`page-${i}`}>
            <PaginationLink
              href={toUrlPath(i + 1, searchParams, path)}
              isActive={i + 1 == pageNumber}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href={nextPageHref} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
