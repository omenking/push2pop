module.exports = function(game){
  class controller {
    constructor() {
      this.create = this.create.bind(this)
      this.render = this.render.bind(this)
    }

    // starting tick
    get tick(){ return this._tick }
    set tick(v){ this._tick = v }

    create() {
      this.group = game.add.group()
      this.group.x = 112
      this.group.y = 168
      this.d0 = game.make.sprite(0 , 0, 'ints_large',0)
      this.d1 = game.make.sprite(16, 0, 'ints_large',0)
      this.d2 = game.make.sprite(24, 0, 'ints_large',0)
      this.group.add(this.d0)
      this.group.add(this.d1)
      this.group.add(this.d2)
      this.tick = 0
    }

    render(tick){
      if(tick > 0){
        const time    = Math.floor(tick / 60)
        if (time > 0){
          const minutes = Math.floor(time / 60)
          const seconds = time - minutes * 60

          if (minutes > 9){
            this.d0.frame = 9
          } else {
            this.d0.frame = minutes
          }
          if (seconds <= 9){
            console.log('seconds',seconds)
            this.d1.frame = 0
            this.d2.frame = seconds
          } else {
            console.log('seconds',seconds)
            this.d1.frame = parseInt(`${seconds}`.charAt(0))
            this.d2.frame = parseInt(`${seconds}`.charAt(1))
          }
        }
      }
    }
  }
  return controller
}
