"""Independent resolved-graph comparison of the active scene before/after cleaning."""
import copy,hashlib,json
from pathlib import Path
from clean_glb import read_glb,view_bytes

def fingerprint(g,b):
    paths={}
    def walk(i,path):
        paths[i]=path
        for j,c in enumerate(g['nodes'][i].get('children',[])):walk(c,(*path,j))
    scene=g['scenes'][g.get('scene',0)]
    for j,i in enumerate(scene['nodes']):walk(i,(j,))
    def resolve(key,i):
        item=copy.deepcopy(g[key][i])
        if key=='nodes':
            for field,array in [('mesh','meshes'),('camera','cameras'),('skin','skins')]:
                if field in item:item[field]=resolve(array,item[field])
            if 'children'in item:item['children']=[resolve('nodes',j) for j in item['children']]
        elif key=='skins':
            item['joints']=[paths[j] for j in item['joints']]
            if 'skeleton'in item:item['skeleton']=paths[item['skeleton']]
            if 'inverseBindMatrices'in item:item['inverseBindMatrices']=resolve('accessors',item['inverseBindMatrices'])
        elif key=='meshes':
            for p in item['primitives']:
                p['attributes']={k:resolve('accessors',v) for k,v in p['attributes'].items()}
                for t in p.get('targets',[]):
                    for k,v in t.items():t[k]=resolve('accessors',v)
                if 'indices'in p:p['indices']=resolve('accessors',p['indices'])
                if 'material'in p:p['material']=resolve('materials',p['material'])
        elif key=='materials':
            def textures(x):
                if isinstance(x,dict):
                    for k,v in x.items():
                        if k.endswith('Texture') and isinstance(v,dict) and 'index'in v:v['index']=resolve('textures',v['index'])
                        else:textures(v)
                elif isinstance(x,list):
                    for v in x:textures(v)
            textures(item)
        elif key=='textures':
            for field,array in [('source','images'),('sampler','samplers')]:
                if field in item:item[field]=resolve(array,item[field])
        elif key in ('images','accessors'):
            if 'bufferView'in item:item['bufferView']=resolve('bufferViews',item['bufferView'])
            for part in item.get('sparse',{}).values():
                if isinstance(part,dict) and 'bufferView'in part:part['bufferView']=resolve('bufferViews',part['bufferView'])
        elif key=='bufferViews':
            item.pop('buffer',None);item.pop('byteOffset',None)
            item['payloadSha256']=hashlib.sha256(view_bytes(g,b,i)).hexdigest()
        return item
    result=copy.deepcopy(scene);result['nodes']=[resolve('nodes',i) for i in scene['nodes']]
    return hashlib.sha256(json.dumps(result,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()

if __name__=='__main__':
    results=[]
    for source in sorted(Path('AvesRA').glob('*.glb')):
        g,b,raw=read_glb(source);h,c,cleaned=read_glb(Path('recursos-limpios')/source.name)
        before=fingerprint(g,b);after=fingerprint(h,c)
        if before!=after:raise ValueError('Active scene differs: '+source.name)
        results.append({'file':source.name,'activeSceneFingerprint':before,'equivalent':True})
        print(source.name,'active scene equivalent',flush=True)
    Path('recursos-limpios/verificacion-escenas.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
