import GameObject from "./GameObject.js";
import Sprite from "../../lib/Sprite.js";
import ImageName from "../enums/ImageName.js";
import { images } from "../globals.js";
import Vector from "../../lib/Vector.js";

/**
 * Pot object that can be lifted, carried, and thrown by the player.
 * Acts as a solid object until picked up, then becomes a projectile.
 */
export default class Pot extends GameObject {
  static WIDTH = 32; // Visual size of the pot sprite
  static HEIGHT = 32;
  static SPRITE_INDEX = 8; // Which sprite to use from the pot sprite sheet

  /**
   * Creates a new pot object in the room.
   * @param {Vector} position Where to place the pot
   */
  constructor(position) {
    super(new Vector(Pot.WIDTH, Pot.HEIGHT), position);

    // Pots block movement and can be interacted with
    this.isSolid = true;
    this.isCollidable = true;
    this.isLiftable = true; // Player can pick this up

    // Smaller hitbox at the bottom for better collision feel
    // This makes it so you collide with the base, not the whole sprite
    this.hitboxOffsets.set(10, 24, -20, -24);

    // Load pot sprites
    this.sprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.Pots),
      Pot.WIDTH,
      Pot.HEIGHT
    );
    this.currentFrame = Pot.SPRITE_INDEX;

    // Track if player is carrying this pot
    this.isBeingCarried = false;
    this.carrier = null;
  }

  /**
   * Updates pot position and hitbox each frame.
   * When carried, pot follows above the player's head.
   */
  update(dt) {
    // Update hitbox position to match current pot position
    this.hitbox.set(
      this.position.x + this.hitboxOffsets.position.x,
      this.position.y + this.hitboxOffsets.position.y,
      this.dimensions.x + this.hitboxOffsets.dimensions.x,
      this.dimensions.y + this.hitboxOffsets.dimensions.y
    );

    // If being carried, position pot above carrier's head
    if (this.isBeingCarried && this.carrier) {
      this.position.x =
        this.carrier.position.x + this.carrier.dimensions.x / 2 - Pot.WIDTH / 2;
      this.position.y = this.carrier.position.y - Pot.HEIGHT + 10;
      this.renderPriority = 1; // Draw on top of player
    }
  }
}
