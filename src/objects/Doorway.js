import Vector from "../../lib/Vector.js";
import Direction from "../enums/Direction.js";
import EventName from "../enums/EventName.js";
import GameObject from "./GameObject.js";
import Room from "./Room.js";
import Tile from "./Tile.js";
import { canvas, sounds } from "../globals.js";
import SoundName from "../enums/SoundName.js";

export default class Doorway extends GameObject {
	static VERTICAL_WIDTH = 16;
	static VERTICAL_HEIGHT = 32;
	static HORIZONTAL_WIDTH = 32;
	static HORIZONTAL_HEIGHT = 16;

	static TOP_OPEN_SPRITES = [97, 98, 116, 117];
	static BOTTOM_OPEN_SPRITES = [140, 141, 159, 160];
	static LEFT_OPEN_SPRITES = [180, 181, 199, 200];
	static RIGHT_OPEN_SPRITES = [171, 172, 190, 191];
	static TOP_CLOSE_SPRITES = [133, 134, 152, 153];
	static BOTTOM_CLOSE_SPRITES = [215, 216, 234, 235];
	static LEFT_CLOSE_SPRITES = [218, 219, 237, 238];
	static RIGHT_CLOSE_SPRITES = [173, 174, 192, 193];

	static SHIFT_UP = new Event(EventName.ShiftUp);
	static SHIFT_DOWN = new Event(EventName.ShiftDown);
	static SHIFT_LEFT = new Event(EventName.ShiftLeft);
	static SHIFT_RIGHT = new Event(EventName.ShiftRight);

	/**
	 * One of four doors that appears on each side of a room.
	 * The player can walk through this door when open to go
	 * to an adjacent room.
	 *
	 * @param {number} direction
	 * @param {Room} room
	 */
	constructor(dimensions, position, direction, room) {
		super(dimensions, position);

		this.direction = direction;
		this.room = room;
		this.isOpen = false;
		this.isCollidable = true;
		this.openSprites = this.initializeOpenSprites(room.sprites);
		this.closeSprites = this.initializeCloseSprites(room.sprites);
		this.spriteLocations = this.initializeSpriteLocations();
		this.sprites = this.closeSprites;
		this.renderPriority = -1;
	}

	update() {
		/**
		 * To achieve the effect of the player walking underneath the arch
		 * of the door, we have to render the player before the door.
		 * Otherwise, we want the player to be above the door or else it will
		 * appear as if they are walking behind the door if they get too close.
		 */
		this.renderPriority = this.room.isShifting ? 1 : -1;
	}

	render(offset) {
		this.sprites.forEach((sprite, index) => {
			sprite.render(this.spriteLocations[index].x + offset.x, this.spriteLocations[index].y + offset.y);
		});
	}

	static getPositionFromDirection(direction) {
		const position = new Vector();

		if (direction === Direction.Left) {
			position.set(Room.RENDER_OFFSET_X, Room.RENDER_OFFSET_Y + (Room.HEIGHT / 2) * Tile.TILE_SIZE - Tile.TILE_SIZE / 2);
		}
		else if (direction === Direction.Right) {
			position.set(Room.RENDER_OFFSET_X + (Room.WIDTH * Tile.TILE_SIZE) - Tile.TILE_SIZE, Room.RENDER_OFFSET_Y + (Room.HEIGHT / 2 * Tile.TILE_SIZE) - Tile.TILE_SIZE / 2);
		}
		else if (direction === Direction.Up) {
			position.set(Room.RENDER_OFFSET_X + (Room.WIDTH / 2 * Tile.TILE_SIZE) - Tile.TILE_SIZE, Room.RENDER_OFFSET_Y);
		}
		else {
			position.set(Room.RENDER_OFFSET_X + (Room.WIDTH / 2 * Tile.TILE_SIZE) - Tile.TILE_SIZE, Room.RENDER_OFFSET_Y + (Room.HEIGHT * Tile.TILE_SIZE) - Tile.TILE_SIZE);
		}

		return position;
	}

	static getDimensionsFromDirection(direction) {
		const dimensions = new Vector();

		if (direction === Direction.Left) {
			dimensions.set(Doorway.VERTICAL_WIDTH, Doorway.VERTICAL_HEIGHT);
		}
		else if (direction === Direction.Right) {
			dimensions.set(Doorway.VERTICAL_WIDTH, Doorway.VERTICAL_HEIGHT);
		}
		else if (direction === Direction.Up) {
			dimensions.set(Doorway.HORIZONTAL_WIDTH, Doorway.HORIZONTAL_HEIGHT);
		}
		else {
			dimensions.set(Doorway.HORIZONTAL_WIDTH, Doorway.HORIZONTAL_HEIGHT);
		}

		return dimensions;
	}

	initializeOpenSprites(roomSprites) {
		const openSprites = [];
		let doorways;

		if (this.direction === Direction.Left) {
			doorways = Doorway.LEFT_OPEN_SPRITES;
		}
		else if (this.direction === Direction.Right) {
			doorways = Doorway.RIGHT_OPEN_SPRITES;
		}
		else if (this.direction === Direction.Up) {
			doorways = Doorway.TOP_OPEN_SPRITES;
		}
		else {
			doorways = Doorway.BOTTOM_OPEN_SPRITES;
		}

		doorways.forEach((doorway) => {
			openSprites.push(roomSprites[doorway]);
		});

		return openSprites;
	}

	initializeCloseSprites(roomSprites) {
		const closeSprites = [];
		let doorways;

		if (this.direction === Direction.Left) {
			doorways = Doorway.LEFT_CLOSE_SPRITES;
		}
		else if (this.direction === Direction.Right) {
			doorways = Doorway.RIGHT_CLOSE_SPRITES;
		}
		else if (this.direction === Direction.Up) {
			doorways = Doorway.TOP_CLOSE_SPRITES;
		}
		else {
			doorways = Doorway.BOTTOM_CLOSE_SPRITES;
		}

		doorways.forEach((doorway) => {
			closeSprites.push(roomSprites[doorway]);
		});

		return closeSprites;
	}

	initializeSpriteLocations() {
		const spriteLocations = [];

		if (this.direction === Direction.Left) {
			spriteLocations.push(new Vector(this.position.x - Tile.TILE_SIZE, this.position.y));
			spriteLocations.push(new Vector(this.position.x, this.position.y));
			spriteLocations.push(new Vector(this.position.x - Tile.TILE_SIZE, this.position.y + Tile.TILE_SIZE));
			spriteLocations.push(new Vector(this.position.x, this.position.y + Tile.TILE_SIZE));
		}
		else if (this.direction === Direction.Right) {
			spriteLocations.push(new Vector(this.position.x, this.position.y));
			spriteLocations.push(new Vector(this.position.x + Tile.TILE_SIZE, this.position.y));
			spriteLocations.push(new Vector(this.position.x, this.position.y + Tile.TILE_SIZE));
			spriteLocations.push(new Vector(this.position.x + Tile.TILE_SIZE, this.position.y + Tile.TILE_SIZE));
		}
		else if (this.direction === Direction.Up) {
			spriteLocations.push(new Vector(this.position.x, this.position.y - Tile.TILE_SIZE));
			spriteLocations.push(new Vector(this.position.x + Tile.TILE_SIZE, this.position.y - Tile.TILE_SIZE));
			spriteLocations.push(new Vector(this.position.x, this.position.y));
			spriteLocations.push(new Vector(this.position.x + Tile.TILE_SIZE, this.position.y));
		}
		else {
			spriteLocations.push(new Vector(this.position.x, this.position.y));
			spriteLocations.push(new Vector(this.position.x + Tile.TILE_SIZE, this.position.y));
			spriteLocations.push(new Vector(this.position.x, this.position.y + Tile.TILE_SIZE));
			spriteLocations.push(new Vector(this.position.x + Tile.TILE_SIZE, this.position.y + Tile.TILE_SIZE));
		}

		return spriteLocations;
	}

	open() {
		if (!this.isOpen) {
			this.isOpen = true;
			this.sprites = this.openSprites;
			sounds.play(SoundName.Door);
		}
	}

	close() {
		if (this.isOpen) {
			this.isOpen = false;
			this.sprites = this.closeSprites;
			sounds.play(SoundName.Door);
		}
	}

	/**
	 * Trigger a camera translation and adjustment of rooms whenever
	 * the player triggers a shift via a doorway collision.
	 */
	onCollision(collider) {
		if (!this.didPlayerCollide()) {
			return;
		}

		super.onCollision(collider);

		if (this.direction === Direction.Up) {
			collider.position.x = this.position.x + collider.dimensions.x / 2;
			canvas.dispatchEvent(Doorway.SHIFT_UP);
		}
		else if (this.direction === Direction.Down) {
			collider.position.x = this.position.x + collider.dimensions.x / 2;
			canvas.dispatchEvent(Doorway.SHIFT_DOWN);
		}
		else if (this.direction === Direction.Left) {
			collider.position.y = this.position.y;
			canvas.dispatchEvent(Doorway.SHIFT_LEFT);
		}
		else {
			collider.position.y = this.position.y;
			canvas.dispatchEvent(Doorway.SHIFT_RIGHT);
		}
	}

	didPlayerCollide() {
		return this.didCollideWithEntity(this.room.player.hitbox)
			&& !this.room.isShifting
			&& this.isOpen
			&& this.direction === this.room.player.direction;
	}
}
