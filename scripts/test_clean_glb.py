import copy, tempfile, unittest
from pathlib import Path
from clean_glb import clean, read_glb, write_glb, verify_exact, view_bytes

class CleanGLBTests(unittest.TestCase):
    def fixture(self):
        return {
            'asset':{'version':'2.0'},'extensionsUsed':['KHR_materials_specular'],
            'scene':1,'scenes':[{'name':'discard','nodes':[0]},{'name':'keep','nodes':[1]}],
            'nodes':[{'name':'other','mesh':0},{'name':'bird','mesh':1,'skin':0,'children':[2],'translation':[1,2,3]},{'name':'joint','rotation':[0,0,0,1]}],
            'meshes':[{'primitives':[{'attributes':{'POSITION':0},'material':0}]},{'primitives':[{'attributes':{'POSITION':1},'material':1}]}],
            'skins':[{'joints':[2],'skeleton':2,'inverseBindMatrices':2}],
            'materials':[{'name':'unused'},{'name':'same','pbrMetallicRoughness':{'baseColorTexture':{'index':1},'metallicFactor':0.2},'extensions':{'KHR_materials_specular':{'specularTexture':{'index':1},'specularFactor':0.6}}}],
            'textures':[{'source':0},{'source':1,'sampler':0}],
            'images':[{'bufferView':0},{'bufferView':3,'mimeType':'image/png'}],
            'samplers':[{'magFilter':9729}],
            'accessors':[{'bufferView':0,'componentType':5126,'count':1,'type':'SCALAR'},{'bufferView':1,'componentType':5126,'count':1,'type':'SCALAR'},{'bufferView':2,'componentType':5126,'count':1,'type':'SCALAR'}],
            'bufferViews':[{'buffer':0,'byteOffset':i*4,'byteLength':4} for i in range(4)],
            'buffers':[{'byteLength':16}]
        }, b'BAD!GEOMSKINIMAG'

    def test_extracts_default_scene_and_preserves_material_skin_and_binary(self):
        g,b=self.fixture();out,packed,maps=clean(g,b)
        self.assertEqual(out['scenes'],[{'name':'keep','nodes':[0]}])
        self.assertEqual(out['nodes'][0]['translation'],[1,2,3])
        self.assertEqual(out['skins'][0]['joints'],[1])
        self.assertEqual(out['materials'][0]['extensions']['KHR_materials_specular'],{'specularTexture':{'index':0},'specularFactor':0.6})
        self.assertEqual(packed,b'GEOMSKINIMAG')
        self.assertEqual(out['textures'][0]['source'],0)
        self.assertEqual(out['accessors'][0]['bufferView'],0)
        verify_exact(g,b,out,packed,maps)
        self.assertEqual(len(g['scenes']),2)

    def test_roundtrip_and_four_byte_alignment(self):
        g,b=self.fixture();g['bufferViews'][3]['byteLength']=3
        out,packed,maps=clean(g,b)
        Path('tmp').mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir='tmp') as folder:
            target=Path(folder)/'model.glb';write_glb(target,out,packed);actual,blob,_=read_glb(target)
            verify_exact(g,b,actual,blob,maps)
            self.assertTrue(all(v['byteOffset']%4==0 for v in actual['bufferViews']))
            self.assertEqual(view_bytes(actual,blob,2),b'IMA')

    def test_rejects_skin_with_joint_outside_selected_scene(self):
        g,b=self.fixture();g['skins'][0]['joints']=[0]
        with self.assertRaisesRegex(ValueError,'joint outside'):clean(g,b)

    def test_animation_target_and_sampler_references_follow_remapping(self):
        g,b=self.fixture();g['animations']=[{'name':'keep-animation','samplers':[{'input':1,'output':2}],'channels':[{'sampler':0,'target':{'node':2,'path':'translation'}}]}]
        out,_,_=clean(g,b)
        self.assertEqual(out['animations'][0]['channels'][0]['target']['node'],1)
        self.assertEqual(out['animations'][0]['samplers'][0],{'input':0,'output':1})

    def test_guard_rejects_changed_payload(self):
        g,b=self.fixture();out,packed,maps=clean(g,b)
        with self.assertRaisesRegex(ValueError,'Payload changed'):verify_exact(g,b,out,b'FAIL'+packed[4:],maps)

if __name__=='__main__':unittest.main()
