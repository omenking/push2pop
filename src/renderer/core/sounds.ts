import Store from 'common/store'
import game from 'core/game'
import assets from 'core/assets'
import SoundGroup from 'core/sound_group'

const store = new Store()

/**
 * Sounds class thats attached to the game itself,
 * Sounds holds all sounds and has helper methods with different states
 */
export default class CoreSounds {
  private sfw_swap           : Phaser.Sound
  private sfx_land           : Array<Phaser.Sound>
  private sfx_pop            : Array<Phaser.Sound>
  private sfx_confirm        : Phaser.Sound
  private sfx_select         : Phaser.Sound
  private sfx_blip           : Phaser.Sound
  private sfx_ding           : Phaser.Sound
  private sfx_swap           : Phaser.Sound
  private mode_vs            : SoundGroup

  /** Defines all the sound files this class contains, volume vars and loopable sounds */
  create() {  
    this.mode_vs = new SoundGroup(
      ["msx_stage", assets.music.msx_stage], 
      ["msx_stage_critical", assets.music.msx_stage_critical],
      ["msx_stage_results", assets.music.msx_stage_results]
    )

    this.sfx_land = []
    this.sfx_land[0]  = game.add.audio('sfx_drop0')
    this.sfx_land[1]  = game.add.audio('sfx_drop1')
    this.sfx_land[2]  = game.add.audio('sfx_drop2')
    this.sfx_land[3]  = game.add.audio('sfx_drop3')

    this.sfx_pop = []
    this.sfx_pop[0] = game.add.audio('sfx_pop0')
    this.sfx_pop[1] = game.add.audio('sfx_pop1')
    this.sfx_pop[2] = game.add.audio('sfx_pop2')
    this.sfx_pop[3] = game.add.audio('sfx_pop3')

    this.sfx_confirm = game.add.audio('sfx_confirm')
    this.sfx_select  = game.add.audio('sfx_select')

    this.sfx_blip  = game.add.audio('sfx_countdown_blip')
    this.sfx_ding  = game.add.audio('sfx_countdown_ding')
    this.sfx_swap = game.add.audio('sfx_swap')

    let audio_settings = store.get("audio")
    if (audio_settings !== undefined) {
      this.set_sfx_volume(this.sfx_volume)
      this.set_msx_volume(this.msx_volume)
      this.mute_all(audio_settings[2])
    }
  } 
  
  get msx_volume() { return store.get("audio")[0] * 0.01 }
  get sfx_volume() { return store.get("audio")[1] * 0.01 }

  /**
   * Sets all current sfx files to the volume amount passed in
   * @param {integer} volume from 0 to 100
   */
  set_sfx_volume(volume) {
    this.sfx_land.forEach(sfx => sfx.volume = volume)
    this.sfx_pop.forEach(sfx => sfx.volume = volume)
    this.sfx_confirm.volume = volume
    this.sfx_select.volume  = volume
    this.sfx_blip.volume    = volume
    this.sfx_ding.volume    = volume
    this.sfx_swap.volume    = volume
  }

  /**
   * Sets all current msx files to the volume amount passed in
   * @param {integer} volume from 0 to 100
   */
  set_msx_volume(volume) {
    this.mode_vs.volume(volume)
  }

 /**
  * Mute/Unmutes all files
  * @param {boolean} bool wether to mute or not mute all files
  */
  mute_all(bool) {
    this.sfx_land.forEach(sfx => sfx.mute = bool)
    this.sfx_pop.forEach(sfx => sfx.mute = bool)
    this.sfx_confirm.mute = bool
    this.sfx_select.mute  = bool
    this.sfx_blip.mute    = bool
    this.sfx_ding.mute    = bool
    this.sfx_swap.mute    = bool

    this.mode_vs.mute(bool)
  }

  /** plays the sfx_land file */
  land() {
    this.sfx_land[0].play()
  }

  /** plays the swap file */
  swap() {
    this.sfx_swap.play()
  }

  /** plays the confirm file */
  confirm() {
    //this.sfx_confirm.play()
  }

  /** plays the select file */
  select() {
    this.sfx_select.play()
  }

  /** plays the blip file */
  blip() {
    this.sfx_blip.play()
  }

  /** plays the ding file */
  ding() {
    this.sfx_ding.play()
  }

  pop(index) {
    this.sfx_pop[Math.min(index,this.sfx_pop.length-1)].play()
  }

  /**
   * Plays a music sounds defined by the parameter passed in
   * @param {String} state "pause", "resume", "none", "active", "danger" or "results"
   */
  stage_music(state) {
    this.mode_vs.execute(state)
  }
}
