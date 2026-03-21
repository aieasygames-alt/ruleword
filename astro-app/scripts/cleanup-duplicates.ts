import { createClient } from '@sanity/client';
import 'dotenv/config';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '0dvqdd4m',
  dataset: process.env.SANITY_DATASET || 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
});

async function cleanupDuplicates() {
  console.log('🔍 查找重复的游戏数据...\n');

  // 获取所有游戏
  const games = await client.fetch<{ _id: string; gameId: string; title: string }[]>(`
    *[_type == "game"] {
      _id,
      gameId,
      title
    }
  `);

  console.log(`📊 找到 ${games.length} 个游戏文档\n`);

  // 按 gameId 分组
  const grouped = new Map<string, typeof games>();
  for (const game of games) {
    const existing = grouped.get(game.gameId) || [];
    existing.push(game);
    grouped.set(game.gameId, existing);
  }

  // 找出重复的
  const duplicates: typeof games = [];
  for (const [, docs] of grouped) {
    if (docs.length > 1) {
      // 保留第一个，删除其余的
      const toDelete = docs.slice(1);
      duplicates.push(...toDelete);
    }
  }

  if (duplicates.length === 0) {
    console.log('✅ 没有发现重复数据！');
    return;
  }

  console.log(`🗑️  将删除 ${duplicates.length} 个重复文档：\n`);

  // 删除重复文档
  let deleted = 0;
  for (const doc of duplicates) {
    try {
      await client.delete(doc._id);
      console.log(`   ❌ 已删除: ${doc.title} (${doc._id})`);
      deleted++;
    } catch (err) {
      console.log(`   ⚠️  删除失败: ${doc.title} - ${err.message}`);
    }
  }

  console.log(`\n✅ 清理完成！删除了 ${deleted} 个重复文档`);

  // 验证最终数量
  const finalCount = await client.fetch('count(*[_type == "game"])');
  console.log(`📊 最终游戏数量: ${finalCount}`);
}

cleanupDuplicates().catch(console.error);
