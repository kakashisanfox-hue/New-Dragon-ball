/*:
 * @plugindesc Kame House: animates the four full-size water parallax frames (17x13 map).
 * @author DBZ Project
 * @help
 * Put Kame_Water_1.png through Kame_Water_4.png in img/parallaxes.
 * Set map Panorama to Kame_Water_1, with horizontal/vertical loops OFF.
 * Enable this plugin. Only maps with this exact parallax name animate.
 */
(function() {
  'use strict';
  var names = ['Kame_Water_1','Kame_Water_2','Kame_Water_3','Kame_Water_4'];
  var original = Spriteset_Map.prototype.updateParallax;
  Spriteset_Map.prototype.updateParallax = function() {
    original.call(this);
    if ($gameMap.parallaxName() !== names[0]) return;
    if (!this._kameWaterFrames) {
      this._kameWaterFrames = names.map(function(n) { return ImageManager.loadParallax(n); });
    }
    var index = Math.floor(Graphics.frameCount / 18) % names.length;
    var frame = this._kameWaterFrames[index];
    if (frame && frame.isReady() && this._parallax.bitmap !== frame) {
      this._parallax.bitmap = frame;
    }
  };
})();
