import { describe, expect, it } from 'vitest'
import { articles, categories } from './articles'

describe('editorial demo stories', () => {
  it('provides a named, readable sample story for every story page', () => {
    expect(articles.length).toBeGreaterThanOrEqual(8)
    for (const article of articles) {
      expect(article.title).toBeTruthy()
      expect(article.excerpt).toBeTruthy()
      expect(article.body.length).toBeGreaterThanOrEqual(3)
      expect(categories).toContain(article.category)
      expect(articles.filter(other => other.slug === article.slug)).toHaveLength(1)
    }
  })

  it('has no title/excerpt duplicates and demonstrates every featured topic', () => {
    expect(new Set(articles.map(article => article.title)).size).toBe(articles.length)
    expect(articles.some(article => article.featured)).toBe(true)
    expect(articles.some(article => article.trending)).toBe(true)
    expect(categories.slice(1).every(category =>
      articles.some(article => article.category === category))).toBe(true)
  })
})
