import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  try {
    const games = await getCollection('games');
    const data = games.map(game => ({
      id: game.data.id,
      slug: game.slug,
      ...game.data
    }));
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to load games' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
