import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center">
      <p className="code text-resin-deep">404</p>
      <h1 className="display-title mt-4 text-4xl text-ink">Off the court</h1>
      <p className="mt-4 text-ink-soft">
        That page does not exist. Try the catalogue.
      </p>
      <Link
        href="/en"
        className="code mt-8 bg-ink px-6 py-3 text-bone transition-colors hover:bg-ink-soft"
      >
        Back to the shop
      </Link>
    </div>
  );
}
