import Animation from '../../../../lib/Animation.js';
import { getRandomPositiveInteger } from '../../../../lib/Random.js';
import State from '../../../../lib/State.js';
import Enemy from '../../../entities/enemies/Enemy.js';
import EnemyStateName from '../../../enums/EnemyStateName.js';
import { timer } from '../../../globals.js';

export default class EnemyIdlingState extends State {
	static MOVE_DURATION_MIN = 2;
	static MOVE_DURATION_MAX = 6;

	/**
	 * In this state, the enemy does not move and
	 * starts moving after a random period of time.
	 *
	 * @param {Enemy} enemy
	 * @param {Animation} animation
	 */
	constructor(enemy, animation) {
		super();

		this.enemy = enemy;
		this.animation = animation;
	}

	enter() {
		this.enemy.currentAnimation = this.animation[this.enemy.direction];
		this.idleDuration = getRandomPositiveInteger(
			EnemyIdlingState.MOVE_DURATION_MIN,
			EnemyIdlingState.MOVE_DURATION_MAX
		);

		this.startTimer();
	}

	update(dt) {}

	async startTimer() {
		await timer.wait(this.idleDuration);

		this.enemy.changeState(EnemyStateName.Walking);
	}
}
