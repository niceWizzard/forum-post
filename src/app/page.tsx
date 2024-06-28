export default function Home() {
  const arr = new Array(10).fill(0);
  return (
    <div>
      {arr.map(() => (
        <div>Hell world</div>
      ))}
    </div>
  );
}
