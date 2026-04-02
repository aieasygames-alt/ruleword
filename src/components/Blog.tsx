import { blogPosts, getBlogPostBySlug, generateBlogSchema, type BlogPost } from '../data/blogPosts'
import { useState } from 'react'

type BlogListProps = {
  language: 'en' | 'zh'
  isDarkMode: boolean
  onSelectPost?: (slug: string) => void
}

type BlogPostProps = {
  slug: string
  language: 'en' | 'zh'
  isDarkMode: boolean
  onBack: () => void
}

/**
 * Blog list component showing all posts
 */
export function BlogList({ language, isDarkMode, onSelectPost }: BlogListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: language === 'zh' ? '全部' : 'All' },
    { id: 'guides', name: language === 'zh' ? '指南' : 'Guides' },
    { id: 'strategy', name: language === 'zh' ? '策略' : 'Strategy' },
    { id: 'science', name: language === 'zh' ? '科学' : 'Science' },
    { id: 'news', name: language === 'zh' ? '新闻' : 'News' }
  ]

  const filteredPosts = selectedCategory === 'all'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory)

  const bgClass = isDarkMode ? 'bg-slate-800' : 'bg-white'
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const subtleClass = isDarkMode ? 'text-slate-400' : 'text-gray-500'
  const borderClass = isDarkMode ? 'border-slate-700' : 'border-gray-200'

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-green-500 text-white'
                : isDarkMode
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Post Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredPosts.map(post => (
          <article
            key={post.id}
            onClick={() => onSelectPost?.(post.slug)}
            className={`p-5 rounded-xl border ${borderClass} ${bgClass} cursor-pointer hover:border-green-500 transition-colors`}
          >
            {/* Category Badge */}
            <span className="inline-block px-2 py-1 mb-2 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
              {post.category}
            </span>

            {/* Title */}
            <h2 className={`text-lg font-bold ${textClass} mb-2`}>
              {post.title[language]}
            </h2>

            {/* Excerpt */}
            <p className={`text-sm ${subtleClass} mb-3 line-clamp-2`}>
              {post.excerpt[language]}
            </p>

            {/* Meta */}
            <div className={`flex items-center gap-4 text-xs ${subtleClass}`}>
              <span>{post.publishDate}</span>
              <span>•</span>
              <span>{post.readTime} {language === 'zh' ? '分钟阅读' : 'min read'}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

/**
 * Blog post detail view
 */
export function BlogPost({ slug, language, isDarkMode, onBack }: BlogPostProps) {
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
          {language === 'zh' ? '文章未找到' : 'Post not found'}
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
        >
          {language === 'zh' ? '返回' : 'Go Back'}
        </button>
      </div>
    )
  }

  const textClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const subtleClass = isDarkMode ? 'text-slate-400' : 'text-gray-500'
  const proseClass = isDarkMode ? 'prose-invert' : 'prose-gray'

  // Inject blog schema
  const blogSchema = generateBlogSchema(post, language)
  if (typeof document !== 'undefined') {
    let schemaTag = document.getElementById('schema-blog') as HTMLScriptElement
    if (!schemaTag) {
      schemaTag = document.createElement('script')
      schemaTag.type = 'application/ld+json'
      schemaTag.id = 'schema-blog'
      document.head.appendChild(schemaTag)
    }
    schemaTag.textContent = JSON.stringify(blogSchema)
  }

  return (
    <article className="max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className={`flex items-center gap-2 mb-6 ${subtleClass} hover:${textClass} transition-colors`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {language === 'zh' ? '返回博客列表' : 'Back to Blog'}
      </button>

      {/* Header */}
      <header className="mb-8">
        <span className="inline-block px-3 py-1 mb-3 text-sm font-medium rounded-full bg-green-500/20 text-green-400">
          {post.category}
        </span>
        <h1 className={`text-3xl font-bold ${textClass} mb-4`}>
          {post.title[language]}
        </h1>
        <div className={`flex items-center gap-4 text-sm ${subtleClass}`}>
          <span>{post.author}</span>
          <span>•</span>
          <span>{post.publishDate}</span>
          <span>•</span>
          <span>{post.readTime} {language === 'zh' ? '分钟阅读' : 'min read'}</span>
        </div>
      </header>

      {/* Content */}
      <div
        className={`prose prose-lg max-w-none ${proseClass} ${
          isDarkMode
            ? 'prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-a:text-green-400'
            : 'prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-a:text-green-600'
        }`}
        dangerouslySetInnerHTML={{
          __html: post.content[language]
            .replace(/^# .+$/gm, match => `<h1>${match.slice(2)}</h1>`)
            .replace(/^## .+$/gm, match => `<h2>${match.slice(3)}</h2>`)
            .replace(/^### .+$/gm, match => `<h3>${match.slice(4)}</h3>`)
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>')
            .replace(/\n\n/g, '</p><p>')
        }}
      />

      {/* Tags */}
      <footer className="mt-8 pt-6 border-t border-gray-700">
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span
              key={tag}
              className={`px-3 py-1 text-sm rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}
            >
              #{tag}
            </span>
          ))}
        </div>
      </footer>
    </article>
  )
}

/**
 * Full Blog page with routing
 */
export default function Blog({ language, isDarkMode }: { language: 'en' | 'zh'; isDarkMode: boolean }) {
  const [selectedPost, setSelectedPost] = useState<string | null>(null)

  if (selectedPost) {
    return (
      <BlogPost
        slug={selectedPost}
        language={language}
        isDarkMode={isDarkMode}
        onBack={() => setSelectedPost(null)}
      />
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          {language === 'zh' ? '游戏博客' : 'Game Blog'}
        </h1>
        <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
          {language === 'zh'
            ? '策略指南、技巧和益智游戏新闻'
            : 'Strategy guides, tips, and puzzle game news'}
        </p>
      </div>

      <BlogList
        language={language}
        isDarkMode={isDarkMode}
        onSelectPost={setSelectedPost}
      />
    </div>
  )
}
