import { ECS, Vec2 } from 'raxis';

const ecs = new ECS().addStartupSystem(() => {
	const a = new Vec2(69, 420);
	console.log(a);
	const a1 = a.serialize();
	console.log(a1);
	const b = Vec2.deserialize(a1);
	console.log(b);
});

ecs.run();
