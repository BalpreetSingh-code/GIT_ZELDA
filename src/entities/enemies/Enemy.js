import { getRandomPositiveInteger } from '../../../lib/Random.js';
import StateMachine from '../../../lib/StateMachine.js';
import EnemyStateName from '../../enums/EnemyStateName.js';
import SoundName from '../../enums/SoundName.js';
import { sounds } from '../../globals.js';
import Room from '../../objects/Room.js';
import Tile from '../../objects/Tile.js';
import EnemyIdlingState from '../../states/entity/enemy/EnemyIdlingState.js';
import EnemyWalkingState from '../../states/entity/enemy/EnemyWalkingState.js';
import GameEntity from '../GameEntity.js';

export default class Enemy extends GameEntity {
	static WIDTH = 16;
	static HEIGHT = 16;

	/**
	 * The enemy characters in the game that randomly
	 * walk around the room and can damage the player.
	 */
	constructor(sprites) {
		super();

		this.sprites = sprites;
		this.position.x = getRandomPositiveInteger(
			Room.LEFT_EDGE,
			Room.RIGHT_EDGE - Tile.TILE_SIZE
		);
		this.position.y = getRandomPositiveInteger(
			Room.TOP_EDGE,
			Room.BOTTOM_EDGE - Tile.TILE_SIZE
		);
		this.dimensions.x = Enemy.WIDTH;
		this.dimensions.y = Enemy.HEIGHT;
	}

	receiveDamage(damage) {
		this.health -= damage;
		sounds.play(SoundName.HitEnemy);
	}

	initializeStateMachine(animations) {
		const stateMachine = new StateMachine();

		stateMachine.add(
			EnemyStateName.Idle,
			new EnemyIdlingState(this, animations[EnemyStateName.Idle])
		);
		stateMachine.add(
			EnemyStateName.Walking,
			new EnemyWalkingState(this, animations[EnemyStateName.Walking])
		);

		stateMachine.change(EnemyStateName.Walking);

		return stateMachine;
	}
}
