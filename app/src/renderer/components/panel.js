module.exports = function(game){
  const APP = require('swap-n-pop_app')
  const blank = require(APP.path.components('panel_blank'))(game)
  const {
    UNIT,
    SWAP,
    STATIC,
    HANG,
    FALL,
    CLEAR,
    PANELS,
    COLS,
    ROWS,
    FRAME_LAND,
    FRAME_CLEAR,
    FRAME_LIVE,
    FRAME_DANGER,
    FRAME_DEAD,
    FRAME_NEWLINE,
    ANIM_SWAP_LEFT,
    ANIM_SWAP_RIGHT,
    TIME_SWAP,
    TIME_CLEAR,
    TIME_POP,
    TIME_FALL
  } = require(APP.path.core('data'))
  const _f = require(APP.path.core('filters'))
  const ss = require('shuffle-seed')

  class controller {
    get [Symbol.toStringTag](){ return 'Panel' }
    get kind()    { return this.i }
    set kind(val) {        this.i = val }

    get counter()    {return this.attr_counter }
    set counter(val) {       this.attr_counter = val }

    get state()    {return this.attr_state }
    set state(val) {       this.attr_state = val }

    get chain()    {return this.attr_chain }
    set chain(val) {       this.attr_chain = val }

    get pos(){
      return _f.xy2i(this.x,this.y)
    }

    get  left(){ return ((this.pos+1) % COLS) === 1    ? blank : this.playfield.stack[this.pos-1] }
    get right(){ return ((this.pos+1) % COLS) === 0    ? blank : this.playfield.stack[this.pos+1] }
    get under(){ return  (this.pos+1) >= (PANELS-COLS) ? blank : this.playfield.stack[this.pos+(COLS*1)] }
    get above(){ return  (this.pos+1) <= COLS          ? blank : this.playfield.stack[this.pos-(COLS*1)] }

    get  left2(){ return ((this.pos+2) % COLS) === 1    ? blank : this.playfield.stack[this.pos-2] }
    get right2(){ return ((this.pos+2) % COLS) === 0    ? blank : this.playfield.stack[this.pos+2] }
    get under2(){ return  (this.pos+2) >= (PANELS-COLS) ? blank : this.playfield.stack[this.pos+(COLS*2)] }
    get above2(){ return  (this.pos+2) <= COLS          ? blank : this.playfield.stack[this.pos-(COLS*2)] }

    constructor() {
      this.create   = this.create.bind(this)
      this.update   = this.update.bind(this)
      this.render   = this.render.bind(this)
      this.shutdown = this.shutdown.bind(this)

      this.serialize = this.serialize.bind(this);
      this.deserialize = this.deserialize.bind(this);


      this.matched = this.matched.bind(this);

      this.frames = this.frames.bind(this);
      this.frame = this.frame.bind(this);
      this.play_swap = this.play_swap.bind(this);
      this.play_land = this.play_land.bind(this);
      this.play_clear = this.play_clear.bind(this);
      this.play_live = this.play_live.bind(this);
      this.play_dead = this.play_dead.bind(this);
      this.play_danger = this.play_danger.bind(this);
      this.play_newline = this.play_newline.bind(this);
      this.set_animation = this.set_animation.bind(this);

      this.set = this.set.bind(this);
      this.render_visible = this.render_visible.bind(this);
      this.fall = this.fall.bind(this);
      this.swap = this.swap.bind(this);
      this.erase = this.erase.bind(this);
      this.popping = this.popping.bind(this);
      this.clear = this.clear.bind(this);
      this.nocombo = this.nocombo.bind(this);
      this.chain_and_combo = this.chain_and_combo.bind(this);
      this.check_neighbours = this.check_neighbours.bind(this);
      this.check_dead = this.check_dead.bind(this);
    }

    static initClass() {
      this.prototype.playfield          = null;
      this.prototype.x                  = null;
      this.prototype.y                  = null;
      this.prototype.animation_state    = null;
      this.prototype.animation_counter  = 0;
      this.prototype.chain              = null;
      this.prototype.sprite             = null;
      this.prototype.i                  = null;
    }
    serialize() {
      return [
        this.x,
        this.y,
        this.i,
        this.state,
        this.chain,
        this.counter,
        this.counter_popping,
        this.animation_state,
        this.animation_counter
      ];
    }
    deserialize(data){
      this.x                 = data[0]
      this.y                 = data[1]
      this.i                 = data[2]
      this.state             = data[3]
      this.chain             = data[4]
      this.counter           = data[5]
      // maybe we can infer these 3 if we reorganize our code
      this.counter_popping   = data[6]
      this.animation_state   = data[7]
      this.animation_counter = data[8]

      //we need to infer these
      //this.sprite.frame      = data[4]
      //this.sprite.visible    = data[5]
      //this.danger            = data[10]
    }
    create(playfield, x, y){
      this.playfield = playfield;
      this.counter = 0
      this.i = null
      this.x = x;
      this.y = y;
      this.state = STATIC
      this.chain = false

      this.sprite = game.make.sprite(0, 0, 'panels', this.frame(0));
      this.playfield.layer_block.add(this.sprite);
    }
    get swappable() {  return (this.above.state !== HANG) && (this.counter === 0); }
    get support()   {  return (this.state !== FALL) && ((this.i !== null)); }
    get clearable() {  return this.swappable && this.under.support && (this.i !== null); }
    get comboable() {  return this.clearable || ((this.state === CLEAR) && this.clearing); }
    get empty() {      return (this.counter === 0) && (this.i === null) }
    matched(i){
      return ((this.left.kind  === i) && (this.right.kind  === i)) ||
             ((this.above.kind === i) && (this.under.kind  === i)) ||
             ((this.above.kind === i) && (this.above2.kind === i)) ||
             ((this.under.kind === i) && (this.under2.kind === i)) ||
             ((this.left.kind  === i) && (this.left2.kind  === i)) ||
             ((this.right.kind === i) && (this.right2.kind === i))
    }

    frames(arr){
      const frames = [];
      for (let f of Array.from(arr)) { frames.push(this.frame(f)); }
      return frames;
    }
    frame(i){
      return (this.i * 8) + i;
    }
    play_land() {    return this.sprite.animations.play('land' , game.time.desiredFps, false); }
    play_clear() {   return this.sprite.animations.play('clear', game.time.desiredFps, false); }
    play_live() {    return this.sprite.animations.play('live'); }
    play_dead() {    return this.sprite.animations.play('dead'); }
    play_danger() {  return this.sprite.animations.play('danger', game.time.desiredFps/3, true); }
    play_newline() { return this.sprite.animations.play('newline'); }
    play_swap(){
      if (this.animation_counter <= 0) { this.animation_state = null; }
      if (this.animation_counter > 0 ) { this.animation_counter--;    }
      switch (this.animation_state) {
        case ANIM_SWAP_LEFT:
          var step = UNIT / TIME_SWAP;
          this.sprite.x += step * this.animation_counter;
        case ANIM_SWAP_RIGHT:
          this.sprite.x -= step * this.animation_counter;
      }
    }

    set_animation() {
      this.sprite.frame = this.frame(0);
      this.sprite.animations.add('land'   , this.frames(FRAME_LAND));
      this.sprite.animations.add('clear'  , this.frames(FRAME_CLEAR));
      this.sprite.animations.add('live'   , this.frames(FRAME_LIVE));
      this.sprite.animations.add('danger' , this.frames(FRAME_DANGER));
      this.sprite.animations.add('dead'   , this.frames(FRAME_DEAD));
      this.sprite.animations.add('newline', this.frames(FRAME_NEWLINE));
    }
    set(i){
      switch (i) {
        case 'unique':
          this.nocombo();
          break;
        default:
          this.kind = i
      }
      return this.set_animation();
    }
    update(i){
      if (!this.playfield.running) { return; }
      if (this.i === null) { return; }
      if (this.newline)    { return; }
      if (this.counter_popping > 0) {
        this.counter_popping--;
      }

      if (this.counter > 0) {
        this.counter--
        if (this.counter > 0) { return }
      }
      if (this.counter_popping === 0) { this.counter_popping = null; }


      switch (this.state) {
        case STATIC: case SWAP:
          if (this.under === blank) {
            this.state = STATIC
            this.chain = false
          } else if (this.under.state === HANG) {
            this.state = HANG
            this.counter =  this.under.counter
            this.chain = this.under.chain
          } else if (this.under.empty) {
            this.state = HANG
          } else {
            this.chain = false
          }
          break;
        case HANG:
          this.state = FALL
          break;
        case FALL:
          if (this.under.empty) {
            this.fall();
          } else if (this.under.state === CLEAR) {
            this.state = STATIC
          } else {
            this.state   = this.under.state
            this.counter = this.under.counter
            this.chain   = this.under.chain
          }
          if (((this.state === STATIC) || (this.state === SWAP)) && this.sprite) {
            this.play_land();
            this.playfield.land = true;
          }
          break;
        case CLEAR:
          this.erase();
          break;
        default:
          console.log("Unknown block state");
      }
    }

    render_visible(){
      if (this.kind === null || this.counter_popping === 0 ){
        this.sprite.visible = false
      } else {
        this.sprite.visible = true
      }
    }
    fall() {
      this.under.state   = this.state
      this.under.counter = this.counter
      this.under.chain   = this.chain
      this.under.kind    = this.kind
      this.under.set_animation()
      this.under.sprite.frame = this.sprite.frame

      this.state   = STATIC
      this.counter = 0
      this.chain   = false
      this.kind    = null
    }
    // Swap this block with its right neighbour.
    swap() {
      //swap i
      const i1 = this.kind
      const i2 = this.right.kind

      this.kind = i2
      this.right.kind = i1

      this.set_animation();
      this.right.set_animation();

      this.right.chain = false
      this.chain       = false

      if ((this.kind !== null) || (this.right.kind !== null)) {
        game.sounds.swap()
      }

      if (this.kind === null) {
        this.state   = SWAP
        this.counter = 0
      } else {
        this.state   = SWAP
        this.counter = TIME_SWAP
        this.animation_state   = ANIM_SWAP_LEFT;
        this.animation_counter = TIME_SWAP;
      }

      if (this.right.kind === null) {
        this.right.state   = SWAP
        this.right.counter = 0
      } else {
        this.right.state             = SWAP
        this.right.counter           = TIME_SWAP
        this.right.animation_state   = ANIM_SWAP_RIGHT
        this.right.animation_counter = TIME_SWAP
      }
    }
    // Erase the contents of this block and start a chain in
    // its upper neighbour.
    erase() {
      this.playfield.track_tick();
      this.kind    = null
      this.state   = STATIC
      this.counter = 0
      this.chain   = false
      if (this.above && (this.above.i !== null)) {
        this.above.chain = true
        //return console.log('above', this.above.x, this.above.y, this.above.chain);
      }
    }
    popping(i){
      const time = TIME_CLEAR + (TIME_POP*this.playfield.panels_clearing.length) + TIME_FALL;
      this.counter = time
      this.clearing = false;
      return this.counter_popping = TIME_CLEAR + (TIME_POP*(i+1));
    }

    nocombo() {
      let values = ss.shuffle([0, 1, 2, 3, 4],this.playfield.stage.rng());
      return this.i = values.find((i)=> {
        return this.matched(i) === false
      })
    }
    get danger(){
      const i = _f.xy2i(this.x,1)
      return this.playfield.stack[i]            &&
             this.playfield.stack[i]            &&
             this.playfield.stack[i].kind >= 0  &&
             this.playfield.stack[i].kind !== null

    }
    get newline(){
      return this.playfield.should_push && this.y === (ROWS)
    }
    clear() {
      if (this.state === CLEAR) { return [0, this.chain]; }
      this.clearing = true
      this.state    = CLEAR
      this.playfield.panels_clearing.push(this)
      this.play_clear()
      return [1, this.chain]
    }
    chain_and_combo() {
      let combo = 0
      let chain = false
      if (!this.comboable) { return [combo,chain] }
      [combo,chain] = Array.from(this.check_neighbours(this.left , this.right, combo, chain));
      [combo,chain] = Array.from(this.check_neighbours(this.above, this.under, combo, chain));
      return [combo,chain]
    }
    check_neighbours(p1,p2,combo,chain){
      if (!p1.comboable || (p1.i !== this.i)  ||
          !p2.comboable || (p2.i !== this.i)) { return [combo,chain]; }
      const panel1  = p1.clear()
      const middle  = this.clear()
      const panel2  = p2.clear()

      combo  += panel1[0]
      combo  += middle[0]
      combo  += panel2[0]
      if (middle[1] || panel1[1] || panel2[1]) { chain = true; }
      return [combo,chain]
    }
    check_dead(i,is_dead){
      const [x,y] = Array.from(_f.i2xy(i));
      if (is_dead && (is_dead.indexOf(x) !== -1)) {
        return this.play_dead();
      } else {
        return this.play_live();
      }
    }
    render(){
      if (!this.sprite) { return; }
      this.sprite.x = this.x * UNIT
      this.sprite.y = this.y * UNIT

      if      (this.newline) { this.play_newline() }
      else if (this.danger)  { this.play_danger()  }
      else                   { this.play_live()    }
      this.play_swap()
      this.render_visible()
    }
    shutdown(){}
  } // klass
  controller.initClass();
  return controller
}
