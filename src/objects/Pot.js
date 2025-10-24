import GameObject from "./GameObject.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { images } from "../globals.js";
import Vector from "../../lib/Vector.js";

export default class Pot extends GameObject {
  static WIDTH = 32;
  static HEIGHT = 32;
  static SPRITE_INDEX = 0;

  /**
   * A pot that can be lifted, carried, and thrown by the player.
   *
   * @param {Vector} position The position where the pot should be placed.
   */
  constructor(position) {
    super(new Vector(Pot.WIDTH, Pot.HEIGHT), position);

    this.isSolid = true;
    this.isCollidable = true;
    this.isLiftable = true;

    // Smaller hitbox at the bottom of the pot (like the shadow)
    this.hitboxOffsets.set(8, 20, -16, -20);

    this.sprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.Pots),
      Pot.WIDTH,
      Pot.HEIGHT
    );
    this.currentFrame = Pot.SPRITE_INDEX;

    this.isBeingCarried = false;
    this.carrier = null;
  }

  update(dt) {
    super.update(dt);

    if (this.isBeingCarried && this.carrier) {
      // Position pot above carrier's head
      this.position.x =
        this.carrier.position.x + this.carrier.dimensions.x / 2 - Pot.WIDTH / 2;
      this.position.y = this.carrier.position.y - Pot.HEIGHT - 4;
      this.renderPriority = 1;
    }
  }
}
