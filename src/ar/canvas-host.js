// FullWindowCanvas owns sizing, but reparents the canvas to document.body.
// Keep that canvas inside our overlay so the camera remains visible and touchable.
export function keepCanvasInHost(module,canvas) {
  const host=canvas.parentNode
  return {...module,onAttach(args){
    try{return module.onAttach?.(args)}
    finally{if(host&&canvas.parentNode!==host)host.appendChild(canvas)}
  }}
}
