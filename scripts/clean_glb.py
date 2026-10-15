"""Lossless, conservative single-scene extraction for the received GLB files.

No remeshing, texture re-encoding, transform changes, naming or animation changes.
Unsupported extensions fail closed instead of silently dropping references.
"""
import argparse, copy, hashlib, json, struct
from pathlib import Path

SUPPORTED_EXTENSIONS = {'KHR_materials_specular'}
ARRAYS = ('nodes','meshes','skins','cameras','materials','textures','images','samplers','accessors','bufferViews')

def read_glb(path):
    raw=Path(path).read_bytes()
    if len(raw)<20: raise ValueError('Truncated GLB')
    magic,version,total=struct.unpack_from('<4sII',raw)
    if magic!=b'glTF' or version!=2 or total!=len(raw): raise ValueError('Invalid GLB 2.0 envelope')
    offset=12;document=None;binary=b''
    while offset<len(raw):
        length,kind=struct.unpack_from('<II',raw,offset);offset+=8
        if offset+length>len(raw):raise ValueError('Truncated chunk')
        chunk=raw[offset:offset+length];offset+=length
        if kind==0x4e4f534a:document=json.loads(chunk)
        elif kind==0x004e4942:binary=chunk
        else:raise ValueError('Unsupported GLB chunk')
    if document is None:raise ValueError('Missing JSON')
    if len(document.get('buffers',[]))!=1 or 'uri' in document['buffers'][0]:raise ValueError('Expected one embedded buffer')
    if set(document.get('extensionsUsed',[])) - SUPPORTED_EXTENSIONS:raise ValueError('Unsupported extension')
    return document,binary,raw

def view_bytes(g,b,i):
    v=g['bufferViews'][i];offset=v.get('byteOffset',0)
    if v.get('buffer',0)!=0 or offset+v['byteLength']>len(b):raise ValueError('Invalid bufferView')
    return b[offset:offset+v['byteLength']]

def texture_infos(value):
    if isinstance(value,dict):
        for key,item in value.items():
            if key.endswith('Texture') and isinstance(item,dict) and 'index' in item:yield item
            yield from texture_infos(item)
    elif isinstance(value,list):
        for item in value:yield from texture_infos(item)

def clean(g,b):
    selected=g.get('scene',0);scene=g['scenes'][selected]
    used={key:set() for key in ARRAYS}
    def mark(key,i):
        if i<0 or i>=len(g.get(key,[])):raise ValueError(f'Invalid {key} reference {i}')
        used[key].add(i)
    def node(i):
        if i in used['nodes']:return
        mark('nodes',i)
        for child in g['nodes'][i].get('children',[]):node(child)
    for root in scene['nodes']:node(root)
    for i in used['nodes']:
        for field,key in [('mesh','meshes'),('skin','skins'),('camera','cameras')]:
            if field in g['nodes'][i]:mark(key,g['nodes'][i][field])
    for i in used['skins']:
        skin=g['skins'][i]
        if any(j not in used['nodes'] for j in skin['joints']):raise ValueError('Skin joint outside selected scene')
        if 'skeleton' in skin and skin['skeleton'] not in used['nodes']:raise ValueError('Skeleton outside selected scene')
        if 'inverseBindMatrices' in skin:mark('accessors',skin['inverseBindMatrices'])
    for i in used['meshes']:
        for p in g['meshes'][i]['primitives']:
            for a in p['attributes'].values():mark('accessors',a)
            for target in p.get('targets',[]):
                for a in target.values():mark('accessors',a)
            if 'indices' in p:mark('accessors',p['indices'])
            if 'material' in p:mark('materials',p['material'])
    animations=[]
    for animation in g.get('animations',[]):
        channels=[c for c in animation['channels'] if c['target'].get('node') in used['nodes']]
        if not channels:continue
        samplers=sorted({c['sampler'] for c in channels});mapping={old:new for new,old in enumerate(samplers)}
        a=copy.deepcopy(animation);a['channels']=copy.deepcopy(channels);a['samplers']=[copy.deepcopy(animation['samplers'][i]) for i in samplers]
        for c in a['channels']:c['sampler']=mapping[c['sampler']]
        for s in a['samplers']:
            mark('accessors',s['input']);mark('accessors',s['output'])
        animations.append(a)
    for i in used['materials']:
        for info in texture_infos(g['materials'][i]):mark('textures',info['index'])
    for i in used['textures']:
        t=g['textures'][i]
        if 'source' in t:mark('images',t['source'])
        if 'sampler' in t:mark('samplers',t['sampler'])
    for i in used['images']:
        image=g['images'][i]
        if 'uri' in image:raise ValueError('External/data-URI images are not handled')
        mark('bufferViews',image['bufferView'])
    for i in used['accessors']:
        a=g['accessors'][i]
        if 'bufferView' in a:mark('bufferViews',a['bufferView'])
        for part in a.get('sparse',{}).values():
            if isinstance(part,dict) and 'bufferView' in part:mark('bufferViews',part['bufferView'])
    maps={key:{old:new for new,old in enumerate(sorted(used[key]))} for key in ARRAYS}
    result={k:copy.deepcopy(v) for k,v in g.items() if k not in (*ARRAYS,'scenes','scene','animations','buffers')}
    result['scene']=0;result['scenes']=[copy.deepcopy(scene)]
    result['scenes'][0]['nodes']=[maps['nodes'][i] for i in scene['nodes']]
    for key in ARRAYS:
        if used[key]:result[key]=[copy.deepcopy(g[key][i]) for i in sorted(used[key])]
    for n in result['nodes']:
        if 'children'in n:n['children']=[maps['nodes'][i] for i in n['children']]
        for field,key in [('mesh','meshes'),('skin','skins'),('camera','cameras')]:
            if field in n:n[field]=maps[key][n[field]]
    for s in result.get('skins',[]):
        s['joints']=[maps['nodes'][i] for i in s['joints']]
        if 'skeleton'in s:s['skeleton']=maps['nodes'][s['skeleton']]
        if 'inverseBindMatrices'in s:s['inverseBindMatrices']=maps['accessors'][s['inverseBindMatrices']]
    for m in result.get('meshes',[]):
        for p in m['primitives']:
            p['attributes']={k:maps['accessors'][v] for k,v in p['attributes'].items()}
            if 'indices'in p:p['indices']=maps['accessors'][p['indices']]
            if 'material'in p:p['material']=maps['materials'][p['material']]
            if 'targets'in p:p['targets']=[{k:maps['accessors'][v] for k,v in t.items()} for t in p['targets']]
    for m in result.get('materials',[]):
        for info in texture_infos(m):info['index']=maps['textures'][info['index']]
    for t in result.get('textures',[]):
        if 'source'in t:t['source']=maps['images'][t['source']]
        if 'sampler'in t:t['sampler']=maps['samplers'][t['sampler']]
    for im in result.get('images',[]):im['bufferView']=maps['bufferViews'][im['bufferView']]
    for a in result.get('accessors',[]):
        if 'bufferView'in a:a['bufferView']=maps['bufferViews'][a['bufferView']]
        for part in a.get('sparse',{}).values():
            if isinstance(part,dict) and 'bufferView'in part:part['bufferView']=maps['bufferViews'][part['bufferView']]
    if animations:
        for a in animations:
            for c in a['channels']:c['target']['node']=maps['nodes'][c['target']['node']]
            for s in a['samplers']:
                s['input']=maps['accessors'][s['input']];s['output']=maps['accessors'][s['output']]
        result['animations']=animations
    packed=bytearray()
    for old in sorted(used['bufferViews']):
        while len(packed)%4:packed.append(0)
        v=result['bufferViews'][maps['bufferViews'][old]];v['buffer']=0;v['byteOffset']=len(packed)
        packed.extend(view_bytes(g,b,old))
    result['buffers']=[{**copy.deepcopy(g['buffers'][0]),'byteLength':len(packed)}]
    return result,bytes(packed),maps

def write_glb(path,g,b):
    encoded=json.dumps(g,ensure_ascii=False,separators=(',',':')).encode('utf-8')
    encoded+=b' '*((-len(encoded))%4);padded=b+b'\0'*((-len(b))%4)
    Path(path).write_bytes(struct.pack('<4sII',b'glTF',2,28+len(encoded)+len(padded))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(padded),0x004e4942)+padded)

def verify_exact(source_g,source_b,g,b,maps):
    # Raw storage comparisons include vertex attributes, weights, indices, matrices,
    # images and any animation values. No re-encoding or quantization is allowed.
    for old,new in maps['bufferViews'].items():
        if view_bytes(source_g,source_b,old)!=view_bytes(g,b,new):raise ValueError('Payload changed')
    if len(g['scenes'])!=1:raise ValueError('Expected one scene')
    for old,new in maps['nodes'].items():
        a=source_g['nodes'][old];c=g['nodes'][new]
        for key in ('name','matrix','translation','rotation','scale','weights','extras','extensions'):
            if a.get(key)!=c.get(key):raise ValueError(f'Node property changed: {key}')
        if [maps['nodes'][x] for x in a.get('children',[])]!=c.get('children',[]):raise ValueError('Hierarchy changed')
    for key in ('materials','meshes','skins','textures','images','accessors','samplers'):
        if len(g.get(key,[]))!=len(maps[key]):raise ValueError('Resource count mismatch')

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--input',default='AvesRA');parser.add_argument('--output',default='recursos-limpios');args=parser.parse_args()
    source=Path(args.input).resolve();dest=Path(args.output).resolve()
    if dest==source or source in dest.parents:raise ValueError('Output must be separate from originals')
    dest.mkdir(parents=True,exist_ok=True);report=[]
    for path in sorted(source.glob('*.glb')):
        target=dest/path.name
        if target.exists():raise FileExistsError(f'Will not overwrite {target}')
        g,b,raw=read_glb(path);cleaned,packed,maps=clean(g,b);write_glb(target,cleaned,packed)
        check_g,check_b,check_raw=read_glb(target);verify_exact(g,b,check_g,check_b,maps)
        if path.read_bytes()!=raw:raise ValueError('Source changed')
        record={'file':path.name,'originalBytes':len(raw),'cleanBytes':len(check_raw),'savedPercent':round(100*(1-len(check_raw)/len(raw)),2),'originalSha256':hashlib.sha256(raw).hexdigest(),'cleanSha256':hashlib.sha256(check_raw).hexdigest(),'sceneName':cleaned['scenes'][0].get('name'),'nodes':len(cleaned['nodes']),'meshes':len(cleaned.get('meshes',[])),'skins':len(cleaned.get('skins',[])),'animations':len(cleaned.get('animations',[])),'images':len(cleaned.get('images',[])),'exactPayloadPreserved':True}
        report.append(record);print(json.dumps(record,ensure_ascii=False),flush=True)
    (dest/'informe-tecnico.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')

if __name__=='__main__':main()
