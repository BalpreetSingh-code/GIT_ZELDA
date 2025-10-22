import EnemyStateName from "../../enums/EnemyStateName.js";
import Enemy from "./Enemy.js";
import Direction from "../../enums/Direction.js";
import Animation from "../../../lib/Animation.js";

export default class Slime extends Enemy {
	static SPEED = 10;

	constructor(sprites) {
		super(sprites);

		this.hitboxOffsets.set(0, 6, -2, -6);
		this.speed = Slime.SPEED;

		const animations = {
			[EnemyStateName.Idle]: {
				[Direction.Up]: new Animation([86], 1),
				[Direction.Down]: new Animation([50], 1),
				[Direction.Left]: new Animation([62], 1),
				[Direction.Right]: new Animation([74], 1),
			},
			[EnemyStateName.Walking]: {
				[Direction.Up]: new Animation([84, 85, 86, 85], 0.2),
				[Direction.Down]: new Animation([48, 49, 50, 49], 0.2),
				[Direction.Left]: new Animation([60, 61, 62, 61], 0.2),
				[Direction.Right]: new Animation([72, 73, 74, 73], 0.2),
			}
		};

		this.stateMachine = this.initializeStateMachine(animations);
	}
}
