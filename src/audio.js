export function createAudio(onChange=()=>{}) {
  const audio=new Audio();audio.preload='none';let source='',label='',generation=0
  const update=()=>onChange({playing:!audio.paused,label})
  audio.addEventListener('play',update);audio.addEventListener('pause',update);audio.addEventListener('ended',update)
  return {
    play(url,name){const request=++generation;if(source!==url){audio.pause();source=url;audio.src=url}label=name;return audio.play().then(()=>true).catch(()=>{if(request===generation)onChange({playing:false,label,error:'No se pudo reproducir el canto. Toca de nuevo o revisa tu conexión.'});return false})},
    toggle(url,name){if(source===url&&!audio.paused){audio.pause();return Promise.resolve(false)}return this.play(url,name)},
    stop(){generation++;audio.pause();if(audio.readyState)audio.currentTime=0},
    isPlaying(){return !audio.paused},
  }
}
