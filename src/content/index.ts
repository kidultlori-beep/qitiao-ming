import type { ChapterPack, EndingDef } from '../types/schema';
import prologue from './prologue.json' with { type: 'json' };
import volume1 from './volume1.json' with { type: 'json' };

function dedupeById<T extends { id: string }>(list: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of list) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

/** 将多章包合并为可连续游玩的主包（节点 id 须全局唯一） */
export function mergePacks(
  list: ChapterPack[],
  meta: Pick<ChapterPack, 'id' | 'title' | 'description' | 'startNode'>,
): ChapterPack {
  const endings: EndingDef[] = [];
  const npcs: NonNullable<ChapterPack['npcs']> = [];
  const nodes = [];
  for (const p of list) {
    nodes.push(...p.nodes);
    if (p.endings) endings.push(...p.endings);
    if (p.npcs) npcs.push(...p.npcs);
  }
  return {
    ...meta,
    nodes,
    endings: dedupeById(endings),
    npcs: dedupeById(npcs),
  };
}

export const sourcePacks: ChapterPack[] = [
  prologue as ChapterPack,
  volume1 as ChapterPack,
];

export const packs: ChapterPack[] = sourcePacks;

export function getPack(id: string): ChapterPack | undefined {
  if (id === defaultPack.id) return defaultPack;
  return packs.find((p) => p.id === id);
}

/** MVP 主包：序章 + 卷一骨架，从新游戏可玩到卷一结局 */
export const defaultPack: ChapterPack = mergePacks(sourcePacks, {
  id: 'qitiao-ming-mvp',
  title: '七条命',
  description:
    '序章至卷一骨架。命数、账本、人情、公开度驱动。原创旁白对白，非整章粘贴原著。',
  startNode: (prologue as ChapterPack).startNode,
});
