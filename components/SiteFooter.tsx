import Link from "next/link";
import { nav, primaryAction, secondaryAction, site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <p className="wordmark wordmark--footer">
            <span className="wordmark__mark" aria-hidden="true" />
            <span className="wordmark__name">Formwork</span>
            <span className="wordmark__sub">Construction</span>
          </p>
          <p>New homes, extensions and renovations in {site.city}. A portfolio demo.</p>
        </div>
        <nav aria-label="Footer">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link href={secondaryAction.href}>Courtyard House</Link>
            </li>
            <li>
              <Link href={primaryAction.href}>{primaryAction.label}</Link>
            </li>
          </ul>
        </nav>
        <div className="site-footer__notice" role="note">
          <p className="eyebrow eyebrow--light">Fictional portfolio demo</p>
          <p>{site.demoNotice}</p>
          <p>All images are original concept illustrations and drawings of a fictional house. See ASSETS.md in the repository for their provenance.</p>
        </div>
      </div>
    </footer>
  );
}
