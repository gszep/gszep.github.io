"""Copy the existing APS renderer and pinned sim2real CAD into the talk."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess

p = argparse.ArgumentParser()
p.add_argument('--aps', type=Path, required=True)
p.add_argument('--sim2real', type=Path, required=True)
a = p.parse_args()
source = a.aps / 'docs/ii/sesame-build'
output = Path(__file__).resolve().parents[1] / 'public/resilience/hero'
output.mkdir(parents=True, exist_ok=True)
records = {}

def copy(relative):
    data = (source / relative).read_bytes()
    dest = output / relative
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    records[relative] = hashlib.sha256(data).hexdigest()
    return data

copy('themes/default.css')
main = (source / 'js/main.js').read_text()
grouping = main[main.index('const JUMPERS ='):main.index('// The board itself stands')]
(output / 'component-of.mjs').write_text(grouping + '\nexport { componentOf };\n')
styles = (source / 'style.css').read_text()
(output / 'prompt.css').write_text(styles[styles.index('.hero-prompt {'):styles.index('html.hero-banner body.cover-open')])

pending = ['js/servo-scene.js', 'js/servo-instruction-model.mjs', 'js/landing-hero.mjs']
while pending:
    relative = pending.pop()
    if relative in records:
        continue
    text = copy(relative).decode()
    for name in re.findall(r'''["']((?:\./|\.\./)[^"']+\.(?:m?js|wasm)(?:\?[^"']*)?)["']''', text):
        dependency = (source / relative).parent / name.split('?')[0]
        dependency = dependency.resolve().relative_to(source.resolve()).as_posix()
        if dependency.endswith('.wasm'):
            copy(dependency)
        else:
            pending.append(dependency)

# Emscripten resolves its WASM by filename at runtime, rather than ES import.
for f in (source / 'vendor/mujoco-3.10.0').glob('*'):
    if f.is_file():
        copy(f.relative_to(source).as_posix())

scene = (source / 'js/servo-scene.js').read_text()
batch = scene.split('const batches=', 1)[1].split(';', 1)[0]
assets = re.findall(r"'([^']+)'", batch) + ['assembly.json', 'assembly.bin']
for name in assets:
    copy('assets/' + name)

# Read CAD from the exact sim2real revisions already used by this renderer.
# Verify against the published export rather than mixing geometry generations.
for name in ['internal-frame', 'variant-two-eyes', 'variant-two-eyes-six-legs']:
    report = json.loads((source / f'assets/{name}.json').read_text())
    origin = report['source']
    for part, geometry in report['geometry'].items():
        # The working checkout contains hydrated LFS bytes, not Git pointers.
        raw = (a.sim2real / origin['path'] / f'{part}.stl').read_bytes()
        assert hashlib.sha256(raw).hexdigest() == geometry['sha256']
        target = output / 'assets' / geometry['stl']
        assert raw == target.read_bytes()
        target.write_bytes(raw)

handoff = json.loads((source / 'assets/build-handoff.json').read_text())
api = handoff['firmware']['interface']
(output / 'assets/joint-api.json').write_text(json.dumps(
    {k: api[k] for k in ['joint_map', 'pulse']}, separators=(',', ':')) + '\n')
for f in (source / 'assets/licenses').rglob('*'):
    if f.is_file():
        copy(f.relative_to(source).as_posix())
shutil.copy2(a.sim2real / 'LICENSE', output / 'assets/licenses/sim2real-LICENSE')
versions = {f.relative_to(output).as_posix(): hashlib.sha256(f.read_bytes()).hexdigest()
            for f in (output / 'assets').rglob('*') if f.is_file()}
(output / 'asset-versions.json').write_text(json.dumps(versions, indent=2) + '\n')
(output / 'sources.json').write_text(json.dumps({
    'apsCommit': subprocess.check_output(['git', '-C', str(a.aps), 'rev-parse', 'HEAD'], text=True).strip(),
    'files': records,
    'description': 'Unmodified APS renderer, with CAD read from the pinned local sim2real revisions in assets/*frame.json and assets/variant-*.json.'
}, indent=2) + '\n')
print(f'Bundled {len(records)} files; {sum(f.stat().st_size for f in output.rglob("*") if f.is_file()) / 1e6:.1f} MB')
