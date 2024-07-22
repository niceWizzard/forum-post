import { getPostById } from "@/server/db/queries/post";
import { asSortOrder, asSortType } from "@/server/db/schema/types";
import PostComponent from "./_components/Post";
import { env } from "@/env/client.mjs";
import { Metadata, ResolvingMetadata } from "next";

interface Props {
  params: { id: string };
  searchParams: { commentPage?: string; sort?: string; order?: string };
}

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params: { id }, searchParams: { commentPage, sort, order } }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
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
    throw new Error(res.message);
  }

  const post = res.data;
  return {
    title: `Forum Post - ${post.title}`,
    description: post.body,
    creator: post.poster?.username ?? "deleted",
    publisher: "Forum Post",
    twitter: {
      description: post.body,
      title: `Forum Post - ${post.title}`,
      site: `${env.PUBLIC_BASE_URL}post/${id}`,
    },
  };
}

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
