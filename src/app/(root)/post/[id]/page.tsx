interface Props {
  params: { id: string };
}

export default function PostPage({ params: { id } }: Props) {
  return (
    <section>
      <div className="container">
        <h2>{id}</h2>
      </div>
    </section>
  );
}
