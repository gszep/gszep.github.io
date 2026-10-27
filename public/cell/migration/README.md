# Light-controlled migration: qualitative first increment

This is a runnable **mechanism demo**, not a fit to microscopy, a calibrated
HL-60 simulator, or a reproduction of an experimental trajectory. All quantities
are dimensionless. The chain is light → effective PIP3 → Rac-like activity and
delayed local inhibition → effective actin assembly/turnover → boundary motion
against an effective substrate drag. No centroid trajectory or reversal is prescribed.

## Run and inspect

From the repository root:

```sh
npm run start:migration
# Open http://127.0.0.1:5501/migration/
npm run test:migration
```

The demo needs only a static HTTP server and a modern browser with Canvas 2D;
it has no package dependencies or WebGPU requirement. Python 3 provides the server;
Node runs the tests. Stop the local server with Ctrl-C. `npm start` also serves
`/migration/`. `npm run build` includes the demo under `dist/migration/`.

- **Local:** click/drag or change angle. A cell-relative sector follows the cell's
  position with a fixed laboratory angle; it does not track its polarity. A world
  spot stays at the clicked coordinates. The cell can leave a world spot behind.
- **Paired:** two identical, opposite cell-relative sectors. From the exact
  symmetric initial condition this is a numerical bias control, not a simulation
  of biological winner-take-all selection.
- **Global:** exactly uniform light; angle is ignored. **No light** removes input.
- **Protocols:** local → 90° at t=40, or local → global at t=40. These schedule only
  the external input, never movement. Selecting a protocol restarts the run.
  Manual stimulus manipulation cancels the protocol; parameter changes do not.
- **Local inhibition = 0** ablates inhibitor action (the inactive inhibitor field
  remains visible). **Coupling = 0** retains signaling and actin but removes active
  motion. Turnover and adaptation sliders have relative, not molecular, units.
- **Reset run** retains current parameters/input and pause state; a protocol starts
  its initial input again. **Defaults** restores all model/input defaults.
- The demo starts **running with a world-fixed camera**, at 2 model units per
  second. The dashed starting outline and START marker stay at the initial world
  position; the bright trail records actual centroid motion. Play/Pause and its
  status are above the canvas. **Follow cell (keeps it centered)** is optional:
  the cell then stays at screen center while its world coordinates still change.
  **Recenter view** moves only the camera; an explicit notice appears when the
  centroid leaves a fixed view. Defaults also restores the fixed camera and 2-unit/s rate.
- The green fill/boundary encodes effective actin, **not drawn filaments**. Outer
  rings are PIP3-like, Rac-like and delayed inhibitor, from inner to outer. The blue
  boundary halo is input. The arrow is the actin polarity diagnostic. Follow-camera
  motion does not modify simulation coordinates; grid and trail are world-fixed.
- Export downloads recent sampled diagnostics (up to 3,000 samples), the control
  event log, current parameters and boundary state as JSON. It is an inspection
  record, not a complete checkpoint/replay format. `window.migration.model` and
  `window.migration.diagnostics()` expose the same model used by the tests.

## Equations and choices

The cell is an initially circular, counterclockwise 64-vertex polygon of radius 10. Four bounded **intensive activities** live on its moving perimeter: P (PIP3-like),
R (Rac-like), H (inhibitor) and F (effective assembled actin). They are not molecular
numbers and remeshing does not conserve molecule counts. All start at zero, without
random noise; runs are deterministic and need no seed.

With perimeter-weighted mean `mean(R)` and arclength Laplacian `lap`, the default
reaction equations in `model.mjs` are:

```text
dP/dt = (L - P) / tauP + 0.15 lap(P)
dR/dt = [2P + b R²/(0.2² + R²)] (1-R)/(1 + 2 mean(R))
        - (0.5 + h H) R + 0.12 lap(R)
dH/dt = (R-H)/tauH + 0.02 lap(H)
dF/dt = kpoly R (1-F) - kturn F
```

`tauP=0.8`, `b=0.7`, `tauH=12`, `h=4`, `kpoly=0.7`, `kturn=0.35` are illustrative
relative parameters. They encode fast input recruitment, positive reinforcement,
slower local negative feedback, and intermediate assembly/turnover. The denominator
is a reduced global competition term, **not a conserved cytosolic Rac pool or a
measured membrane-tension-to-Rac pathway**. Saturating assembly is an effective
finite-capacity closure. There is no explicit monomer pool, branching or treadmilling.

Input is `L=0` (off), `L=intensity` (global), a circular angular bump
`L=intensity exp[(cos(theta-angle)-1)/width²]` (cell-relative local), or a Gaussian
in world coordinates. The paired input is the maximum of equal opposite angular
bumps. Width controls angular width or world-spot radius (10 × width), as indicated
by the selected frame. These are synthetic masks; this increment does not load
recorded experimental stimulus masks.

Each boundary vertex moves in its local outward normal `n`:

```text
v_i = coupling F_i + tension (curvature_vector_i · n_i)
pressure = -sum(v_i ds_i) / sum(ds_i)
dx_i/dt = (v_i + pressure) n_i
```

Default coupling is 2 and tension is 8. Curvature has negative outward-normal
component on a convex boundary, so tension contracts and smooths it. Pressure
enforces zero instantaneous area rate. A small area projection after integration
removes polygon/remeshing error **about the actual centroid**, not a target position.
The net asymmetric protrusion moves the cell through the vertex dynamics themselves.
Effective drag is absorbed into the coefficients. This active traction closure assumes
substrate-anchored actin can exert force on the boundary: it is an open, dissipative
cell–substrate system, not a force-free swimmer or resolved hydrodynamics.

Forward Euler uses dt=0.02 for the supported 64-vertex/UI ranges. Equal-arclength
remeshing interpolates the activities with zero-mean tangential redistribution;
pinning the first vertex would introduce a directional transport artifact.
Clipping keeps activities within [0,1]. The browser uses fixed substeps and caps work
per frame; background-tab time is discarded. Increasing resolution/stiffness beyond
the supported settings requires smaller timesteps. The refinement check uses 96
vertices with dt=0.005. Arbitrary parameter changes through the console are not covered
by the stability guarantees of the UI tests.

## Evidence vs reduced-model assumptions

The experimental motivation is Town & Weiner (2023), _Local negative feedback of
Rac activity at the leading edge underlies a pilot pseudopod-like program for
amoeboid cell guidance_, PLOS Biology, DOI **10.1371/journal.pbio.3002307**.
Their opto-PI3K manipulations and local Rac feedback motivate the direction of the
couplings; they do not identify our numerical rates or force law. Their local-to-global
experiment reverses **turning direction** after a laterally retargeted input. Our fixed-angle
local protocol and small subsequent counter-motion are a different, simpler test.

Algorta, Town, Weiner & Edelstein-Keshet (2026), _Investigating local negative feedback
of Rac activity by mathematical models and cell-motility simulations_, iScience
29(2), 114641, DOI **10.1016/j.isci.2026.114641**, is an existing modeling baseline,
not an independent experimental dataset. This increment does not import its code,
fitting targets, fitted parameters or equations. Comparison with that baseline remains
future work. No private experimental assets are included here.

## Observed controls (12 October 2026)

`npm run test:migration` runs two independent test files with concurrency explicitly
bounded at 2. Sequential phases within each test are necessary: the post-switch state
must inherit the preconditioning history. Eight tests cover:

| Control                                                                                                           | Observed with defaults                                                                                |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Dark, global, paired from symmetric initial state, t=60                                                           | Centroid drift and actin polarity below 1e-8; illuminated cases still assemble actin                  |
| Local right, t=40                                                                                                 | Centroid x≈15.26; positive actin polarity and x velocity                                              |
| Switch input upward at t=40; observe t=90                                                                         | Centroid ≈(14.17,21.28), velocity ≈(-0.002,0.438)                                                     |
| Polymerization=0 or coupling=0                                                                                    | Signaling persists; no active migration                                                               |
| Local → global at t=40                                                                                            | Minimum x velocity ≈−0.070, then speed below 0.001 by t=80                                            |
| Same protocol, inhibition=0                                                                                       | No counter-motion above numerical noise; local mean Rac substantially higher                          |
| Static world spot, then relocate                                                                                  | Motion responds to spatially sampled input and changes direction                                      |
| Sixteen combinations of turnover/inhibition/width/coupling endpoints, fast adaptation (tauH=2), protocol switches | Finite bounded fields, simple/non-self-intersecting boundary, well-spaced nodes and area preservation |
| Deterministic replay, 90° rotation                                                                                | Repeated runs agree exactly; direction rotates with stimulus                                          |
| Timestep/mesh refinement, t=40                                                                                    | Displacement 15.256 (64, dt=.02), 15.255 (64, dt=.01), 15.314 (96, dt=.005)                           |
| Long local-input run to t=400 and reset                                                                           | Stable area/boundary; reset recovers initial state                                                    |

Area is projected to its initial value, so area preservation is a numerical check,
**not a prediction of biological area regulation**. The local-to-global counter-motion
is small and transient. It does not establish experimental turning reversal or robustness
across cells, parameter ranges, noise or pre-existing polarity. At these settings the
boundary deforms only mildly and stays close to circular. No claims about detailed
HL-60 morphology, absolute force, fluorescent intensity or experimental trajectories follow.

## Relationship to the filament engine

This entry point lives beside the original cell prototype to keep the model and
its controls inspectable while reusing the project's local-field → polymerization
→ boundary philosophy. It currently uses **none of the original WebGPU mechanical
kernels**, and is not a Microcosmos/JAX/differentiable integration.

The concrete next coupling path is the original `src/shaders/simulate.wgsl`
`bind_actin_monomer`, `unbind_min_pole`, `update_actin_polymer_position` and membrane
steric/constraint passes. A spatial extension of R can drive the existing
`CONNECTION_PROBABILITY` parameter-field channel; H remains a delayed local field.
Then actual filament growth, turnover and membrane contact should replace the
effective `coupling F` traction, with substrate attachment and area control retained
as explicit mechanics. Existing prey/food and manually prescribed curvature controls
would need an isolated migration configuration before making causal claims.

Missing biology includes basal spontaneous migration, noise-driven symmetry breaking,
front/back sensitivity differences, a persistent uropod, actin topology, adhesion
kinetics and mechanochemical global feedback. The symmetric controls intentionally
stay symmetric; real previously polarized migrating cells need not do so.

### Implementation validation

On 12 October 2026 the eight Node checks passed in approximately 15 seconds with two
workers; the webpack build took approximately 6 seconds, followed by static-asset
assembly. These are local timings, not CI measurements. The numerical suite is the
test critical path. Chrome/CDP checks exercised pause/reset/defaults, both scheduled
protocols, manual world-spot placement, paired-mode frame switching, parameter changes
and JSON download. Desktop and 390-pixel mobile screenshots were inspected; no browser
JavaScript errors or horizontal mobile overflow were observed. Browser tooling is
optional and is not required to run the model or its headless checks.
