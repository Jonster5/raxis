import { MemPool, Vec2 } from 'raxis';

const vecPool = new MemPool(() => new Vec2(), {
	size: 5,
	growBy: 10,
});

console.log(vecPool.available);

vecPool.reclaim();

console.log(vecPool.available);
