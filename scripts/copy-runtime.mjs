import {cp, mkdir} from 'node:fs/promises'
// Preserve the complete engine directory, including lazy-loaded SLAM chunks and notices.
for (const [pkg, folder] of [['engine-binary', 'xr'], ['xrextras', 'xrextras'], ['landing-page', 'landing-page']]) {
  const dest = `public/vendor/${folder}`
  await mkdir(dest, {recursive: true})
  await cp(`node_modules/@8thwall/${pkg}/dist`, dest, {recursive: true})
  await cp(`node_modules/@8thwall/${pkg}/LICENSE`, `${dest}/LICENSE`)
}
await mkdir('docs/licenses', {recursive:true})
for (const [pkg,name] of [['@8thwall/engine-binary','8thwall-engine'],['@8thwall/xrextras','xrextras'],['@8thwall/landing-page','landing-page'],['three','three']]) {
  await cp(`node_modules/${pkg}/LICENSE`, `docs/licenses/${name}.txt`)
}
await cp('node_modules/vite/LICENSE.md', 'docs/licenses/vite.txt')
await mkdir('public/licenses', {recursive:true})
await cp('docs/licenses', 'public/licenses', {recursive:true})
console.log('Runtime oficial copiado a public/vendor, sin modificar sus binarios.')
