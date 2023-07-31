import { Component, ECS } from 'raxis';

export class MyComp extends Component {
	constructor(public foo: string) {
		super();
	}
}

const ecs = new ECS()
	.addComponentType(MyComp)
	.addStartupSystem((ecs: ECS) => {
		ecs.spawn(new MyComp('original'));
	})
	.addStartupSystem((ecs: ECS) => {
		window.addEventListener('keydown', (e) => {
			if (e.code !== 'Space') return;

			ecs.query([MyComp]).entity()!.replace(new MyComp('yup'));
		});
	})
	.addMainSystem((ecs: ECS) => {
		const [m] = ecs.query([MyComp]).single()!;

		console.log(m);
	});

ecs.run();
