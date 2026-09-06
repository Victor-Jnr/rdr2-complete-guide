import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <main className="page">
      <h1>Page not in this journal</h1>
      <p>
        <Link to="/journey">Return to the Journey</Link>
      </p>
    </main>
  );
}
