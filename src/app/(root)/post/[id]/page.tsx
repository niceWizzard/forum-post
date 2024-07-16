import { getPostById } from "@/server/db/queries/post";
import { asSortOrder, asSortType } from "@/server/db/schema/types";
import PostComponent from "./_components/Post";

interface Props {
  params: { id: string };
  searchParams: { commentPage?: string; sort?: string; order?: string };
}

export const dynamic = "force-dynamic";

export default async function PostPage({
  params: { id },
  searchParams: { commentPage, sort, order },
}: Props) {
  const commentPageNumber = commentPage ? Number(commentPage) : 1;

  const sortBy = asSortType(sort);
  const sortOrder = asSortOrder(order);

  const res = await getPostById({
    id,
    commentPageNumber,
    sort: sortBy,
    sortOrder,
  });
  if (res.error) {
    return res.message;
  }

  const post = res.data;

  return <PostComponent initialValue={post} />;
}
