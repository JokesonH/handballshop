import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-32 text-center">
      <p className="kicker text-nc-resin-deep">404</p>
      <h1 className="display-title mt-4 text-4xl text-nc-court">Off the court</h1>
      <p className="mt-4 text-nc-slate">
        That page does not exist. Try the catalogue.
      </p>
      <Link
        href="/en"
        className="kicker mt-8 bg-nc-court px-6 py-3 text-nc-paper transition-colors hover:bg-nc-court-soft"
      >
        Back to the shop
      </Link>
    </div>
  );
}
