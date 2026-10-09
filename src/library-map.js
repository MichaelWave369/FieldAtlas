/**
 * The Atlas Map is derived from the public/local catalog already on screen.
 * It never fetches repositories, invents rooms, or changes governance.
 */
import { wingForCategory } from './catalog.js';

export const mapRoomPositions = Object.freeze({
  research: 'research',
  creative: 'creative',
  engineering: 'engineering',
  all: 'atrium',
  games: 'games',
  annex: 'annex',
});

export function getAtlasMapRooms(wings = [], catalog = [], visitedIds = []) {
  const visited = new Set(visitedIds);
  return wings.map(wing => {
    const books = catalog.filter(page => page && (
      wing.id === 'all' || wingForCategory(page.category) === wing.id
    ));
    return {
      ...wing,
      position: mapRoomPositions[wing.id] || 'annex',
      count: books.length,
      visitedCount: books.filter(page => visited.has(page.id)).length,
      previews: books.slice(0, 3),
    };
  });
}

export function getMapChapterWing(page) {
  if (!page) return 'all';
  return wingForCategory(page.category);
}

export function canEnterMapRoom(room) {
  return Boolean(room && Number.isInteger(room.count) && room.count > 0);
}
