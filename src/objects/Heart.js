import GameObject from "./GameObject.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { images } from "../globals.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/Player.js";

export default class Heart extends GameObject {
  static WIDTH = 16;
  static HEIGHT = 16;
  static HEAL_AMOUNT = 2;

  /**
   * A heart that can be picked up by the player to restore health.
   * Hearts are dropped randomly from defeated enemies.
   *
   * @param {Vector} position The position where the heart should spawn.
   */
  constructor(position) {
    super(new Vector(Heart.WIDTH, Heart.HEIGHT), position);

    this.isCollidable = true;
    this.isConsumable = true;
    this.renderPriority = -1;

    this.sprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.Hearts),
      Heart.WIDTH,
      Heart.HEIGHT
    );
    this.currentFrame = 4;
  }

  onConsume(consumer) {
    super.onConsume(consumer);

    if (consumer instanceof Player) {
      consumer.health = Math.min(
        consumer.health + Heart.HEAL_AMOUNT,
        consumer.totalHealth
      );
    }
  }
}
