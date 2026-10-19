/*:
 * @plugindesc Animates ocean on Mar_Intro_1 parallax (12 frames), preserves original map.
 * @author DBZ Project
 * @help Put Mar_Intro_1.png through Mar_Intro_12.png in img/parallaxes/.
 * Set the map Panorama to Mar_Intro_1, loops OFF. Enable plugin.
 */
(function() {
  'use strict';
  var names = [];
  for (var i=1; i<=12; i++) names.push('Mar_Intro_'+i);
  var _create = Spriteset_Map.prototype.createParallax;
  Spriteset_Map.prototype.createParallax = function() {
    _create.call(this);
    if ($gameMap.parallaxName() === 'Mar_Intro_1') {
      for (var j=0; j<names.length; j++) ImageManager.loadParallax(names[j]);
    }
  };
  var _update = Spriteset_Map.prototype.updateParallax;
  Spriteset_Map.prototype.updateParallax = function() {
    _update.call(this);
    if ($gameMap.parallaxName() !== 'Mar_Intro_1') return;
    var n = Math.floor(Graphics.frameCount / 7) % names.length;
    var bmp = ImageManager.loadParallax(names[n]);
    if (bmp.isReady() && this._parallax.bitmap !== bmp) this._parallax.bitmap = bmp;
  };
})();
