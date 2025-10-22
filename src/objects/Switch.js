import GameObject from "./GameObject.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { images } from "../globals.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/Player.js";

export default class Switch extends GameObject {
	static WIDTH = 16;
	static HEIGHT = 18;
	static HIT = 0;
	static NOT_HIT = 1;

	/**
	 * A toggle that the player can hit to open the dungeon doors.
	 *
	 * @param {Vector} dimensions
	 * @param {Vector} position
	 */
	constructor(dimensions, position, room) {
		super(dimensions, position);

		this.isCollidable = true;
		this.isSolid = true;

		this.sprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.Switches),
			Switch.WIDTH,
			Switch.HEIGHT
		);
		this.currentFrame = Switch.NOT_HIT;
		this.room = room;
	}

	onCollision(collider) {
		super.onCollision(collider);

		if (collider instanceof Player) {
			this.room.openDoors();
			this.currentFrame = Switch.HIT;
		}
	}
}
