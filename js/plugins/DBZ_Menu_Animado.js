/*:
 * @plugindesc v1.0 Tela inicial DBZ animada: seta, letras pulsantes, Shenlong e Kame House. RPG Maker MV.
 * @author ChatGPT
 * @help
 * Instale DBZ_Menu_Animado.js em js/plugins/
 * Instale DBZ_Title_BG.png em img/pictures/
 * Ative DBZ_Menu_Animado no Gerenciador de Plugins (F10).
 * Coloque este plugin ABAIXO de outros plugins que alteram Scene_Title.
 * A tela inicial usa os comandos originais Novo Jogo, Continuar, Opções
 * e acrescenta Sair. Setas/teclado/mouse funcionam.
 * O fundo tem movimento suave e os textos selecionados pulsam.
 * Para trocar a imagem, substitua DBZ_Title_BG.png mantendo 816x624.
 */
(function() {
'use strict';
var _make = Window_TitleCommand.prototype.makeCommandList;
Window_TitleCommand.prototype.makeCommandList=function(){
  _make.call(this);
  this.addCommand('Sair','dbzExit',true);
};
var _createBg=Scene_Title.prototype.createBackground;
Scene_Title.prototype.createBackground=function(){
  _createBg.call(this);
  if(this._backSprite1) this._backSprite1.visible=false;
  if(this._backSprite2) this._backSprite2.visible=false;
  this._dbzBg=new Sprite(ImageManager.loadPicture('DBZ_Title_BG'));
  this._dbzBg.anchor.set(0.5,0.5);
  this._dbzBg.x=Graphics.boxWidth/2;
  this._dbzBg.y=Graphics.boxHeight/2;
  this.addChild(this._dbzBg);
  this._dbzTick=0;
};
Scene_Title.prototype.createForeground=function(){
  this._gameTitleSprite=new Sprite(new Bitmap(1,1)); // logo already on background
};
var _createCmd=Scene_Title.prototype.createCommandWindow;
Scene_Title.prototype.createCommandWindow=function(){
  _createCmd.call(this);
  var cw=this._commandWindow;
  cw.setHandler('dbzExit',this.dbzExit.bind(this));
  cw.x=Math.round(Graphics.boxWidth*.34);
  cw.y=Math.round(Graphics.boxHeight*.415);
  cw.width=Math.round(Graphics.boxWidth*.36);
  cw.height=270;
  cw.opacity=0;
  cw.backOpacity=0;
  cw.contentsOpacity=0;
  cw._dbzLastIndex=-1;
  // visual menu sprites drawn separately; native window retains all input/handlers
  this._dbzMenu=new Sprite();
  this.addChild(this._dbzMenu);
  this._dbzLabels=[];
  var names=['NOVO JOGO','CONTINUAR','OPÇÕES','SAIR'];
  for(var i=0;i<4;i++){
    var sp=new Sprite(new Bitmap(280,58));
    sp.anchor.set(.5,.5);
    sp.x=Graphics.boxWidth*.5;
    sp.y=Graphics.boxHeight*(.458+i*.079);
    this._dbzMenu.addChild(sp);
    this._dbzLabels.push(sp);
  }
  this._dbzArrow=new Sprite(new Bitmap(44,46));
  this._dbzArrow.anchor.set(.5,.5);
  this._dbzArrow.x=Graphics.boxWidth*.335;
  this._dbzArrow.y=this._dbzLabels[0].y;
  this._dbzMenu.addChild(this._dbzArrow);
  var b=this._dbzArrow.bitmap,ctx=b._context;
  ctx.save();ctx.shadowColor='#ffcf24';ctx.shadowBlur=13;
  ctx.beginPath();ctx.moveTo(5,4);ctx.lineTo(38,23);ctx.lineTo(5,42);ctx.closePath();
  ctx.fillStyle='#ff8b00';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#fff3a4';ctx.stroke();ctx.restore();b._setDirty();
  this._dbzSelected=-1;
  // Credit fixed at the lower-right corner of the title screen.
  this._dbzCredit=new Sprite(new Bitmap(350,32));
  this._dbzCredit.anchor.set(1,1);
  this._dbzCredit.x=Graphics.boxWidth-12;
  this._dbzCredit.y=Graphics.boxHeight-9;
  var credit=this._dbzCredit.bitmap;
  var cc=credit._context;
  cc.save();
  cc.font='bold 17px Arial, sans-serif';
  cc.textAlign='right';
  cc.textBaseline='middle';
  cc.lineJoin='round';
  cc.lineWidth=4;
  cc.strokeStyle='#10101a';
  cc.fillStyle='#ffe18a';
  cc.strokeText('Game fã by Matheusoblack',342,16);
  cc.fillText('Game fã by Matheusoblack',342,16);
  cc.restore();
  credit._setDirty();
  this.addChild(this._dbzCredit);
};
Scene_Title.prototype.dbzExit=function(){
  this._commandWindow.close();
  this.fadeOutAll();
  SceneManager.exit();
};
Scene_Title.prototype.dbzRedraw=function(index){
 var names=['NOVO JOGO','CONTINUAR','OPÇÕES','SAIR'];
 for(var i=0;i<4;i++){
  var s=this._dbzLabels[i],b=s.bitmap,c=b._context;
  b.clear();c.save();c.textAlign='center';c.textBaseline='middle';
  c.font='900 32px Impact, Arial Black, sans-serif';
  c.lineJoin='round';c.lineWidth=6;c.strokeStyle='#08090f';
  c.shadowColor=i===index?'#ffb000':'#000000';
  c.shadowBlur=i===index?17:4;
  c.fillStyle=i===index?'#ffdb35':(i===3?'#ff644a':'#ffffff');
  c.strokeText(names[i],140,29);c.fillText(names[i],140,29);
  c.restore();b._setDirty();
  s.opacity=(i===1 && !this._commandWindow.isCommandEnabled(i))?115:255;
 }
};
var _update=Scene_Title.prototype.update;
Scene_Title.prototype.update=function(){
 _update.call(this);
 if(!this._dbzBg||!this._commandWindow||!this._dbzLabels)return;
 this._dbzTick++;
 var t=this._dbzTick;
 var bw=Graphics.boxWidth,bh=Graphics.boxHeight;
 // subtle animated camera motion on the background
 this._dbzBg.scale.x=1.025+Math.sin(t/130)*.007;
 this._dbzBg.scale.y=1.025+Math.cos(t/155)*.007;
 this._dbzBg.x=bw/2+Math.sin(t/115)*2;
 this._dbzBg.y=bh/2+Math.cos(t/130)*2;
 var idx=this._commandWindow.index();
 if(idx<0)idx=0;
 if(idx!==this._dbzSelected){this._dbzSelected=idx;this.dbzRedraw(idx);}
 for(var i=0;i<4;i++){
  var sp=this._dbzLabels[i],active=i===idx;
  var pulse=active?1.055+Math.sin(t*.12)*.025:1;
  sp.scale.set(pulse,pulse);
  sp.x=bw*.5+(active?Math.sin(t*.11)*2:0);
 }
 var target=this._dbzLabels[idx].y;
 this._dbzArrow.y+=(target-this._dbzArrow.y)*.28;
 this._dbzArrow.x=bw*.335+Math.sin(t*.17)*5;
 this._dbzArrow.scale.set(1+Math.sin(t*.16)*.09,1+Math.sin(t*.16)*.09);
 this._dbzArrow.opacity=210+Math.round(45*(.5+.5*Math.sin(t*.13)));
 // hide native title window, keep its input and selection mechanics
 this._commandWindow.opacity=0;
 this._commandWindow.backOpacity=0;
 this._commandWindow.contentsOpacity=0;
};
})();
