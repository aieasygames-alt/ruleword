import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'default',
  title: 'RuleWord CMS',
  projectId: '0dvqdd4m',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .id('root')
          .title('RuleWord 内容管理')
          .items([
            // ========== 游戏管理 ==========
            S.listItem()
              .title('🎮 内置游戏')
              .id('builtin-games')
              .child(
                S.list()
                  .id('builtin-list')
                  .title('内置游戏分类')
                  .items([
                    ...gameCategoryItems(S, 'game'),
                    S.divider(),
                    S.listItem()
                      .title('📋 所有内置游戏')
                      .id('all-builtin')
                      .child(
                        S.documentList()
                          .id('all-builtin-list')
                          .title('所有内置游戏')
                          .filter('_type == "game"')
                          .defaultOrdering([{ field: 'title', direction: 'asc' }])
                      ),
                  ])
              ),

            S.listItem()
              .title('🌐 第三方游戏')
              .id('external-games')
              .child(
                S.list()
                  .id('external-list')
                  .title('第三方游戏分类')
                  .items([
                    ...gameCategoryItems(S, 'externalGame'),
                    S.divider(),
                    S.listItem()
                      .title('📋 所有第三方游戏')
                      .id('all-external')
                      .child(
                        S.documentList()
                          .id('all-external-list')
                          .title('所有第三方游戏')
                          .filter('_type == "externalGame"')
                      ),
                  ])
              ),

            // ========== 游戏变体 ==========
            S.listItem()
              .title('🔄 游戏变体')
              .id('game-variants')
              .child(
                S.documentList()
                  .id('variants-list')
                  .title('游戏变体')
                  .filter('_type == "gameVariant"')
                  .defaultOrdering([{ field: 'title', direction: 'asc' }])
              ),

            S.divider(),

            // ========== 内容管理 ==========
            S.listItem()
              .title('📝 内容管理')
              .id('content')
              .child(
                S.list()
                  .id('content-list')
                  .title('内容管理')
                  .items([
                    S.listItem()
                      .title('📄 博客文章')
                      .id('blog-posts')
                      .child(
                        S.documentList()
                          .id('blog-list')
                          .title('博客文章')
                          .filter('_type == "blogPost"')
                          .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                      ),
                    S.listItem()
                      .title('📖 游戏攻略')
                      .id('game-guides')
                      .child(
                        S.documentList()
                          .id('guides-list')
                          .title('游戏攻略')
                          .filter('_type == "gameGuide"')
                      ),
                    S.listItem()
                      .title('🏷️ Hub 主题页')
                      .id('hub-pages')
                      .child(
                        S.documentList()
                          .id('hubs-list')
                          .title('Hub 主题页')
                          .filter('_type == "hubPage"')
                      ),
                  ])
              ),

            S.divider(),

            // ========== 分类管理 ==========
            S.listItem()
              .title('📂 分类管理')
              .id('categories')
              .child(
                S.documentList()
                  .id('categories-list')
                  .title('分类管理')
                  .filter('_type == "category"')
                  .defaultOrdering([{ field: 'order', direction: 'asc' }])
              ),

            // ========== 作者管理 ==========
            S.listItem()
              .title('👤 作者管理')
              .id('authors')
              .child(
                S.documentList()
                  .id('authors-list')
                  .title('作者管理')
                  .filter('_type == "author"')
              ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
})

/**
 * 生成按分类筛选的游戏列表项
 */
function gameCategoryItems(S: any, type: string) {
  const categories = [
    { title: 'Word 文字游戏', id: 'word', value: 'word' },
    { title: 'Logic 逻辑游戏', id: 'logic', value: 'logic' },
    { title: 'Strategy 策略游戏', id: 'strategy', value: 'strategy' },
    { title: 'Arcade 街机游戏', id: 'arcade', value: 'arcade' },
    { title: 'Memory 记忆游戏', id: 'memory', value: 'memory' },
    { title: 'Skill 技巧游戏', id: 'skill', value: 'skill' },
    { title: 'Puzzle 益智游戏', id: 'puzzle', value: 'puzzle' },
  ]

  const prefix = type === 'externalGame' ? 'ext' : 'cat'

  return categories.map((cat) =>
    S.listItem()
      .title(cat.title)
      .id(`${prefix}-${cat.id}`)
      .child(
        S.documentList()
          .id(`${prefix}-${cat.id}-games`)
          .title(cat.title)
          .filter(`_type == "${type}" && category == "${cat.value}"`)
      )
  )
}
