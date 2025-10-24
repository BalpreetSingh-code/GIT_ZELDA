import GameObject from "./GameObject.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { images } from "../globals.js";
import Vector from "../../lib/Vector.js";

export default class Pot extends GameObject {
  static WIDTH = 32; // Sprite display size
  static HEIGHT = 32; // Sprite display size
  static SPRITE_INDEX = 8;

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

    // Smaller hitbox at the bottom of the pot
    // This creates a hitbox that is 16px wide and 12px tall at the bottom of the sprite
    this.hitboxOffsets.set(10, 24, -20, -24);

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
    // CRITICAL: Manually update the hitbox position and size
    this.hitbox.set(
      this.position.x + this.hitboxOffsets.position.x,
      this.position.y + this.hitboxOffsets.position.y,
      this.dimensions.x + this.hitboxOffsets.dimensions.x,
      this.dimensions.y + this.hitboxOffsets.dimensions.y
    );

    if (this.isBeingCarried && this.carrier) {
      // Position pot above carrier's head
      this.position.x =
        this.carrier.position.x + this.carrier.dimensions.x / 2 - Pot.WIDTH / 2;
      this.position.y = this.carrier.position.y - Pot.HEIGHT + 10;
      this.renderPriority = 1;
    }
  }
}
