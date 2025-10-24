import GameObject from "./GameObject.js";
import Sprite from "../../lib/Sprite.js";
import Animation from "../../lib/Animation.js";
import ImageName from "../enums/ImageName.js";
import { images, sounds } from "../globals.js";
import Vector from "../../lib/Vector.js";
import Direction from "../enums/Direction.js";
import SoundName from "../enums/SoundName.js";
import Tile from "./Tile.js";
import Room from "./Room.js";
import Enemy from "../entities/enemies/Enemy.js";

export default class ThrownPot extends GameObject {
  static WIDTH = 32;
  static HEIGHT = 32;
  static SPEED = 200; // Pixels per second
  static MAX_DISTANCE = Tile.TILE_SIZE * 4; // Travel 4 tiles max
  static DAMAGE = 1;
  static POT_SPRITE_INDEX = 0; // Intact pot sprite
  // Shatter animation sprites (adjust these based on your pots.png layout)
  static SHATTER_SPRITES = [4, 5, 6, 7]; // Example: broken pot pieces

  /**
   * A pot that has been thrown by the player.
   * Travels in a straight line and breaks on collision.
   *
   * @param {number} x Starting x position
   * @param {number} y Starting y position
   * @param {number} direction Direction to travel
   * @param {Room} room The room this pot is in
   */
  constructor(x, y, direction, room) {
    super(new Vector(ThrownPot.WIDTH, ThrownPot.HEIGHT), new Vector(x, y));

    this.direction = direction;
    this.room = room;
    this.distanceTraveled = 0;
    this.isBroken = false;

    // Generate sprites from pots.png
    this.sprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.Pots),
      ThrownPot.WIDTH,
      ThrownPot.HEIGHT
    );
    this.currentFrame = ThrownPot.POT_SPRITE_INDEX;

    // Breaking animation - using shatter sprites from pots.png
    this.breakAnimation = new Animation(ThrownPot.SHATTER_SPRITES, 0.1, 1);
    this.renderPriority = 0;
  }

  update(dt) {
    super.update(dt);

    if (this.isBroken) {
      this.breakAnimation.update(dt);
      if (this.breakAnimation.isDone()) {
        this.cleanUp = true;
      }
      return;
    }

    // Move in the direction
    const distance = ThrownPot.SPEED * dt;

    switch (this.direction) {
      case Direction.Up:
        this.position.y -= distance;
        break;
      case Direction.Down:
        this.position.y += distance;
        break;
      case Direction.Left:
        this.position.x -= distance;
        break;
      case Direction.Right:
        this.position.x += distance;
        break;
    }

    this.distanceTraveled += distance;

    // Check for collisions
    this.checkCollisions();

    // Break if traveled too far
    if (this.distanceTraveled >= ThrownPot.MAX_DISTANCE) {
      this.break();
    }
  }

  render(offset) {
    if (this.isBroken) {
      // Render break animation
      const x = this.position.x + offset.x;
      const y = this.position.y + offset.y;
      this.sprites[this.breakAnimation.getCurrentFrame()].render(
        Math.floor(x),
        Math.floor(y)
      );
    } else {
      super.render(offset);
    }
  }

  checkCollisions() {
    // Check wall collision
    if (
      this.position.x < Room.LEFT_EDGE ||
      this.position.x + this.dimensions.x > Room.RIGHT_EDGE ||
      this.position.y < Room.TOP_EDGE ||
      this.position.y + this.dimensions.y > Room.BOTTOM_EDGE
    ) {
      this.break();
      return;
    }

    // Check enemy collision
    this.room.entities.forEach((entity) => {
      if (entity instanceof Enemy && !entity.isDead) {
        if (this.didCollideWithEntity(entity.hitbox)) {
          entity.receiveDamage(ThrownPot.DAMAGE);
          this.break();
        }
      }
    });
  }

  break() {
    if (!this.isBroken) {
      this.isBroken = true;
      sounds.play(SoundName.HitEnemy); // Use hit sound for now
      this.breakAnimation.refresh();
    }
  }
}
