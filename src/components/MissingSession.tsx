import Link from "next/link";

export function MissingSession() {
  return (
    <main className="page-shell">
      <section className="result-card">
        <p className="eyebrow">Result unavailable</p>
        <h1>We could not find your quiz result.</h1>
        <p>Retake the quiz so we can calculate your AI Digital Marketing Fit Score and salary estimate.</p>
        <Link className="primary-button primary-button--link" href="/survey">
          Retake Quiz
        </Link>
      </section>
    </main>
  );
}
