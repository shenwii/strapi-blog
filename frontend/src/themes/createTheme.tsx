import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Cpu,
  Folder,
  Info,
  Layers,
  Search,
  Sparkles,
  Tag as TagIcon,
  User,
} from 'lucide-react';
import { CommentSection } from '@/components/CommentSection';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { buildHref, formatDate } from '@/lib/i18n';
import { resolveMediaUrl } from '@/lib/strapi';
import { ThemedArticleCard } from './components/ThemedArticleCard';
import { ThemedFooter } from './components/ThemedFooter';
import { ThemedHeader } from './components/ThemedHeader';
import { ThemedToc } from './components/ThemedToc';
import type { ThemeSkin } from './skins';
import type {
  ArticleDetailViewProps,
  BlogTheme,
  PortalViewProps,
  SearchViewProps,
  SiteHomeViewProps,
  TaxonomyViewProps,
} from './types';

function ThemeBadgeIcon({ skin }: { skin: ThemeSkin }) {
  if (skin.variant === 'warm') return <Coffee className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
  if (skin.variant === 'anime') return <Sparkles className="h-3.5 w-3.5 text-pink-500" />;
  if (skin.variant === 'cyber') return <Cpu className="h-3.5 w-3.5 text-cyan-500" />;
  return <Sparkles className="h-3.5 w-3.5 text-sky-500" />;
}

export function createThemeFromSkin(skin: ThemeSkin): BlogTheme {
  function PortalView({
    locale,
    supportedLocales,
    dict,
    global,
    sites,
    recentArticles,
  }: PortalViewProps) {
    const portalTitle = global?.portalTitle || 'Multi-Site Blog';

    return (
      <div
        className={`flex min-h-screen flex-col ${skin.pageWrapperClass}`}
        style={{ '--site-accent': skin.defaultAccent } as React.CSSProperties}
      >
        <ThemedHeader
          skin={skin}
          locale={locale}
          supportedLocales={supportedLocales}
          dict={dict}
          allSites={sites}
          currentPathWithoutLocale="/"
          portalTitle={portalTitle}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
          <section className={`relative overflow-hidden p-8 sm:p-12 ${skin.portalHeroClass}`}>
            {skin.variant === 'cyber' && (
              <div className="mb-4 flex items-center gap-2 font-mono text-xs text-cyan-600 dark:text-cyan-400">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span>SYSTEM.ONLINE :: MULTI-SITE CMS MATRIX</span>
              </div>
            )}

            <div className="max-w-2xl">
              {skin.variant !== 'cyber' && (
                <div className={`mb-4 inline-flex items-center gap-2 px-3 py-1 text-xs font-medium ${skin.chipClass}`}>
                  <ThemeBadgeIcon skin={skin} />
                  <span>{skin.label}</span>
                </div>
              )}

              <h1
                className={`text-3xl font-extrabold sm:text-5xl ${skin.headingClass} ${
                  skin.titleGradientClass || ''
                }`}
              >
                {portalTitle}
              </h1>
              {global?.portalSubtitle && (
                <p className="mt-4 text-base leading-relaxed opacity-75 sm:text-lg">
                  {global.portalSubtitle}
                </p>
              )}
            </div>
          </section>

          <section className="mt-12">
            <div className="mb-6 flex items-center gap-2">
              <Layers className="h-5 w-5 text-[var(--site-accent)]" />
              <h2 className={`text-2xl font-bold ${skin.headingClass}`}>{dict.allSites}</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {sites.map((site) => {
                const accent = site.accentColor || skin.defaultAccent;
                const coverUrl = resolveMediaUrl(site.cover?.url);
                return (
                  <Link
                    key={site.documentId}
                    href={buildHref(locale, `/${site.slug}`)}
                    className={`group relative flex flex-col justify-between overflow-hidden p-7 transition ${skin.cardClass}`}
                  >
                    {coverUrl && (
                      <div className="mb-5 aspect-[16/8] overflow-hidden rounded-xl bg-slate-200/50 dark:bg-slate-800/50">
                        <img
                          src={coverUrl}
                          alt={site.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor: `${accent}18`,
                            color: accent,
                          }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: accent }}
                          />
                          {site.badge || `/${site.slug}`}
                        </span>
                        <span className="font-mono text-xs opacity-50">/{site.slug}</span>
                      </div>

                      <h3
                        className={`text-2xl font-bold transition group-hover:text-[var(--site-accent)] ${skin.headingClass}`}
                      >
                        {site.name}
                      </h3>
                      {site.tagline && (
                        <p className="mt-2 text-sm font-medium opacity-85">{site.tagline}</p>
                      )}
                      {site.description && (
                        <p className="mt-2 line-clamp-2 text-sm opacity-65">{site.description}</p>
                      )}
                    </div>

                    <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold">
                      <span>{dict.enterSite}</span>
                      <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {recentArticles.length > 0 && (
            <section className="mt-14">
              <h2 className={`mb-6 text-2xl font-bold ${skin.headingClass}`}>{dict.allPosts}</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recentArticles.map((article) => (
                  <ThemedArticleCard
                    key={`${article.documentId}-${article.locale || locale}`}
                    skin={skin}
                    article={article}
                    siteSlug={article.site?.slug || sites[0]?.slug || 'life'}
                    locale={locale}
                    dict={dict}
                  />
                ))}
              </div>
            </section>
          )}
        </main>

        <ThemedFooter skin={skin} locale={locale} dict={dict} global={global} allSites={sites} />
      </div>
    );
  }

  function SiteHomeView({
    locale,
    supportedLocales,
    dict,
    global,
    site,
    allSites,
    categories,
    articles,
    pagination,
  }: SiteHomeViewProps) {
    const accent = site.accentColor || skin.defaultAccent;
    const coverUrl = resolveMediaUrl(site.cover?.url);
    const hasFeatured = pagination.page === 1 && articles.length > 0 && Boolean(articles[0].featured);
    const featuredArticle = hasFeatured ? articles[0] : null;
    const listArticles = hasFeatured ? articles.slice(1) : articles;

    return (
      <div
        className={`flex min-h-screen flex-col ${skin.pageWrapperClass}`}
        style={{ '--site-accent': accent } as React.CSSProperties}
      >
        <ThemedHeader
          skin={skin}
          locale={locale}
          supportedLocales={supportedLocales}
          dict={dict}
          currentSite={site}
          allSites={allSites}
          currentPathWithoutLocale={`/${site.slug}`}
          portalTitle={global?.portalTitle || site.name}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <section className={`relative overflow-hidden p-8 sm:p-10 ${skin.heroClass}`}>
            {skin.variant === 'cyber' && (
              <div className="mb-4 flex items-center gap-2 font-mono text-xs text-cyan-600 dark:text-cyan-400">
                <span>$ cd /{site.slug}</span>
                <span className="opacity-50">|</span>
                <span>{pagination.total} entries</span>
              </div>
            )}

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: `${accent}18`, color: accent }}
                  >
                    <ThemeBadgeIcon skin={skin} />
                    {site.badge || `/${site.slug}`}
                  </span>
                  <span className="text-xs opacity-55">
                    {pagination.total} {dict.postsCount}
                  </span>
                </div>

                <h1
                  className={`text-3xl font-extrabold sm:text-4xl ${skin.headingClass} ${
                    skin.titleGradientClass || ''
                  }`}
                >
                  {site.name}
                </h1>
                {site.tagline && (
                  <p className="mt-3 text-base font-medium opacity-85">{site.tagline}</p>
                )}
                {site.description && (
                  <p className="mt-2 text-sm leading-relaxed opacity-65">{site.description}</p>
                )}
              </div>

              {coverUrl && (
                <div className="h-36 w-full shrink-0 overflow-hidden rounded-2xl bg-slate-200/50 md:w-64 dark:bg-slate-800/50">
                  <img src={coverUrl} alt={site.name} className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            {categories.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-200/60 pt-5 dark:border-slate-800/70">
                <span className="inline-flex items-center gap-1 text-xs font-medium opacity-55">
                  <Folder className="h-3.5 w-3.5" />
                  {dict.categories}:
                </span>
                <Link
                  href={buildHref(locale, `/${site.slug}`)}
                  className={`px-3 py-1 text-xs font-medium ${skin.chipActiveClass}`}
                >
                  {dict.allPosts}
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.documentId}
                    href={buildHref(locale, `/${site.slug}/categories/${cat.slug}`)}
                    className={`px-3 py-1 text-xs font-medium transition ${skin.chipClass}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {articles.length === 0 ? (
            <section className={`mt-12 border-dashed p-12 text-center ${skin.panelClass}`}>
              <BookOpen className="mx-auto h-10 w-10 opacity-45" />
              <h2 className={`mt-4 text-lg font-semibold ${skin.headingClass}`}>{dict.noArticles}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm opacity-65">{dict.noArticlesDesc}</p>
            </section>
          ) : (
            <div className="mt-10 space-y-8">
              {featuredArticle && (
                <ThemedArticleCard
                  skin={skin}
                  article={featuredArticle}
                  siteSlug={site.slug}
                  locale={locale}
                  dict={dict}
                  featuredLayout
                />
              )}

              {listArticles.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {listArticles.map((article) => (
                    <ThemedArticleCard
                      key={article.documentId}
                      skin={skin}
                      article={article}
                      siteSlug={site.slug}
                      locale={locale}
                      dict={dict}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {pagination.pageCount > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              {pagination.page > 1 && (
                <Link
                  href={buildHref(locale, `/${site.slug}?page=${pagination.page - 1}`)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition ${skin.secondaryButtonClass}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {dict.pagePrev}
                </Link>
              )}
              <span className="text-sm opacity-60">
                {pagination.page} / {pagination.pageCount}
              </span>
              {pagination.page < pagination.pageCount && (
                <Link
                  href={buildHref(locale, `/${site.slug}?page=${pagination.page + 1}`)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition ${skin.secondaryButtonClass}`}
                >
                  {dict.pageNext}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </main>

        <ThemedFooter skin={skin} locale={locale} dict={dict} global={global} allSites={allSites} />
      </div>
    );
  }

  function ArticleDetailView({
    locale,
    supportedLocales,
    dict,
    global,
    site,
    allSites,
    article,
    renderedContent,
    toc,
    readingTime,
    isFallbackLocale,
    commentsEnabled,
  }: ArticleDetailViewProps) {
    const accent = site.accentColor || skin.defaultAccent;
    const coverUrl = resolveMediaUrl(article.cover?.url);
    const date = formatDate(article.publishedDate || article.publishedAt || article.createdAt, locale);

    return (
      <div
        className={`flex min-h-screen flex-col ${skin.pageWrapperClass}`}
        style={{ '--site-accent': accent } as React.CSSProperties}
      >
        <ThemedHeader
          skin={skin}
          locale={locale}
          supportedLocales={supportedLocales}
          dict={dict}
          currentSite={site}
          allSites={allSites}
          currentPathWithoutLocale={`/${site.slug}/posts/${article.slug}`}
          portalTitle={global?.portalTitle || site.name}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <div className="mb-6">
            <Link
              href={buildHref(locale, `/${site.slug}`)}
              className="inline-flex items-center gap-1.5 text-sm font-medium opacity-65 transition hover:opacity-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>
                {dict.backToBlog} · {site.name}
              </span>
            </Link>
          </div>

          {isFallbackLocale && (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
              <Info className="h-4 w-4 shrink-0" />
              <span>{dict.fallbackNotice}</span>
            </div>
          )}

          <div className="grid gap-10 lg:grid-cols-12">
            <article className="min-w-0 lg:col-span-8">
              <header className="mb-8">
                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                  {article.category && (
                    <Link
                      href={buildHref(locale, `/${site.slug}/categories/${article.category.slug}`)}
                      className="rounded-full px-3 py-1 font-semibold"
                      style={{ backgroundColor: `${accent}18`, color: accent }}
                    >
                      {article.category.name}
                    </Link>
                  )}
                </div>

                <h1 className={`text-3xl font-extrabold sm:text-4xl ${skin.headingClass}`}>
                  {article.title}
                </h1>

                {article.summary && (
                  <p className="mt-4 text-lg leading-relaxed opacity-75">{article.summary}</p>
                )}

                <div
                  className={`mt-6 flex flex-wrap items-center gap-5 border-y border-slate-200/70 py-3.5 text-xs opacity-70 dark:border-slate-800 ${
                    skin.variant === 'cyber' ? 'font-mono' : ''
                  }`}
                >
                  {article.authorName && (
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <User className="h-3.5 w-3.5" />
                      {article.authorName}
                    </span>
                  )}
                  {date && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {date}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {readingTime} {dict.minRead}
                  </span>
                </div>
              </header>

              {coverUrl && (
                <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200/40 dark:border-slate-800 dark:bg-slate-900">
                  <img
                    src={coverUrl}
                    alt={article.cover?.alternativeText || article.title}
                    className="max-h-[460px] w-full object-cover"
                  />
                </div>
              )}

              <MarkdownRenderer content={renderedContent} />

              {article.tags && article.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-slate-200/70 pt-6 dark:border-slate-800">
                  <TagIcon className="h-4 w-4 opacity-50" />
                  {article.tags.map((tag) => (
                    <Link
                      key={tag.documentId}
                      href={buildHref(locale, `/${site.slug}/tags/${tag.slug}`)}
                      className={`px-3 py-1 text-xs font-medium transition ${skin.chipClass}`}
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {commentsEnabled && article.allowComments !== false && (
                <CommentSection
                  articleDocumentId={article.documentId}
                  locale={locale}
                  dict={dict}
                />
              )}
            </article>

            <div className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-24 space-y-6">
                <ThemedToc skin={skin} items={toc} title={dict.toc} />
              </div>
            </div>
          </div>
        </main>

        <ThemedFooter skin={skin} locale={locale} dict={dict} global={global} allSites={allSites} />
      </div>
    );
  }

  function TaxonomyView({
    locale,
    supportedLocales,
    dict,
    global,
    site,
    allSites,
    kind,
    taxonomyTitle,
    taxonomyDescription,
    articles,
    pagination,
  }: TaxonomyViewProps) {
    const accent = site.accentColor || skin.defaultAccent;

    return (
      <div
        className={`flex min-h-screen flex-col ${skin.pageWrapperClass}`}
        style={{ '--site-accent': accent } as React.CSSProperties}
      >
        <ThemedHeader
          skin={skin}
          locale={locale}
          supportedLocales={supportedLocales}
          dict={dict}
          currentSite={site}
          allSites={allSites}
          currentPathWithoutLocale={`/${site.slug}`}
          portalTitle={global?.portalTitle || site.name}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <Link
            href={buildHref(locale, `/${site.slug}`)}
            className="inline-flex items-center gap-1.5 text-sm font-medium opacity-65 transition hover:opacity-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{site.name}</span>
          </Link>

          <div className={`mt-6 p-7 ${skin.panelClass}`}>
            <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--site-accent)]">
              {kind === 'category' ? <Folder className="h-3.5 w-3.5" /> : <TagIcon className="h-3.5 w-3.5" />}
              <span>{kind === 'category' ? dict.categories : dict.tags}</span>
            </div>
            <h1 className={`text-3xl font-extrabold ${skin.headingClass}`}>{taxonomyTitle}</h1>
            {taxonomyDescription && <p className="mt-2 text-sm opacity-70">{taxonomyDescription}</p>}
            <p className="mt-2 text-xs opacity-55">
              {pagination.total} {dict.postsCount}
            </p>
          </div>

          {articles.length === 0 ? (
            <p className="mt-10 text-sm opacity-65">{dict.noArticles}</p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ThemedArticleCard
                  key={article.documentId}
                  skin={skin}
                  article={article}
                  siteSlug={site.slug}
                  locale={locale}
                  dict={dict}
                />
              ))}
            </div>
          )}
        </main>

        <ThemedFooter skin={skin} locale={locale} dict={dict} global={global} allSites={allSites} />
      </div>
    );
  }

  function SearchView({
    locale,
    supportedLocales,
    dict,
    global,
    site,
    allSites,
    query,
    articles,
    pagination,
  }: SearchViewProps) {
    const accent = site.accentColor || skin.defaultAccent;
    const searchAction = buildHref(locale, `/${site.slug}/search`);

    return (
      <div
        className={`flex min-h-screen flex-col ${skin.pageWrapperClass}`}
        style={{ '--site-accent': accent } as React.CSSProperties}
      >
        <ThemedHeader
          skin={skin}
          locale={locale}
          supportedLocales={supportedLocales}
          dict={dict}
          currentSite={site}
          allSites={allSites}
          currentPathWithoutLocale={`/${site.slug}/search`}
          portalTitle={global?.portalTitle || site.name}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
          <Link
            href={buildHref(locale, `/${site.slug}`)}
            className="inline-flex items-center gap-1.5 text-sm font-medium opacity-65 transition hover:opacity-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{site.name}</span>
          </Link>

          <form action={searchAction} method="GET" className="mt-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-45" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder={dict.searchPlaceholder}
                className={`w-full py-3 pl-11 pr-4 text-sm outline-none transition ${skin.inputClass}`}
              />
            </div>
            <button
              type="submit"
              className={`px-6 py-3 text-sm font-semibold transition ${skin.primaryButtonClass}`}
            >
              {dict.searchButton}
            </button>
          </form>

          {query && (
            <p className="mt-6 text-sm opacity-70">
              {dict.searchResultsFor}: <strong>{query}</strong> ({pagination.total})
            </p>
          )}

          {articles.length === 0 ? (
            <p className="mt-8 text-sm opacity-65">{dict.noArticles}</p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ThemedArticleCard
                  key={article.documentId}
                  skin={skin}
                  article={article}
                  siteSlug={site.slug}
                  locale={locale}
                  dict={dict}
                />
              ))}
            </div>
          )}
        </main>

        <ThemedFooter skin={skin} locale={locale} dict={dict} global={global} allSites={allSites} />
      </div>
    );
  }

  return {
    name: skin.name,
    PortalView,
    SiteHomeView,
    ArticleDetailView,
    TaxonomyView,
    SearchView,
  };
}
