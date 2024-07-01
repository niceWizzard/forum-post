import Link from "next/link";

export default function Footer() {
  return (
    <footer className="shadow-md border-t">
      <div className="container px-4 py-4 flex flex-col gap-4">
        <h4 className="text-lg font-semibold mb-4"> Forum Post</h4>
        <div className="flex gap-2 ">
          <ul className="flex flex-col">
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="#">Sitemap</Link>
            <Link href="#">Terms of Service</Link>
          </ul>
          <ul className="flex flex-col ">
            <Link href="#">Facebook</Link>
            <Link href="#">Twitter</Link>
            <Link href="#">Instagram</Link>
            <Link href="#">Reddit</Link>
          </ul>
        </div>
        <p className="text-center font-light">
          All rights unreserved. Designed & Developed by Code Rizzard @ 2024
        </p>
      </div>
    </footer>
  );
}
