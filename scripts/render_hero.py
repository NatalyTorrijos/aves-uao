"""Render the delivered GLB with transparency; never edits the source model."""
import bpy
import sys
from pathlib import Path
from mathutils import Vector

root=Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
campus='--campus' in sys.argv
bpy.ops.import_scene.gltf(filepath=str(root/('public/assets/models/campus.glb' if campus else 'public/assets/models/reinita-tropical.glb'))) 
scene=bpy.context.scene
for obj in scene.objects:
    if obj.animation_data: obj.animation_data.action=None
meshes=[obj for obj in scene.objects if obj.type=='MESH' and (campus or obj.find_armature())]
for obj in scene.objects:
    if obj.type=='MESH':obj.hide_render=obj not in meshes
bpy.context.view_layer.update()
depsgraph=bpy.context.evaluated_depsgraph_get()
points=[obj.matrix_world@v.co for obj in meshes for v in obj.evaluated_get(depsgraph).data.vertices]
lo=Vector([min(p[i] for p in points) for i in range(3)])
hi=Vector([max(p[i] for p in points) for i in range(3)])
center=(lo+hi)/2
size=max(hi-lo)
bpy.ops.object.camera_add()
camera=bpy.context.object
camera.location=center+Vector((1.6,-2.8,1.25)).normalized()*size*2
camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=size*1.3
camera.data.clip_start=max(size/10000,.0001);camera.data.clip_end=size*20
scene.camera=camera;scene.render.engine='CYCLES';scene.cycles.samples=24
scene.render.resolution_x=900;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('Studio');scene.world.use_nodes=True
scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.8,.78,.73,1)
scene.world.node_tree.nodes.get('Background').inputs[1].default_value=.8
bpy.ops.object.light_add(type='AREA',location=center+Vector((size,-size,size*2)))
bpy.context.object.data.energy=70*size*size;bpy.context.object.data.size=size*2
scene.view_settings.view_transform='Standard';scene.render.film_transparent=True
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
scene.render.filepath=str(root/('public/assets/images/campus-hero.png' if campus else 'public/assets/images/reinita-hero.png'))
bpy.ops.render.render(write_still=True)
