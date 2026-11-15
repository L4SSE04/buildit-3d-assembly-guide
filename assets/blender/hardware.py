# Builds the hardware models for the 3D viewer and exports them as one glTF file.
# Run:  blender -b --factory-startup --python assets/blender/hardware.py
# Writes web/public/models/hardware.glb (what the app loads) and assets/blender/hardware.blend (to open and edit by hand).
#
# Conventions (the viewer relies on them, see web/src/viewer/parts3d.js):
# - axes are the viewer's (y up), not Blender's: the export does not convert them, so in Blender the models lie on their side
# - units are millimetres, one object per hardware kind, named like the kind ("cam_lock", "screw", ...)
# - built along +x: x > 0 is outside the board (the head), x < 0 goes into the hole; origin = the board surface
# - children named "head" scale evenly with the diameter; children named "shaft" stretch along x with the length
#   and across with the diameter; "body" keeps its size. d0 / l0 (custom properties) = the size it is drawn at
# - materials are only names (zinc, steel, beech, black, dark, plastic): the viewer swaps in its own materials
# - keep each kind under about 2,000 triangles: hundreds of pieces can be on screen at once on a phone
import bpy, bmesh, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'web', 'public', 'models', 'hardware.glb')
TAU = math.pi * 2

bpy.ops.wm.read_factory_settings(use_empty=True)
MATS = {}
def mat(name, rgb):
    if name not in MATS:
        m = bpy.data.materials.new(name)
        m.diffuse_color = (*rgb, 1)
        MATS[name] = m
    return MATS[name]
COL = {'zinc': (0.85, 0.86, 0.88), 'steel': (0.66, 0.69, 0.71), 'beech': (0.91, 0.8, 0.57), 'black': (0.16, 0.17, 0.18),
       'dark': (0.18, 0.2, 0.22), 'plastic': (0.9, 0.89, 0.87)}

def revolve(name, rows, seg, material, sharp=(), cap0=True, cap1=True):
    """A turned shape around the x axis. rows = [(x, r)] or [(x, r(u))] with u = angle; sharp = row indices with a hard
    edge (the ring is doubled so its normals split); caps close the first and last row."""
    verts, faces, rings = [], [], []
    def ring(x, r):
        start = len(verts)
        for i in range(seg):
            u = TAU * i / seg
            rr = r(u) if callable(r) else r
            verts.append((x, rr * math.cos(u), rr * math.sin(u)))
        return start
    prev = None
    for j, (x, r) in enumerate(rows):
        cur = ring(x, r)
        if prev is not None:
            for i in range(seg):
                a, b = prev + i, prev + (i + 1) % seg
                c, d = cur + (i + 1) % seg, cur + i
                faces.append((a, b, c, d))
        rings.append(cur)
        prev = ring(x, r) if j in sharp else cur
    def cap(x, r, flip):
        start = ring(x, r); centre = len(verts); verts.append((x, 0, 0))
        for i in range(seg):
            a, b = start + i, start + (i + 1) % seg
            faces.append((centre, b, a) if flip else (centre, a, b))
    if cap0 and rows[0][1] != 0: cap(*rows[0], False)
    if cap1 and rows[-1][1] != 0: cap(*rows[-1], True)
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.validate()
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=[v for v in bm.verts if abs(v.co.y) < 1e-6 and abs(v.co.z) < 1e-6], dist=1e-5)  # pointed tips
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    me.materials.append(mat(material, COL[material]))
    return me

def box(name, size, at, material):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts: v.co = (v.co.x * size[0] + at[0], v.co.y * size[1] + at[1], v.co.z * size[2] + at[2])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.materials.append(mat(material, COL[material]))
    return me

def flat(name, pts, x, material):
    """A flat decal in the y-z plane at height x, facing +x (cross recesses, arrows, hex sockets)."""
    me = bpy.data.meshes.new(name)
    n = len(pts)  # two faces back to back, so it shows from either side
    me.from_pydata([(x, y, z) for y, z in pts] * 2, [], [list(range(n)), list(range(2 * n - 1, n - 1, -1))])
    me.materials.append(mat(material, COL[material]))
    return me

def thread(x0, x1, core, depth, pitch, seg=12, tip=0.0, per=5):
    """Rows for a threaded rod from x0 (end) to x1: the radius follows a helix; tip = length of a point at x0;
    per = rows per turn (fewer = fewer triangles)."""
    rows, steps = [], max(2, int(abs(x1 - x0) / (pitch / per)))
    for k in range(steps + 1):
        x = x0 + (x1 - x0) * k / steps
        taper = 1.0 if tip <= 0 else min(1.0, (x - x0) / tip)
        rows.append((x, (lambda x, taper: lambda u: (core + depth * abs(((x / pitch + u / TAU) % 1) * 2 - 1)) * taper)(x, taper)))
    return rows

def kind(name, parts, d0=None, l0=None):
    root = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(root)
    if d0: root['d0'] = d0
    if l0: root['l0'] = l0
    for role, meshes in parts.items():
        holder = bpy.data.objects.new(f'{name}.{role}', None); holder.parent = root
        bpy.context.scene.collection.objects.link(holder)
        holder['role'] = role
        for me in meshes:
            ob = bpy.data.objects.new(me.name, me); ob.parent = holder
            bpy.context.scene.collection.objects.link(ob)
    return root

def disc_pts(r, n, rot=0):
    return [(r * math.cos(rot + TAU * i / n), r * math.sin(rot + TAU * i / n)) for i in range(n)]

# ---- wooden dowel: fluted, chamfered ends; 40 % goes into the first board
def dowel():
    L, R, f = 30.0, 4.0, 0.4
    flute = lambda u: R - f * max(0.0, math.cos(8 * u)) ** 8
    x0, x1 = -L * 0.4, L * 0.6
    rows = [(x0, R - 0.9), (x0 + 0.9, flute)] + [(x0 + 0.9 + (L - 1.8) * k / 6, flute) for k in range(1, 6)] + [(x1 - 0.9, flute), (x1, R - 0.9)]
    return kind('dowel', {'shaft': [revolve('dowel', rows, 40, 'beech')]}, d0=8, l0=30)

# ---- cam screw (the pin a cam lock grabs): thread into the first board, hex collar, shank, neck, ball head
def cam_screw():
    meshes = [revolve('cs.thread', thread(-11, 0, 2.2, 0.55, 1.8, seg=12, tip=1.2), 12, 'steel', cap1=False)]
    meshes.append(revolve('cs.collar', [(0, 5.2), (1.6, 5.2)], 6, 'zinc', sharp=(0, 1)))
    meshes.append(revolve('cs.shank', [(1.6, 3.3), (22.6, 3.3), (23.6, 2.4), (27.4, 2.4)], 20, 'zinc', sharp=(0,)))
    ball = [(27.4 + 8.4 * k / 10, 4.4 * math.sqrt(max(0.0, 1 - ((k / 10) * 2 - 1) ** 2))) for k in range(11)]
    meshes.append(revolve('cs.ball', ball, 20, 'zinc'))
    return kind('cam_screw', {'body': meshes})

# ---- cam lock: round housing in the broad face, slot and arrow on top, opening on the side for the screw head
def cam_lock():
    top = 0.6
    body = revolve('cl.body', [(-12, 7.1), (-11.6, 7.5), (top - 0.5, 7.5), (top, 7.0)], 32, 'zinc', sharp=(2,))
    slot = box('cl.slot', (0.2, 1.4, 10.5), (top + 0.05, 0, 0), 'dark')
    arrow = flat('cl.arrow', [(4.0, 0), (2.0, 2.0), (2.0, -2.0)], top + 0.06, 'dark')
    notch = box('cl.notch', (6.0, 3.0, 7.5), (-5.0, 6.4, 0), 'dark')
    return kind('cam_lock', {'body': [body, slot, arrow, notch]})

# ---- wood screw: pan head with a cross recess, sharp threaded shank
def screw():
    head = revolve('sc.head', [(0, 3.6), (0.7, 3.6), (1.3, 3.2), (1.6, 2.6), (1.7, 0)], 24, 'zinc', sharp=(0,), cap1=False)
    c1 = box('sc.x1', (0.2, 4.0, 0.8), (1.62, 0, 0), 'dark')
    c2 = box('sc.x2', (0.2, 0.8, 4.0), (1.62, 0, 0), 'dark')
    shaft = revolve('sc.shaft', thread(-16, 0, 1.35, 0.55, 1.5, seg=12, tip=3.2), 12, 'steel', cap1=False)
    return kind('screw', {'head': [head, c1, c2], 'shaft': [shaft]}, d0=3.8, l0=16)

# ---- Allen bolt: round black head with a hex socket, threaded shaft
def allen_bolt():
    head = revolve('ab.head', [(0, 5.1), (5.4, 5.1), (6.0, 4.5), (6.0, 0)], 28, 'black', sharp=(0,), cap1=False)
    sock = flat('ab.socket', disc_pts(1.9, 6, math.pi / 6), 6.03, 'dark')
    shaft = revolve('ab.shaft', [(-30, 2.4)] + thread(-29.6, 0, 2.55, 0.45, 1.0, seg=10, per=3)[1:], 10, 'steel', cap1=False)
    return kind('allen_bolt', {'head': [head, sock], 'shaft': [shaft]}, d0=6, l0=30)

# ---- drawer knob: mushroom head on a neck, with its screw stub
def knob():
    r = 15.0
    prof = [(0, 4.5), (3.0, 4.2), (7.0, 4.8), (11.0, 9.5), (14.5, 13.6), (17.5, r), (20.0, 14.4), (22.5, 11.5), (24.3, 6.5), (25.0, 0)]
    head = revolve('kn.head', prof, 36, 'zinc', cap1=False)
    stub = revolve('kn.stub', thread(-12, 0, 1.6, 0.4, 1.4, seg=10, tip=1.5), 10, 'steel', cap1=False)
    return kind('knob', {'head': [head, stub]}, d0=30, l0=25)

# ---- adjustable foot: threaded stud into the board, black pad with a knurled rim
def foot():
    R = 16.0
    knurl = lambda u: R - 0.9 * max(0.0, math.cos(24 * u)) ** 2
    pad = revolve('ft.pad', [(0, 9.0), (0.8, R - 1.5), (1.6, knurl), (10.0, knurl), (11.4, R - 1.2), (12.0, 10.0), (12.0, 0)], 72, 'black', cap1=False)
    stud = revolve('ft.stud', thread(-20, 0, 3.55, 0.6, 1.25, seg=10, tip=0.8, per=3), 10, 'steel', cap1=False)
    return kind('foot', {'head': [pad], 'shaft': [stud]}, d0=32, l0=20)

# ---- cover cap: low dome over a hole or bolt head, with the plug that holds it
def cap():
    R = 7.0
    dome = revolve('cp.dome', [(0, R), (0.9, R), (1.8, R * 0.86), (2.5, R * 0.55), (2.8, 0)], 28, 'plastic', sharp=(0,), cap1=False)
    plug = revolve('cp.plug', [(-6, 2.6), (-5.4, 3.2), (0, 3.2)], 16, 'plastic', cap1=False)
    return kind('cap', {'head': [dome, plug]}, d0=14)

for make in (dowel, cam_screw, cam_lock, screw, allen_bolt, knob, foot, cap):
    make()

# report the triangle budget per kind
for root in [o for o in bpy.data.objects if o.parent is None]:
    tris = sum(sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in bpy.data.objects if ob.type == 'MESH' and ob.parent and ob.parent.parent == root)
    print(f'{root.name:12s} {tris:6d} triangles')

os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'hardware.blend'))
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_yup=False, export_extras=True,
                          export_apply=True, export_normals=True, export_materials='EXPORT', export_texcoords=False)
print('wrote', os.path.abspath(OUT), os.path.getsize(OUT), 'bytes')
