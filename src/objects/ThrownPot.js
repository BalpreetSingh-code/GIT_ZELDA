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

/**
 * Represents a pot that's been thrown by the player.
 * Flies in a straight line and breaks on impact with walls or enemies.
 */
export default class ThrownPot extends GameObject {
  static WIDTH = 32;
  static HEIGHT = 32;
  static SPEED = 200; // How fast the pot travels
  static MAX_DISTANCE = Tile.TILE_SIZE * 4; // Breaks after 4 tiles
  static DAMAGE = 1; // Damage dealt to enemies
  static POT_SPRITE_INDEX = 8;
  static SHATTER_SPRITES = [8, 9, 10, 11]; // Breaking animation frames

  /**
   * Creates a thrown pot projectile.
   * @param {number} x Starting x position
   * @param {number} y Starting y position
   * @param {number} direction Direction to fly (from Direction enum)
   * @param {Room} room The room this pot exists in
   */
  constructor(x, y, direction, room) {
    super(new Vector(ThrownPot.WIDTH, ThrownPot.HEIGHT), new Vector(x, y));

    this.direction = direction;
    this.room = room;
    this.distanceTraveled = 0; // Track how far it's gone
    this.isBroken = false; // Whether it's shattered yet

    // Smaller hitbox for more precise collisions
    this.hitboxOffsets.set(8, 8, -16, -16);

    // Load pot sprites
    this.sprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.Pots),
      ThrownPot.WIDTH,
      ThrownPot.HEIGHT
    );
    this.currentFrame = ThrownPot.POT_SPRITE_INDEX;

    // Set up breaking animation
    this.breakAnimation = new Animation(ThrownPot.SHATTER_SPRITES, 0.1, 1);
    this.renderPriority = 0;
  }

  /**
   * Updates pot movement and checks for collisions.
   * Handles breaking animation when pot shatters.
   */
  update(dt) {
    // Keep hitbox in sync with position
    this.hitbox.set(
      this.position.x + this.hitboxOffsets.position.x,
      this.position.y + this.hitboxOffsets.position.y,
      this.dimensions.x + this.hitboxOffsets.dimensions.x,
      this.dimensions.y + this.hitboxOffsets.dimensions.y
    );

    // If broken, just animate the shatter then clean up
    if (this.isBroken) {
      this.breakAnimation.update(dt);
      if (this.breakAnimation.isDone()) {
        this.cleanUp = true; // Remove from game
      }
      return;
    }

    // Move the pot in its direction
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

    // Check if we hit anything
    this.checkCollisions();

    // Break if we've traveled too far
    if (this.distanceTraveled >= ThrownPot.MAX_DISTANCE) {
      this.break();
    }
  }

  /**
   * Renders the pot or its breaking animation.
   */
  render(offset) {
    if (this.isBroken) {
      // Show breaking animation
      const x = this.position.x + offset.x;
      const y = this.position.y + offset.y;
      this.sprites[this.breakAnimation.getCurrentFrame()].render(
        Math.floor(x),
        Math.floor(y)
      );
    } else {
      // Show flying pot
      super.render(offset);
    }
  }

  /**
   * Checks if the pot hit a wall or enemy.
   * Breaks the pot and damages enemies on collision.
   */
  checkCollisions() {
    // Don't check collisions if already broken
    if (this.isBroken) {
      return;
    }

    // Check if pot hit a wall
    if (
      this.position.x < Room.LEFT_EDGE ||
      this.position.x + this.dimensions.x > Room.RIGHT_EDGE ||
      this.position.y < Room.TOP_EDGE ||
      this.position.y + this.dimensions.y > Room.BOTTOM_EDGE
    ) {
      this.break();
      return;
    }

    // Check if pot hit an enemy
    this.room.entities.forEach((entity) => {
      if (entity instanceof Enemy && !entity.isDead) {
        if (this.hitbox.didCollide(entity.hitbox)) {
          console.log("Pot hit enemy!"); // Helpful for debugging
          entity.receiveDamage(ThrownPot.DAMAGE);
          this.break();
        }
      }
    });
  }

  /**
   * Breaks the pot and plays shatter sound.
   * Starts the breaking animation.
   */
  break() {
    if (!this.isBroken) {
      this.isBroken = true;
      sounds.play(SoundName.Shatter);
      this.breakAnimation.refresh(); // Start animation from beginning
    }
  }
}
