import { createContext, useContext, useEffect, useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, BookmarkCheck, Check,
  ChevronDown, Clock3, Command, Copy, Instagram, Linkedin, Menu, Moon, Search,
  Send, Share2, Sun, TrendingUp, X,
} from 'lucide-react'
import { articles, categories, type Article } from './articles'

type NewsFeed = { stories: Article[]; live: boolean; error: string; loading: boolean }
const NewsContext = createContext<NewsFeed>({ stories: articles, live: false, error: '', loading: false })

function useNewsFeed() {
  const [feed, setFeed] = useState<NewsFeed>({ stories: articles, live: false, error: '', loading: true })
  useEffect(() => {
    let active = true
    fetch('/api/news?limit=12')
      .then(async response => {
        if (!response.ok) {
          const details = await response.json().catch(() => null) as { error?: string } | null
          throw new Error(details?.error ?? `Live coverage returned an HTTP ${response.status} response.`)
        }
        return response.json() as Promise<{ mode: string; articles: Article[]; message?: string }>
      })
      .then(data => {
        if (!active) return
        if (data.mode === 'live' && Array.isArray(data.articles) && data.articles.length) {
          setFeed({ stories: data.articles, live: true, error: '', loading: false })
        } else if (data.mode === 'live') {
          setFeed({ stories: articles, live: false, error: 'No verified live articles are available right now; showing the clearly labeled demo edition.', loading: false })
        } else {
          setFeed({ stories: articles, live: false, error: '', loading: false })
        }
      })
      .catch(error => {
        if (active) setFeed({
          stories: articles,
          live: false,
          error: `Live news could not be reached (${error instanceof Error ? error.message : 'unknown error'}); showing the clearly labeled demo edition.`,
          loading: false,
        })
      })
    return () => { active = false }
  }, [])
  return feed
}

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('signal-theme') ?? 'dark')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('signal-theme', theme)
  }, [theme])
  return { theme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') }
}

function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('signal-bookmarks') ?? '[]') as string[] }
    catch { return [] }
  })
  const toggle = (slug: string) => setBookmarks(current => {
    const next = current.includes(slug) ? current.filter(item => item !== slug) : [...current, slug]
    localStorage.setItem('signal-bookmarks', JSON.stringify(next))
    return next
  })
  return { bookmarks, toggle }
}

function ScrollReset() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }))
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [pathname, hash])
  return null
}

function SeoMetadata() {
  const location = useLocation()
  const { stories } = useContext(NewsContext)
  useEffect(() => {
    const story = location.pathname.startsWith('/article/')
      ? stories.find(article => article.slug === location.pathname.slice('/article/'.length))
      : undefined
    const title = story?.title ?? (
      location.pathname === '/' ? 'Intelligence, in context'
        : location.pathname === '/latest' ? 'The latest'
          : location.pathname === '/trending' ? 'Trending stories'
            : location.pathname === '/about' ? 'Our perspective'
              : location.pathname === '/contact' ? 'Get in touch'
                : location.pathname === '/search' ? 'Search stories'
                              : location.pathname === '/bookmarks' ? 'Your reading list'
                                : location.pathname.startsWith('/category/') ? decodeURIComponent(location.pathname.slice('/category/'.length))
                                  : location.pathname.split('/').filter(Boolean).pop()?.replaceAll('-', ' ') ?? 'Page not found'
    )
    const description = story?.excerpt ?? 'Signal is your independent field guide to artificial intelligence. Thoughtful coverage of what matters, and what comes next.'
    document.title = `${title} | Signal`
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${title} | Signal`)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
  }, [location.pathname, location.search, stories])
  return null
}

function App() {
  const { theme, toggleTheme } = useTheme()
  const { bookmarks, toggle } = useBookmarks()
  const news = useNewsFeed()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  useEffect(() => {
    setSearchOpen(false)
    setMenuOpen(false)
  }, [location.pathname, location.search])
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(value => !value)
      }
      if (event.key === 'Escape') { setSearchOpen(false); setMenuOpen(false) }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [])
  return (
    <>
      <ScrollReset />
      <NewsContext.Provider value={news}>
        <SeoMetadata />
        <Header
          theme={theme} toggleTheme={toggleTheme} bookmarks={bookmarks}
          searchOpen={() => setSearchOpen(true)}
          menuOpen={menuOpen} setMenuOpen={setMenuOpen}
        />
        <AnimatePresence>
          {searchOpen && <SearchOverlay key="search" close={() => setSearchOpen(false)} />}
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname + location.search}
            className="page-enter"
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Routes>
              <Route path="/" element={<Home bookmarks={bookmarks} toggle={toggle} />} />
              <Route path="/latest" element={<Listing title="The latest" eyebrow="Fresh from the signal desk" stories={news.stories} bookmarks={bookmarks} toggle={toggle} />} />
              <Route path="/trending" element={<Listing title="Worth your attention" eyebrow="The conversation, right now" stories={news.stories.filter(article => article.trending)} bookmarks={bookmarks} toggle={toggle} />} />
              <Route path="/category/:slug" element={<CategoryPage bookmarks={bookmarks} toggle={toggle} />} />
              <Route path="/article/:slug" element={<ArticlePage bookmarks={bookmarks} toggle={toggle} />} />
              <Route path="/search" element={<SearchResults bookmarks={bookmarks} toggle={toggle} />} />
              <Route path="/bookmarks" element={<BookmarksPage bookmarks={bookmarks} toggle={toggle} />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
      </NewsContext.Provider>
      <Footer />
    </>
  )
}

function Header({ theme, toggleTheme, bookmarks, searchOpen, menuOpen, setMenuOpen }: {
  theme: string; toggleTheme: () => void; bookmarks: string[]; searchOpen: () => void
  menuOpen: boolean; setMenuOpen: (value: boolean) => void
}) {
  return (
    <>
      <div className="announcement"><span className="live-dot" /> A MORE THOUGHTFUL TAKE ON AI <span className="announcement-separator">/</span> NO HYPE. JUST SIGNAL. <ArrowDown size={12} aria-hidden="true" /></div>
      <header className="site-header">
        <div className="header-inner">
          <Link className="wordmark" to="/" aria-label="Signal home">
            <span className="wordmark-icon"><span /><span /><span /></span>
            <span>signal<span className="wordmark-period">.</span></span>
          </Link>
          <button className="icon-button mobile-menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}><Menu size={19} /></button>
          <nav className={`primary-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
            <NavLink to="/latest">The latest</NavLink>
            <NavLink to="/trending">Trending</NavLink>
            <span className="nav-dropdown">
              <button className="nav-dropdown-trigger" aria-label="Browse categories">Explore <ChevronDown size={12} /></button>
              <span className="dropdown-panel">
                {categories.slice(1).map(category => <Link key={category} to={`/category/${encodeURIComponent(category)}`}>{category}</Link>)}
              </span>
            </span>
            <NavLink to="/about">Our perspective</NavLink>
          </nav>
          <div className="header-actions">
            <button className="search-shortcut" onClick={searchOpen} aria-label="Search (Ctrl+K)"><Search size={15} /><span>Search</span><kbd><Command size={10} /> K</kbd></button>
            <Link className="bookmark-action icon-button" to="/bookmarks" aria-label={`Saved stories, ${bookmarks.length} saved`}>
              <Bookmark size={17} />{bookmarks.length > 0 && <span className="bookmark-count">{bookmarks.length}</span>}
            </Link>
            <button className="icon-button theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a className="subscribe-cta" href="#newsletter">Stay in the loop <ArrowUpRight size={13} /></a>
          </div>
        </div>
      </header>
    </>
  )
}

function Kicker({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`eyebrow${light ? ' eyebrow-light' : ''}`}><span className="eyebrow-line" />{children}</span>
}

function Art({ article, featured = false }: { article: Article; featured?: boolean }) {
  return (
    <div className={`article-art ${article.gradient}${featured ? ' article-art-featured' : ''}`} role="img" aria-label={article.art}>
      <div className="art-orb art-orb-one" /><div className="art-orb art-orb-two" />
      <div className="art-grid" />
      <span className="art-caption">{article.art}</span>
      <span className="art-index">{String(articles.indexOf(article) + 1).padStart(2, '0')} / {String(articles.length).padStart(2, '0')}</span>
      {featured && <div className="art-title-overlay"><span>A SIGNAL ORIGINAL</span><p>Less noise.<br /><i>More knowing.</i></p></div>}
      <span className="art-sun" />
      <span className="art-orbit art-orbit-a" /><span className="art-orbit art-orbit-b" />
      <span className="art-pillar" />
      <span className="art-star">✳</span>
    </div>
  )
}

function BookmarkButton({ article, saved, toggle }: { article: Article; saved: boolean; toggle: (slug: string) => void }) {
  return (
    <button className={`bookmark-button${saved ? ' is-saved' : ''}`} onClick={() => toggle(article.slug)}
      aria-label={`${saved ? 'Remove' : 'Save'} “${article.title}”`} aria-pressed={saved}>
      {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
    </button>
  )
}

function StoryCard({ article, bookmarks, toggle, index = 0 }: {
  article: Article; bookmarks: string[]; toggle: (slug: string) => void; index?: number
}) {
  return (
    <motion.article className="story-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-45px' }} transition={{ delay: (index % 3) * 0.06, duration: 0.4 }}>
      <div className="story-image-wrap">
        <Link to={`/article/${article.slug}`} aria-label={article.title}><Art article={article} /></Link>
        <span className="story-category">{article.category}</span>
        <BookmarkButton article={article} saved={bookmarks.includes(article.slug)} toggle={toggle} />
      </div>
      <div className="story-details">
        <div className="story-meta"><span>{article.date}</span><span className="meta-dot" /><span>{article.readTime}</span></div>
        <Link to={`/article/${article.slug}`} className="story-title">{article.title}</Link>
        <p className="story-excerpt">{article.excerpt}</p>
        <Link className="story-author" to={`/article/${article.slug}`}><span className="author-initial">{article.author.charAt(0)}</span>{article.author}<ArrowUpRight size={12} /></Link>
      </div>
    </motion.article>
  )
}

function DataNote({ live }: { live?: boolean }) {
  return (
    <span className={`data-note${live ? ' data-note-live' : ''}`}>
      <span className="data-note-dot" />
      {live ? 'LATEST COVERAGE' : 'AI-GENERATED DEMO STORIES'}
    </span>
  )
}

function Home({ bookmarks, toggle }: { bookmarks: string[]; toggle: (slug: string) => void }) {
  const { stories } = useContext(NewsContext)
  const hero = stories[0] ?? articles[0]
  const lead = stories.slice(1, 4)
  return (
    <>
      <section className="hero-section page-shell">
        <div className="hero-intro">
          <Kicker>THE INDEPENDENT AI JOURNAL</Kicker>
          <h1>A clearer view<br />of <span>what’s next.</span></h1>
          <p>Stories about artificial intelligence, the people shaping it, and the world we’re building together.</p>
          <div className="hero-buttons">
            <Link className="button-primary" to="/latest">Discover the latest <ArrowRight size={15} /></Link>
            <Link className="button-text" to="/about">What we believe <ArrowUpRight size={14} /></Link>
          </div>
          <div className="hero-social-proof"><div className="reader-avatars"><span>M</span><span>A</span><span>J</span><span>+</span></div><span>Thoughtful reading for a changing world</span></div>
        </div>
        <div className="hero-feature-card">
          <Link to={`/article/${hero.slug}`} className="hero-art-link"><Art article={hero} featured /></Link>
          <div className="hero-feature-meta"><Kicker>{hero.category.toUpperCase()} <span className="meta-dot" /> {hero.readTime.toUpperCase()}</Kicker><span className="featured-label">01 <span>—</span> {hero.sourceName ? hero.sourceName.toUpperCase() : 'EDITOR’S NOTE'}</span></div>
          <Link to={`/article/${hero.slug}`} className="hero-feature-title">{hero.title}<ArrowUpRight className="feature-arrow" size={19} /></Link>
          <p className="hero-feature-excerpt">{hero.excerpt}</p>
          <div className="hero-feature-footer">
            <Link to={`/article/${hero.slug}`} className="read-link">Read the story <ArrowRight size={14} /></Link>
            <BookmarkButton article={hero} saved={bookmarks.includes(hero.slug)} toggle={toggle} />
          </div>
        </div>
        <span className="hero-ambient-glow" />
      </section>
      <div className="ticker"><div className="ticker-label"><span className="live-dot" /> ON OUR RADAR</div><div className="ticker-scroll"><span>THE HUMAN SIDE OF INNOVATION</span><i>✳</i><span>TECH WITH MORE INTENTION</span><i>✳</i><span>WHAT’S NEXT IN INTELLIGENCE</span><i>✳</i><span>THE HUMAN SIDE OF INNOVATION</span><i>✳</i><span>TECH WITH MORE INTENTION</span></div></div>
      <section className="stories-section page-shell" id="latest-stories">
        <div className="section-heading"><div><Kicker>FROM THE SIGNAL DESK</Kicker><h2>A little less noise.<br /><span>A lot more insight.</span></h2></div><Link className="all-stories-link" to="/latest">All stories <ArrowRight size={15} /></Link></div>
        <div className="story-grid">{lead.map((article, index) => <StoryCard key={article.slug} article={article} bookmarks={bookmarks} toggle={toggle} index={index} />)}</div>
      </section>
      <section className="manifesto-band">
        <div className="manifesto-inner page-shell">
          <div className="manifesto-symbol"><span /><span /><span /><span /><span /></div>
          <div><Kicker light>A DIFFERENT KIND OF TECH JOURNALISM</Kicker><p className="manifesto-statement">“The future deserves<br />more <i>than a headline.</i>”</p></div>
          <div className="manifesto-cta"><p>Independent perspective on technology worth understanding. Without the hype cycle.</p><Link to="/about" className="manifesto-link">Get to know us <ArrowUpRight size={14} /></Link></div>
        </div>
      </section>
      <section className="popular-section page-shell">
        <div className="section-heading compact-heading"><div><Kicker>THE CONVERSATION, RIGHT NOW</Kicker><h2>On everyone’s <span>mind.</span></h2></div><Link className="all-stories-link" to="/trending"><TrendingUp size={15} /> See what’s trending</Link></div>
        <div className="popular-list">
          {stories.filter(article => article.trending).slice(0, 3).map((article, index) =>
            <Link to={`/article/${article.slug}`} className="popular-row" key={article.slug}>
              <span className="popular-number">{String(index + 1).padStart(2, '0')}</span>
              <span className={`popular-thumb ${article.gradient}`}><span className="mini-orb" /></span>
              <span className="popular-info"><span className="popular-category">{article.category}</span><span className="popular-title">{article.title}</span></span>
              <span className="popular-time"><Clock3 size={13} />{article.readTime}</span><ArrowUpRight className="popular-arrow" size={17} />
            </Link>
          )}
        </div>
      </section>
      <Newsletter />
      <ApiTransparency />
    </>
  )
}

function ApiTransparency({ isLive }: { isLive?: boolean } = {}) {
  const { live, error, loading } = useContext(NewsContext)
  const usesLiveNews = isLive ?? live
  const message = loading && !isLive
    ? 'Checking the provider; displaying clearly labeled AI-generated demo stories for now.'
    : usesLiveNews ? 'Articles supplied by NewsAPI.org.' : error || 'An AI-generated editorial demo — not live news.'
  return <div className="api-disclosure page-shell"><DataNote live={usesLiveNews} />{loading && !isLive && <span className="provider-skeleton" role="status" aria-label="Checking live news"><i /><i /><i /></span>}<span>{message}</span><Link to="/about">Our editorial standards <ArrowRight size={12} /></Link></div>
}

function Listing({ title, eyebrow, stories, bookmarks, toggle }: {
  title: string; eyebrow: string; stories: Article[]; bookmarks: string[]; toggle: (slug: string) => void
}) {
  const { live } = useContext(NewsContext)
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(stories.length / 6))
  const current = stories.slice((page - 1) * 6, page * 6)
  return (
    <section className="listing-page page-shell">
      <PageHero eyebrow={eyebrow} title={title} description="Considered perspectives on artificial intelligence and the changes shaping our world." />
      <div className="listing-toolbar"><DataNote live={live} /><span>{stories.length} stories <span className="meta-dot" /> Latest first</span></div>
      {stories.length ? <>
        <div className="story-grid">{current.map((article, i) => <StoryCard key={article.slug} article={article} bookmarks={bookmarks} toggle={toggle} index={i} />)}</div>
        <Pagination page={page} pages={pages} onPage={setPage} />
      </> : <EmptyState title="Nothing to see here. Yet." description="Check back soon for a fresh perspective." />}
      <ApiTransparency />
    </section>
  )
}

function CategoryPage({ bookmarks, toggle }: { bookmarks: string[]; toggle: (slug: string) => void }) {
  const { slug = '' } = useParams()
  const { stories: feed } = useContext(NewsContext)
  const category = decodeURIComponent(slug)
  const stories = feed.filter(article => article.category.toLowerCase() === category.toLowerCase())
  return <Listing title={category} eyebrow="EXPLORE A PERSPECTIVE" stories={stories} bookmarks={bookmarks} toggle={toggle} />
}

function SearchResults({ bookmarks, toggle }: { bookmarks: string[]; toggle: (slug: string) => void }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { stories: feed } = useContext(NewsContext)
  const query = params.get('q')?.trim() ?? ''
  const results = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return []
    return feed.filter(article => words.some(word =>
      `${article.title} ${article.excerpt} ${article.category} ${article.author} ${article.body.join(' ')}`.toLowerCase().includes(word)))
  }, [feed, query])
  return (
    <section className="listing-page page-shell">
      <PageHero eyebrow="LOOK A LITTLE CLOSER" title={query ? <>Searching for <span className="serif-italic">“{query}”</span></> : 'Find your signal.'} description={query ? `${results.length} ${results.length === 1 ? 'perspective' : 'perspectives'} worth a closer look.` : 'Search stories, perspectives and ideas from the Signal desk.'} />
      <form className="large-search" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); const value = String(form.get('q') ?? '').trim(); navigate(value ? `/search?q=${encodeURIComponent(value)}` : '/search') }}>
        <Search size={19} /><input autoComplete="off" name="q" aria-label="Search stories" placeholder="Try “small models” or “people & society”" defaultValue={query} /><button aria-label="Search" type="submit"><ArrowRight size={18} /></button>
      </form>
      {results.length ? <div className="story-grid search-grid">{results.map((article, i) => <StoryCard key={article.slug} article={article} bookmarks={bookmarks} toggle={toggle} index={i} />)}</div> : query ? <EmptyState title="No stories on that wavelength." description="Try another phrase, category, or a broader search." /> : null}
      <div className="category-shortcuts"><span>Try a topic</span>{categories.slice(1, 5).map(category => <Link key={category} to={`/category/${encodeURIComponent(category)}`}>{category} <ArrowUpRight size={12} /></Link>)}</div>
    </section>
  )
}

function ArticlePage({ bookmarks, toggle }: { bookmarks: string[]; toggle: (slug: string) => void }) {
  const { slug = '' } = useParams()
  const { stories: feed } = useContext(NewsContext)
  const [copied, setCopied] = useState(false)
  const article = feed.find(item => item.slug === slug) ?? articles.find(item => item.slug === slug)
  if (!article) return <NotFound />
  const relatedStories = article.sourceUrl ? feed : articles
  const related = relatedStories.filter(item => item.slug !== article.slug && item.category === article.category).slice(0, 2)
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
    catch { window.prompt('Copy this story link:', window.location.href) }
  }
  return (
    <article className="article-page page-shell">
      <Link className="back-link" to="/latest"><ArrowLeft size={15} /> Back to the stories</Link>
      <div className="article-heading">
        <Kicker>{article.category.toUpperCase()} <span className="meta-dot" /> {article.sourceName ? 'ORIGINAL PUBLISHER' : 'A SIGNAL PERSPECTIVE'}</Kicker>
        <h1>{article.title}</h1>
        <p className="article-deck">{article.excerpt}</p>
        <div className="article-byline">
          <span className="author-initial">{article.author.charAt(0)}</span>
          <div><span>{article.author}</span><span>{article.date} <span className="meta-dot" /> {article.readTime}</span></div>
          <div className="article-actions">
            <button className="round-action" aria-label="Share this story" onClick={copyLink}><Share2 size={15} /></button>
            <button className="round-action" aria-label="Copy story link" onClick={copyLink}>{copied ? <Check size={15} /> : <Copy size={15} />}</button>
            <BookmarkButton article={article} saved={bookmarks.includes(article.slug)} toggle={toggle} />
          </div>
        </div>
      </div>
      <div className="article-hero-art"><Art article={article} featured /></div>
      <div className="article-content-grid">
        <aside className="article-toc"><span>{article.sourceUrl ? 'SOURCE SUMMARY' : 'IN THIS STORY'}</span><span className="toc-line" /><span>{article.body.length} {article.sourceUrl ? 'provided summaries' : 'thoughtful reads'}</span><DataNote live={Boolean(article.sourceUrl)} /></aside>
        <div className="article-body">
          {article.sourceUrl ? <>
            <p>{article.excerpt}</p>
            <div className="source-card"><span>CONTINUE WITH THE ORIGINAL REPORTING</span><p>Signal displays the headline and summary supplied by NewsAPI.org. We do not invent or expand on the source article.</p><a href={article.sourceUrl} target="_blank" rel="noreferrer">Read the original at {article.sourceName ?? 'the publisher'} <ArrowUpRight size={14} /></a></div>
          </> : <>
            <p className="article-dropcap">{article.body[0]}</p>
            {article.body.slice(1).map((paragraph, index) =>
              <p key={paragraph}>{index === 1 && <span className="inline-pullquote">“A useful technology is one that gives people a little more room to do their best thinking.”</span>}{paragraph}</p>
            )}
          </>}
          <div className="article-endmark">✳</div>
          <div className="article-share-end"><span>Enjoyed the perspective?</span><button onClick={copyLink}><Share2 size={14} /> {copied ? 'Link copied' : 'Share this story'}</button><BookmarkButton article={article} saved={bookmarks.includes(article.slug)} toggle={toggle} /></div>
        </div>
      </div>
      {related.length > 0 && <div className="related-stories"><div className="related-heading"><Kicker>CONTINUE EXPLORING</Kicker><h2>Stay a little <span>curious.</span></h2></div><div className="story-grid">{related.map((item, i) => <StoryCard key={item.slug} article={item} bookmarks={bookmarks} toggle={toggle} index={i} />)}</div></div>}
      <ApiTransparency isLive={Boolean(article.sourceUrl)} />
    </article>
  )
}

function BookmarksPage({ bookmarks, toggle }: { bookmarks: string[]; toggle: (slug: string) => void }) {
  const { stories } = useContext(NewsContext)
  const available = new Map([...articles, ...stories].map(article => [article.slug, article]))
  const saved = bookmarks.flatMap(slug => {
    const article = available.get(slug)
    return article ? [article] : []
  })
  return <Listing title="Your reading list" eyebrow="A LITTLE MORE SIGNAL, SAVED" stories={saved} bookmarks={bookmarks} toggle={toggle} />
}

function PageHero({ eyebrow, title, description }: { eyebrow: string; title: React.ReactNode; description: string }) {
  return <div className="page-hero"><Kicker>{eyebrow}</Kicker><h1>{title}</h1><p>{description}</p></div>
}

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  return <div className="pagination"><button disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ArrowLeft size={15} /></button>
    {Array.from({ length: pages }, (_, index) => index + 1).map(number => <button key={number} className={page === number ? 'active-page' : ''} onClick={() => onPage(number)}>{number}</button>)}
    <button disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ArrowRight size={15} /></button><span>PAGE {String(page).padStart(2, '0')} OF {String(pages).padStart(2, '0')}</span>
  </div>
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><span className="empty-icon"><Search size={23} /></span><h2>{title}</h2><p>{description}</p><Link className="button-primary" to="/latest">Explore the latest <ArrowRight size={14} /></Link></div>
}

function About() {
  return (
    <div className="page-shell about-page">
      <PageHero eyebrow="A PUBLICATION WITH A POINT OF VIEW" title={<>Not louder.<br /><span>Just a little clearer.</span></>} description="Technology changes quickly. Understanding it takes a little more care." />
      <div className="about-layout"><div className="about-art"><div className="about-art-ring" /><div className="about-art-copy">The world<br />is changing.<br /><i>Let’s think.</i></div><span className="about-art-caption">A NOTE FROM THE SIGNAL DESK · EST. 2026</span></div>
        <div className="about-copy"><Kicker>WHAT WE’RE HERE FOR</Kicker><h2>Clarity is a kind<br />of optimism.</h2><p>Signal is an independent editorial project exploring artificial intelligence and the people, places and possibilities around it.</p><p>We believe the best technology journalism can be curious without being credulous, optimistic without waving away the hard parts, and useful without pretending to have every answer.</p><h3>How we approach the work</h3><ul><li>We explain what the technology can do — and what it can’t.</li><li>We remember that the people affected by innovation come first.</li><li>We would rather get the story right than get there first.</li><li>We label demonstrations and live reporting honestly.</li></ul><div className="about-notice"><DataNote /><p>Stories on this site are AI-generated editorial examples, not verified journalism. They are designed to demonstrate the publication. Enable NewsAPI to display real, attributed news coverage.</p></div></div>
      </div><ApiTransparency />
    </div>
  )
}

function Contact() {
  const [sent, setSent] = useState(false)
  return <div className="page-shell contact-page"><PageHero eyebrow="GOOD QUESTIONS MAKE GOOD STORIES" title={<>We’re all<br /><span>ears.</span></>} description="A story tip, a thoughtful disagreement, or simply a note: we’d genuinely like to hear from you." />
    <div className="contact-layout"><div className="contact-sidebar"><Kicker>FIND YOUR WAY</Kicker><span className="contact-topic">Editorial inquiries <ArrowUpRight size={14} /></span><span className="contact-topic">Story tips & perspectives <ArrowUpRight size={14} /></span><span className="contact-topic">Press & media <ArrowUpRight size={14} /></span><span>Share your note using the form. This demo does not send messages.</span></div>
      <form className="contact-form" onSubmit={event => { event.preventDefault(); setSent(true) }}><h2>{sent ? 'Thanks for the note.' : 'Send a little signal.'}</h2>{sent ? <p className="form-success"><Check size={16} /> Demo only: your note wasn’t sent or stored.</p> : <>
        <label>Your name<input autoComplete="name" required placeholder="What should we call you?" /></label><label>Email address<input autoComplete="email" required type="email" placeholder="you@example.com" /></label><label>What’s on your mind?<textarea required rows={5} placeholder="A question, a story lead, a point of view..." /></label><button className="button-primary" type="submit">Send your note <Send size={14} /></button><span className="form-note">This demo form doesn’t send or store personal data.</span></>}</form>
    </div><ApiTransparency />
  </div>
}

function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState('')
  const subscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) { setError('Enter a valid email address to continue.'); return }
    try {
      const subscriptions = JSON.parse(localStorage.getItem('signal-subscriptions') ?? '[]') as string[]
      localStorage.setItem('signal-subscriptions', JSON.stringify([...new Set([...subscriptions, normalizedEmail])]))
      setSubscribed(true); setError('')
    } catch { setError('Your browser couldn’t save that just now. Please try again.') }
  }
  return <section className="newsletter-band" id="newsletter"><div className="newsletter-inner page-shell"><div className="newsletter-copy"><Kicker light>A LETTER WORTH OPENING</Kicker><h2>Good thinking,<br /><i>delivered thoughtfully.</i></h2><p>A considered look at what’s next, every other Sunday. No noise. Unsubscribe when you like.</p><span className="newsletter-proof"><span className="live-dot" /> NO SPAM. JUST SIGNAL.</span></div>
      <form className="newsletter-form" onSubmit={subscribe}><label htmlFor="newsletter-email">YOUR EMAIL ADDRESS</label><div className="newsletter-input-wrap"><input id="newsletter-email" type="email" autoComplete="email" required placeholder="you@somewhere.com" value={email} onChange={event => setEmail(event.target.value)} disabled={subscribed} /><button type="submit" aria-label={subscribed ? 'Demo saved' : 'Preview this subscription'} disabled={subscribed}>{subscribed ? <Check size={18} /> : <ArrowRight size={17} />}</button></div>
        {error ? <span className="newsletter-message newsletter-error">{error}</span> : subscribed ? <span className="newsletter-message"><Check size={13} /> Demo saved in this browser — no email was sent.</span> : <span className="newsletter-fine-print">This demo saves your address only in this browser. No email is sent.</span>}</form>
      </div></section>
}

function SearchOverlay({ close }: { close: () => void }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { stories: feed } = useContext(NewsContext)
  const input = useMemo(() => ({ current: null as HTMLInputElement | null }), [])
  useEffect(() => { input.current?.focus() }, [input])
  const results = query.trim() ? feed.filter(article => `${article.title} ${article.excerpt} ${article.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 4) : feed.slice(0, 3)
  return <motion.div className="search-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.currentTarget === event.target) close() }}>
    <motion.div className="search-dialog" role="dialog" aria-modal="true" aria-label="Search stories" initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.17 }}>
      <form onSubmit={event => { event.preventDefault(); if (query.trim()) { close(); navigate(`/search?q=${encodeURIComponent(query.trim())}`) } }} className="overlay-search-form"><Search size={19} /><input ref={element => { input.current = element }} autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} placeholder="What are you curious about?" aria-label="Search the publication" /><button type="button" className="icon-button" aria-label="Close search" onClick={close}><X size={17} /></button></form>
      <div className="search-dialog-label">{query ? 'MATCHING PERSPECTIVES' : 'A FEW PLACES TO START'}<kbd>ESC TO CLOSE</kbd></div>
      <div className="quick-results">{results.length ? results.map(article => <button key={article.slug} onClick={() => { close(); navigate(`/article/${article.slug}`) }}><span className="quick-result-thumb"><span className={`mini-orb ${article.gradient}`} /></span><span className="quick-result-text"><span>{article.category}</span><strong>{article.title}</strong></span><ArrowUpRight size={15} /></button>) : <div className="quick-empty">No stories on that wavelength. Try another phrase.</div>}</div>
      <div className="search-hint"><span><kbd>↵</kbd> Search all stories</span><span><kbd>ESC</kbd> to close</span></div>
    </motion.div>
  </motion.div>
}

function NotFound() {
  return <div className="not-found page-shell"><Kicker>A MOMENT OUT OF FOCUS</Kicker><h1>That signal<br /><span>has faded.</span></h1><p>We couldn’t find that page. It may have moved — or there might not have been one at all.</p><Link className="button-primary" to="/">Back to the beginning <ArrowRight size={14} /></Link></div>
}

function Footer() {
  return <footer className="site-footer"><div className="footer-inner page-shell"><div className="footer-top"><div className="footer-brand"><Link className="wordmark" to="/"><span className="wordmark-icon"><span /><span /><span /></span><span>signal<span className="wordmark-period">.</span></span></Link><p>For the ideas shaping<br />what comes next.</p><span className="footer-motto">INDEPENDENT. INTENTIONAL. IN CONTEXT.</span></div>
      <div className="footer-column"><span>THE JOURNAL</span><Link to="/latest">Latest thinking</Link><Link to="/trending">Worth your attention</Link><Link to="/category/AI%20research">AI research</Link><Link to="/category/Explainers">Understand AI</Link></div>
      <div className="footer-column"><span>THE PEOPLE</span><Link to="/about">Our perspective</Link><Link to="/contact">Get in touch</Link><Link to="/bookmarks">Your reading list</Link></div>
      <div className="footer-social"><span>OUT THERE, THOUGHTFULLY.</span><div><a href="https://www.linkedin.com/" aria-label="LinkedIn" target="_blank" rel="noreferrer"><Linkedin size={15} /></a><a href="https://www.instagram.com/" aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={15} /></a></div><Link className="footer-newsletter-link" to="/#newsletter">Explore our letter preview <ArrowUpRight size={12} /></Link></div>
    </div>    <div className="footer-bottom"><span>© 2026 SIGNAL JOURNAL. MADE FOR THE CURIOUS.</span><span>THOUGHTFULLY EDITED, ALWAYS.</span><Link to="/about">EDITORIAL STANDARDS</Link></div></div></footer>
}

export default App
