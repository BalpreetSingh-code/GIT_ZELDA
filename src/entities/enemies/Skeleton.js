import EnemyStateName from "../../enums/EnemyStateName.js";
import Enemy from "./Enemy.js";
import Direction from "../../enums/Direction.js";
import Animation from "../../../lib/Animation.js";

export default class Skeleton extends Enemy {
	static SPEED = 20;

	constructor(sprites) {
		super(sprites);

		this.hitboxOffsets.set(3, 10, -6, -10);
		this.speed = Skeleton.SPEED;

		const animations = {
			[EnemyStateName.Idle]: {
				[Direction.Up]: new Animation([46], 1),
				[Direction.Down]: new Animation([10], 1),
				[Direction.Left]: new Animation([22], 1),
				[Direction.Right]: new Animation([34], 1),
			},
			[EnemyStateName.Walking]: {
				[Direction.Up]: new Animation([45, 46, 47, 46], 0.2),
				[Direction.Down]: new Animation([9, 10, 11, 10], 0.2),
				[Direction.Left]: new Animation([21, 22, 23, 22], 0.2),
				[Direction.Right]: new Animation([33, 34, 35, 34], 0.2),
			}
		};

		this.stateMachine = this.initializeStateMachine(animations);
	}
}
