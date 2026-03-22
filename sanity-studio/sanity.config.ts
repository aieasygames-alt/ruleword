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
          .title('游戏管理')
          .items([
            // 内置游戏分类
            S.listItem()
              .title('内置游戏')
              .id('builtin-games')
              .child(
                S.list()
                  .id('builtin-list')
                  .title('内置游戏分类')
                  .items([
                    S.listItem()
                      .title('Word 文字游戏')
                      .id('cat-word')
                      .child(
                        S.documentList()
                          .id('word-games')
                          .title('Word 游戏')
                          .filter('_type == "game" && category == "word"')
                      ),
                    S.listItem()
                      .title('Logic 逻辑游戏')
                      .id('cat-logic')
                      .child(
                        S.documentList()
                          .id('logic-games')
                          .title('Logic 游戏')
                          .filter('_type == "game" && category == "logic"')
                      ),
                    S.listItem()
                      .title('Strategy 策略游戏')
                      .id('cat-strategy')
                      .child(
                        S.documentList()
                          .id('strategy-games')
                          .title('Strategy 游戏')
                          .filter('_type == "game" && category == "strategy"')
                      ),
                    S.listItem()
                      .title('Arcade 街机游戏')
                      .id('cat-arcade')
                      .child(
                        S.documentList()
                          .id('arcade-games')
                          .title('Arcade 游戏')
                          .filter('_type == "game" && category == "arcade"')
                      ),
                    S.listItem()
                      .title('Memory 记忆游戏')
                      .id('cat-memory')
                      .child(
                        S.documentList()
                          .id('memory-games')
                          .title('Memory 游戏')
                          .filter('_type == "game" && category == "memory"')
                      ),
                    S.listItem()
                      .title('Skill 技巧游戏')
                      .id('cat-skill')
                      .child(
                        S.documentList()
                          .id('skill-games')
                          .title('Skill 游戏')
                          .filter('_type == "game" && category == "skill"')
                      ),
                    S.listItem()
                      .title('Puzzle 益智游戏')
                      .id('cat-puzzle')
                      .child(
                        S.documentList()
                          .id('puzzle-games')
                          .title('Puzzle 游戏')
                          .filter('_type == "game" && category == "puzzle"')
                      ),
                  ])
              ),
            // 第三方游戏分类
            S.listItem()
              .title('第三方游戏')
              .id('external-games')
              .child(
                S.list()
                  .id('external-list')
                  .title('第三方游戏分类')
                  .items([
                    S.listItem()
                      .title('Word 文字游戏')
                      .id('ext-word')
                      .child(
                        S.documentList()
                          .id('ext-word-games')
                          .title('Word 游戏')
                          .filter('_type == "externalGame" && category == "word"')
                      ),
                    S.listItem()
                      .title('Logic 逻辑游戏')
                      .id('ext-logic')
                      .child(
                        S.documentList()
                          .id('ext-logic-games')
                          .title('Logic 游戏')
                          .filter('_type == "externalGame" && category == "logic"')
                      ),
                    S.listItem()
                      .title('Strategy 策略游戏')
                      .id('ext-strategy')
                      .child(
                        S.documentList()
                          .id('ext-strategy-games')
                          .title('Strategy 游戏')
                          .filter('_type == "externalGame" && category == "strategy"')
                      ),
                    S.listItem()
                      .title('Arcade 街机游戏')
                      .id('ext-arcade')
                      .child(
                        S.documentList()
                          .id('ext-arcade-games')
                          .title('Arcade 游戏')
                          .filter('_type == "externalGame" && category == "arcade"')
                      ),
                    S.listItem()
                      .title('Memory 记忆游戏')
                      .id('ext-memory')
                      .child(
                        S.documentList()
                          .id('ext-memory-games')
                          .title('Memory 游戏')
                          .filter('_type == "externalGame" && category == "memory"')
                      ),
                    S.listItem()
                      .title('Skill 技巧游戏')
                      .id('ext-skill')
                      .child(
                        S.documentList()
                          .id('ext-skill-games')
                          .title('Skill 游戏')
                          .filter('_type == "externalGame" && category == "skill"')
                      ),
                    S.listItem()
                      .title('Puzzle 益智游戏')
                      .id('ext-puzzle')
                      .child(
                        S.documentList()
                          .id('ext-puzzle-games')
                          .title('Puzzle 游戏')
                          .filter('_type == "externalGame" && category == "puzzle"')
                      ),
                  ])
              ),
            S.divider(),
            S.documentTypeListItem('game').title('所有内置游戏'),
            S.documentTypeListItem('externalGame').title('所有第三方游戏'),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
})
