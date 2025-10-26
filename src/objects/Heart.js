import GameObject from "./GameObject.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { images, sounds } from "../globals.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/Player.js";
import SoundName from "../enums/SoundName.js";

/**
 * Heart object that restores player health when picked up.
 * These drop randomly from enemies when they die.
 */
export default class Heart extends GameObject {
  static WIDTH = 16;
  static HEIGHT = 16;
  static HEAL_AMOUNT = 2; // Restores 1 full heart (2 health points)

  /**
   * Creates a new heart pickup.
   * @param {Vector} position Where the heart spawns in the room
   */
  constructor(position) {
    super(new Vector(Heart.WIDTH, Heart.HEIGHT), position);

    // Hearts can be collided with and disappear after use
    this.isCollidable = true;
    this.isConsumable = true;
    this.renderPriority = -1; // Draw hearts before entities

    // Load heart sprites from the sprite sheet
    this.sprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.Hearts),
      Heart.WIDTH,
      Heart.HEIGHT
    );
    this.currentFrame = 4; // Full heart sprite
  }

  /**
   * Called when the player picks up the heart.
   * Heals the player but doesn't exceed max health.
   * Also plays a pickup sound effect.
   * @param {Player} consumer The entity that picked up the heart
   */
  onConsume(consumer) {
    super.onConsume(consumer);

    if (consumer instanceof Player) {
      // Add health but cap it at the player's max health
      consumer.health = Math.min(
        consumer.health + Heart.HEAL_AMOUNT,
        consumer.totalHealth
      );

      // Play sound when heart is picked up (same as player hit sound)
      sounds.play(SoundName.HitPlayer);
    }
  }
}
