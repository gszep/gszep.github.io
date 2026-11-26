"use strict";
(self["webpackChunkwebgpu_collab_stringed_entities"] = self["webpackChunkwebgpu_collab_stringed_entities"] || []).push([["src_telemetry_worker_ts"],{

/***/ "./src/occupancy.ts":
/*!**************************!*\
  !*** ./src/occupancy.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   polygonBondCrossing: () => (/* binding */ polygonBondCrossing),
/* harmony export */   polygonLoops: () => (/* binding */ polygonLoops),
/* harmony export */   polygonOccupancy: () => (/* binding */ polygonOccupancy)
/* harmony export */ });
// Conservative y-band edge index. Predicates remain exact; long edges are
// retained in a global list and long bond queries fall back to all edges.
// No boundary/collision is discarded to improve diagnostic latency.
// With `links: true` adjacency comes from the membrane `tail` links (word 6)
// instead of index order, so fusion/scission can re-link the same buffer into
// several closed loops. Degenerate self-links and links without a destination
// vertex carry no edge and are skipped; every edge that exists is indexed.
const BAND = 4;
const TAIL_WORD = 6; // segment word 6 holds `tail`: the next vertex along the ring
const HEAD_WORD = 7; // segment word 7 holds `head`: the previous vertex along the ring
function edgeIndex(membrane, stride, reverse = false, options) {
    const n = membrane.length / stride;
    const linked = options?.links ? new Uint32Array(membrane.buffer, membrane.byteOffset, membrane.length) : null;
    const edges = [], rows = new Map(), wide = [];
    for (let i = 0; i < n; i++) {
        const j = linked ? linked[i * stride + TAIL_WORD] : (i + (reverse ? n - 1 : 1)) % n;
        if (linked && (j === i || j >= n))
            continue; // free vertex or dead link: no edge to index
        const x = membrane[i * stride + 2], y = membrane[i * stride + 3], bx = membrane[j * stride + 2], by = membrane[j * stride + 3];
        if (![x, y, bx, by].every(Number.isFinite))
            throw new Error("Non-finite membrane geometry");
        const e = { x, y, dx: bx - x, dy: by - y, lx: Math.min(x, bx), hx: Math.max(x, bx), ly: Math.min(y, by), hy: Math.max(y, by) };
        edges.push(e);
        const low = Math.floor(e.ly / BAND), high = Math.floor(e.hy / BAND);
        if (high - low > 256) {
            wide.push(e);
            continue;
        }
        for (let row = low; row <= high; row++) {
            const list = rows.get(row);
            if (list)
                list.push(e);
            else
                rows.set(row, [e]);
        }
    }
    return { edges, rows, wide };
}
// Legacy particle counts use pixel-row sampling; explicit-filament mode uses
// exact y coordinates. The geometry formula/order matches the prior full scan.
function polygonOccupancy(membrane, stride = 10, exact = false, options) {
    const { rows, wide } = edgeIndex(membrane, stride, true, options);
    const cache = new Map();
    return (x, y) => {
        if (!Number.isFinite(x) || !Number.isFinite(y))
            return false;
        const row = Math.floor(y), scanY = exact ? y : row + 0.5;
        const candidates = rows.get(Math.floor(scanY / BAND)) ?? [];
        if (exact) {
            let inside = false;
            for (const list of [candidates, wide])
                for (const e of list) {
                    if (e.y > scanY != e.y + e.dy > scanY && e.x + ((scanY - e.y) * e.dx) / e.dy <= x)
                        inside = !inside;
                }
            return inside;
        }
        let crossings = cache.get(row);
        if (!crossings) {
            crossings = [];
            for (const list of [candidates, wide])
                for (const e of list) {
                    if (e.y > scanY != e.y + e.dy > scanY)
                        crossings.push(e.x + ((scanY - e.y) * e.dx) / e.dy);
                }
            crossings.sort((a, b) => a - b);
            cache.set(row, crossings);
        }
        let lo = 0, hi = crossings.length;
        while (lo < hi) {
            const mid = (lo + hi) >>> 1;
            if (crossings[mid] <= x)
                lo = mid + 1;
            else
                hi = mid;
        }
        return lo % 2 === 1;
    };
}
function polygonBondCrossing(membrane, stride = 10, options) {
    const { edges, rows, wide } = edgeIndex(membrane, stride, false, options);
    return (ax, ay, bx, by) => {
        const dx = bx - ax, dy = by - ay, minX = Math.min(ax, bx), maxX = Math.max(ax, bx), minY = Math.min(ay, by), maxY = Math.max(ay, by);
        const crosses = (list) => {
            for (const e of list) {
                if (maxX < e.lx || minX > e.hx || maxY < e.ly || minY > e.hy)
                    continue;
                const denominator = dx * e.dy - dy * e.dx;
                if (Math.abs(denominator) < 1e-8)
                    continue;
                const t = ((e.x - ax) * e.dy - (e.y - ay) * e.dx) / denominator;
                const u = ((e.x - ax) * dy - (e.y - ay) * dx) / denominator;
                if (t > 1e-5 && t < 1 - 1e-5 && u >= 0 && u <= 1)
                    return true;
            }
            return false;
        };
        const low = Math.floor(minY / BAND), high = Math.floor(maxY / BAND);
        if (high - low > 2)
            return crosses(edges);
        if (crosses(wide))
            return true;
        for (let row = low; row <= high; row++)
            if (crosses(rows.get(row) ?? []))
                return true;
        return false;
    };
}
// Topology of a link-followed membrane, always read from the tail links (word
// 6) since fusion/scission can re-link the buffer into several closed loops.
// Inner loops wind opposite to the outer one, so their signed areas subtract.
// Degenerate self-links and links without a destination vertex carry no edge:
// a self-link is a free vertex in no loop, while a dead link counts as broken
// and never joins a loop. Walks stop at visited vertices, so broken topology
// cannot loop forever or count a chain twice.
function polygonLoops(membrane, stride = 10, count = membrane.length / stride) {
    const words = new Uint32Array(membrane.buffer, membrane.byteOffset, membrane.length);
    const visited = new Uint8Array(count);
    const loopAreas = [];
    let brokenLinks = 0;
    for (let i = 0; i < count; i++) {
        const tail = words[i * stride + TAIL_WORD];
        const head = words[i * stride + HEAD_WORD];
        // out-of-range links read as undefined, so dead links count as broken
        if (words[tail * stride + HEAD_WORD] !== i || words[head * stride + TAIL_WORD] !== i)
            brokenLinks++;
        if (visited[i] || tail === i || tail >= count)
            continue;
        // follow tail links once per loop, until the walk closes back on i
        let current = i;
        let vertices = 0;
        let shoelace = 0;
        let closed = false;
        for (;;) {
            visited[current] = 1;
            const next = words[current * stride + TAIL_WORD];
            if (next === current || next >= count)
                break;
            shoelace += membrane[current * stride + 2] * membrane[next * stride + 3] - membrane[next * stride + 2] * membrane[current * stride + 3];
            vertices++;
            if (next === i) {
                closed = true;
                break;
            }
            if (visited[next])
                break;
            current = next;
        }
        if (closed)
            loopAreas.push({ vertices, area: shoelace / 2 });
    }
    loopAreas.sort((a, b) => Math.abs(b.area) - Math.abs(a.area));
    return { loops: loopAreas.length, brokenLinks, loopAreas };
}


/***/ }),

/***/ "./src/telemetry-analysis.ts":
/*!***********************************!*\
  !*** ./src/telemetry-analysis.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TELEMETRY_COUNTERS: () => (/* binding */ TELEMETRY_COUNTERS),
/* harmony export */   TelemetryAnalysis: () => (/* binding */ TelemetryAnalysis)
/* harmony export */ });
/* harmony import */ var _occupancy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./occupancy */ "./src/occupancy.ts");
// Pure full-snapshot diagnostics. Runs in the bounded worker, with no DOM or
// GPU access. Geometry checks, topology walks and counter semantics are shared
// by live diagnostics and every forced scientific-assay checkpoint.

const SEGMENT_WORDS = 10; // id, subtype, position(2), orientation(2), tail, head, arc_length, age
const TAIL = 6;
const HEAD = 7;
// must match the TELEMETRY_* indices in simulate.wgsl
const TELEMETRY_COUNTERS = [
    "candidates", // free monomers in the polymerization field
    "neighborFound", // ... that saw an available head or monomer nearby
    "passedProb", // ... and passed the bind probability
    "bound", // ... and won both locks
    "unbound", // minus-end depolymerizations
    "elongated", // binds onto an existing filament's plus end (bound minus elongated = new dimers)
    "headsInField", // plus ends in the polymerization field, i.e. able to elongate
    "headFound", // candidates that saw such a plus end nearby
    "branched", // new branches nucleated on the side of a filament (lamellipodium field)
    "debranched", // branches that came off their mother
    "pointContacts",
    "bondContacts",
    "rearMinusLoss",
    "frontMinusLoss",
    "rearPlusLoss",
    "tetherReleased",
];
const HISTOGRAM_EDGES = [2, 4, 8, 16, 32, 64];
class TelemetryAnalysis {
    lastCounters = null;
    lastStep = 0;
    // explicit fields rather than constructor parameter properties: the module
    // stays loadable by node's type-stripping test runner
    actinCount;
    membraneCount;
    membraneRestLength;
    run;
    wellMixed;
    constructor(actinCount, membraneCount, membraneRestLength, run, wellMixed = false) {
        this.actinCount = actinCount;
        this.membraneCount = membraneCount;
        this.membraneRestLength = membraneRestLength;
        this.run = run;
        this.wellMixed = wellMixed;
    }
    reset() {
        this.lastCounters = null;
        this.lastStep = 0;
    }
    // Rest length and counts can differ per cell and change at run time; the
    // per-step counter history is deliberately preserved.
    configure(actinCount, membraneCount, membraneRestLength) {
        this.actinCount = actinCount;
        this.membraneCount = membraneCount;
        this.membraneRestLength = membraneRestLength;
    }
    analyze(actin, membraneData, counterData, frame, step, equilibriumLineDistance, verification = false) {
        const previousCounters = this.lastCounters, previousStep = this.lastStep;
        const words = new Uint32Array(actin);
        const floats = new Float32Array(words.buffer);
        const counters = Array.from(new Uint32Array(counterData));
        const membrane = new Float32Array(membraneData);
        const cell = this.cellShape(membrane);
        const stats = this.compute(words, floats, counters, frame, step, equilibriumLineDistance, cell);
        // fusion/scission can re-link the membrane into several loops, so every
        // polygon predicate follows tail links instead of index order
        const inside = (0,_occupancy__WEBPACK_IMPORTED_MODULE_0__.polygonOccupancy)(membrane, SEGMENT_WORDS, this.wellMixed, { links: true });
        const crossing = this.wellMixed ? (0,_occupancy__WEBPACK_IMPORTED_MODULE_0__.polygonBondCrossing)(membrane, SEGMENT_WORDS, { links: true }) : null;
        for (let i = 0; i < this.actinCount; i++) {
            const disconnected = words[i * SEGMENT_WORDS + TAIL] === i && words[i * SEGMENT_WORDS + HEAD] === i;
            if (this.wellMixed && disconnected)
                continue; // reservoir entries have no spatial coordinates
            const tail = words[i * SEGMENT_WORDS + TAIL];
            if (crossing &&
                tail !== i &&
                crossing(floats[i * SEGMENT_WORDS + 2], floats[i * SEGMENT_WORDS + 3], floats[tail * SEGMENT_WORDS + 2], floats[tail * SEGMENT_WORDS + 3]))
                stats.crossingFilamentBonds++;
            if (!inside(floats[i * SEGMENT_WORDS + 2], floats[i * SEGMENT_WORDS + 3]))
                continue;
            if (words[i * SEGMENT_WORDS + TAIL] === i && words[i * SEGMENT_WORDS + HEAD] === i)
                stats.insideMonomerBeads++;
            else
                stats.insidePolymerBeads++;
        }
        stats.gActinConcentration = this.wellMixed ? stats.gActinAmount / ((cell.area * (this.membraneCount * this.membraneRestLength) ** 2) / (4 * Math.PI)) : 0;
        stats.diagnosticKind = verification ? "contact-recheck" : "simulation";
        if (verification) {
            this.lastCounters = previousCounters;
            this.lastStep = previousStep;
        }
        return stats;
    }
    // Membrane edges follow the runtime tail links: after fusion/scission the
    // same buffer holds one outer loop plus inner loops of opposite winding, so
    // the signed shoelace sum over all link edges is the cytoplasm area (outer
    // minus inner) and the centroid is the cytoplasm centroid. The legacy fields
    // frontX, rearX, length, frontSpacing and rearSpacing stay index-based.
    cellShape(floats) {
        const n = this.membraneCount;
        const words = new Uint32Array(floats.buffer, floats.byteOffset, floats.length);
        const x = (i) => floats[i * SEGMENT_WORDS + 2];
        const y = (i) => floats[i * SEGMENT_WORDS + 3];
        const restArea = (n * this.membraneRestLength) ** 2 / (4 * Math.PI);
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;
        // area-weighted centroid (shoelace) over all link edges
        let area = 0;
        let cx = 0;
        let cy = 0;
        for (let i = 0; i < n; i++) {
            left = Math.min(left, x(i));
            right = Math.max(right, x(i));
            top = Math.min(top, y(i));
            bottom = Math.max(bottom, y(i));
            const tail = words[i * SEGMENT_WORDS + TAIL];
            if (tail === i || tail >= n)
                continue; // free vertex or dead link: no edge
            const cross = x(i) * y(tail) - x(tail) * y(i);
            area += cross / 2;
            cx += (x(i) + x(tail)) * cross;
            cy += (y(i) + y(tail)) * cross;
        }
        const topology = (0,_occupancy__WEBPACK_IMPORTED_MODULE_0__.polygonLoops)(floats, SEGMENT_WORDS, n);
        const loopAreas = topology.loopAreas.map((loop) => ({ vertices: loop.vertices, area: loop.area / restArea }));
        const rear = n >> 1;
        const quarterSpacing = (center) => {
            let sum = 0;
            for (let k = -(n >> 3); k < n >> 3; k++) {
                const i = (center + k + n) % n;
                const j = (i + 1) % n;
                sum += Math.hypot(x(j) - x(i), y(j) - y(i));
            }
            return sum / (n >> 2) / this.membraneRestLength;
        };
        return {
            left,
            right,
            top,
            bottom,
            frontX: x(0),
            rearX: x(rear),
            centroidX: cx / (6 * area),
            centroidY: cy / (6 * area),
            length: Math.hypot(x(0) - x(rear), y(0) - y(rear)),
            area: Math.abs(area) / restArea,
            frontSpacing: quarterSpacing(0),
            rearSpacing: quarterSpacing(rear),
            loops: topology.loops,
            membraneBrokenLinks: topology.brokenLinks,
            loopAreas,
        };
    }
    compute(words, floats, counters, frame, step, restLength, cell) {
        const n = this.actinCount;
        const visited = new Uint8Array(n);
        const lengths = [];
        let monomers = 0;
        let brokenLinks = 0;
        let cycles = 0;
        let branches = 0;
        let posteriorPolymerBeads = 0;
        let ageSum = 0, maxAge = 0;
        const bondLengths = [];
        const bendAngles = [];
        for (let i = 0; i < n; i++) {
            const tail = words[i * SEGMENT_WORDS + TAIL];
            const head = words[i * SEGMENT_WORDS + HEAD];
            if (tail === i && head === i) {
                monomers++;
                continue;
            }
            const age = floats[i * SEGMENT_WORDS + 9];
            ageSum += age;
            maxAge = Math.max(maxAge, age);
            if (floats[i * SEGMENT_WORDS + 2] < (cell.frontX + cell.rearX) / 2)
                posteriorPolymerBeads++;
            if (head !== i && words[head * SEGMENT_WORDS + TAIL] !== i) {
                brokenLinks++;
            }
            // a branch root's tail is its mother, whose head points elsewhere along the mother filament
            const isBranchRoot = tail !== i && words[tail * SEGMENT_WORDS + HEAD] !== i;
            if (tail !== i && !isBranchRoot) {
                continue;
            }
            branches += isBranchRoot ? 1 : 0;
            // a minus end or branch root: walk to the plus end
            let length = 1;
            let current = i;
            let prevDx = 0;
            let prevDy = 0;
            visited[i] = 1;
            while (true) {
                const next = words[current * SEGMENT_WORDS + HEAD];
                if (next === current)
                    break;
                if (visited[next]) {
                    cycles++;
                    break;
                }
                const dx = floats[next * SEGMENT_WORDS + 2] - floats[current * SEGMENT_WORDS + 2];
                const dy = floats[next * SEGMENT_WORDS + 3] - floats[current * SEGMENT_WORDS + 3];
                bondLengths.push(Math.hypot(dx, dy));
                if (length > 1) {
                    bendAngles.push((Math.abs(Math.atan2(prevDx * dy - prevDy * dx, prevDx * dx + prevDy * dy)) * 180) / Math.PI);
                }
                prevDx = dx;
                prevDy = dy;
                visited[next] = 1;
                current = next;
                length++;
            }
            lengths.push(length);
        }
        lengths.sort((a, b) => a - b);
        const inPolymer = lengths.reduce((sum, l) => sum + l, 0);
        const histogram = new Array(HISTOGRAM_EDGES.length + 1).fill(0);
        for (const l of lengths) {
            const bin = HISTOGRAM_EDGES.findIndex((edge) => l <= edge);
            histogram[bin === -1 ? HISTOGRAM_EDGES.length : bin]++;
        }
        const steps = Math.max(1, step - this.lastStep);
        const perStep = Object.fromEntries(TELEMETRY_COUNTERS.map((name, k) => [name, this.lastCounters ? (counters[k] - this.lastCounters[k]) / steps : 0]));
        this.lastCounters = counters;
        this.lastStep = step;
        const quantile = (q) => (lengths.length ? lengths[Math.min(lengths.length - 1, Math.floor(q * lengths.length))] : 0);
        return {
            run: this.run,
            frame,
            step,
            actinCount: n,
            monomers,
            filaments: lengths.length,
            branches,
            inPolymer,
            posteriorPolymerBeads,
            insidePolymerBeads: 0,
            insideMonomerBeads: 0,
            gActinMode: this.wellMixed ? "well-mixed" : "particles",
            gActinAmount: monomers,
            gActinConcentration: 0,
            actinBalanceError: monomers + inPolymer - n,
            crossingFilamentBonds: 0,
            meanPolymerAge: n > monomers ? ageSum / (n - monomers) : 0,
            maxPolymerAge: maxAge,
            meanLength: lengths.length ? inPolymer / lengths.length : 0,
            medianLength: quantile(0.5),
            p90Length: quantile(0.9),
            maxLength: lengths.length ? lengths[lengths.length - 1] : 0,
            histogram,
            medianBondLength: bondLengths.length ? bondLengths.sort((a, b) => a - b)[bondLengths.length >> 1] / restLength : 0,
            medianBendAngle: bendAngles.length ? bendAngles.sort((a, b) => a - b)[bendAngles.length >> 1] : 0,
            brokenLinks,
            cycles,
            perStep,
            cell,
        };
    }
}


/***/ }),

/***/ "./src/telemetry.worker.ts":
/*!*********************************!*\
  !*** ./src/telemetry.worker.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _telemetry_analysis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./telemetry-analysis */ "./src/telemetry-analysis.ts");

const scope = self;
let analysis;
let config = null;
const analyses = new Map();
scope.onmessage = ({ data }) => {
    if (data.type === "init") {
        config = data.config;
        analysis = new _telemetry_analysis__WEBPACK_IMPORTED_MODULE_0__.TelemetryAnalysis(...data.config);
        analyses.clear(); // keyed instances are created lazily from this config
        return;
    }
    if (data.type === "reset") {
        analysis.reset();
        for (const keyed of analyses.values())
            keyed.reset();
        return;
    }
    const start = performance.now();
    try {
        let instance = analysis;
        if (data.spec) {
            instance =
                analyses.get(data.spec.key) ??
                    new _telemetry_analysis__WEBPACK_IMPORTED_MODULE_0__.TelemetryAnalysis(data.spec.actin, data.spec.membrane, data.spec.rest, config?.[3] ?? "", config?.[4] ?? false);
            analyses.set(data.spec.key, instance);
            instance.configure(data.spec.actin, data.spec.membrane, data.spec.rest);
        }
        const stats = instance.analyze(data.actin, data.membrane, data.counters, data.frame, data.step, data.rest, data.verification);
        scope.postMessage({ id: data.id, stats, analysisMs: performance.now() - start });
    }
    catch (error) {
        scope.postMessage({ id: data.id, error: String(error) });
    }
};


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3RlbGVtZXRyeV93b3JrZXJfdHMuMmMxMTY3NzAuYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFDMUUsb0VBQW9FO0FBQ3BFLDZFQUE2RTtBQUM3RSw4RUFBOEU7QUFDOUUsOEVBQThFO0FBQzlFLDJFQUEyRTtBQUMzRSxNQUFNLElBQUksR0FBRyxDQUFDLENBQUM7QUFDZixNQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyw4REFBOEQ7QUFDbkYsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsa0VBQWtFO0FBSXZGLFNBQVMsU0FBUyxDQUFDLFFBQXNCLEVBQUUsTUFBYyxFQUFFLE9BQU8sR0FBRyxLQUFLLEVBQUUsT0FBcUI7SUFDL0YsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDbkMsTUFBTSxNQUFNLEdBQUcsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQzlHLE1BQU0sS0FBSyxHQUFXLEVBQUUsRUFDdEIsSUFBSSxHQUFHLElBQUksR0FBRyxFQUFrQixFQUNoQyxJQUFJLEdBQVcsRUFBRSxDQUFDO0lBQ3BCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMzQixNQUFNLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxD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QUMsSUFBSSxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUNELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzlILEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzNELENBQUM7QUFDSCxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL29jY3VwYW5jeS50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3RlbGVtZXRyeS1hbmFseXNpcy50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3RlbGVtZXRyeS53b3JrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29uc2VydmF0aXZlIHktYmFuZCBlZGdlIGluZGV4LiBQcmVkaWNhdGVzIHJlbWFpbiBleGFjdDsgbG9uZyBlZGdlcyBhcmVcbi8vIHJldGFpbmVkIGluIGEgZ2xvYmFsIGxpc3QgYW5kIGxvbmcgYm9uZCBxdWVyaWVzIGZhbGwgYmFjayB0byBhbGwgZWRnZXMuXG4vLyBObyBib3VuZGFyeS9jb2xsaXNpb24gaXMgZGlzY2FyZGVkIHRvIGltcHJvdmUgZGlhZ25vc3RpYyBsYXRlbmN5LlxuLy8gV2l0aCBgbGlua3M6IHRydWVgIGFkamFjZW5jeSBjb21lcyBmcm9tIHRoZSBtZW1icmFuZSBgdGFpbGAgbGlua3MgKHdvcmQgNilcbi8vIGluc3RlYWQgb2YgaW5kZXggb3JkZXIsIHNvIGZ1c2lvbi9zY2lzc2lvbiBjYW4gcmUtbGluayB0aGUgc2FtZSBidWZmZXIgaW50b1xuLy8gc2V2ZXJhbCBjbG9zZWQgbG9vcHMuIERlZ2VuZXJhdGUgc2VsZi1saW5rcyBhbmQgbGlua3Mgd2l0aG91dCBhIGRlc3RpbmF0aW9uXG4vLyB2ZXJ0ZXggY2Fycnkgbm8gZWRnZSBhbmQgYXJlIHNraXBwZWQ7IGV2ZXJ5IGVkZ2UgdGhhdCBleGlzdHMgaXMgaW5kZXhlZC5cbmNvbnN0IEJBTkQgPSA0O1xuY29uc3QgVEFJTF9XT1JEID0gNjsgLy8gc2VnbWVudCB3b3JkIDYgaG9sZHMgYHRhaWxgOiB0aGUgbmV4dCB2ZXJ0ZXggYWxvbmcgdGhlIHJpbmdcbmNvbnN0IEhFQURfV09SRCA9IDc7IC8vIHNlZ21lbnQgd29yZCA3IGhvbGRzIGBoZWFkYDogdGhlIHByZXZpb3VzIHZlcnRleCBhbG9uZyB0aGUgcmluZ1xudHlwZSBFZGdlID0geyB4OiBudW1iZXI7IHk6IG51bWJlcjsgZHg6IG51bWJlcjsgZHk6IG51bWJlcjsgbHg6IG51bWJlcjsgaHg6IG51bWJlcjsgbHk6IG51bWJlcjsgaHk6IG51bWJlciB9O1xuZXhwb3J0IHR5cGUgRWRnZU9wdGlvbnMgPSB7IGxpbmtzPzogYm9vbGVhbiB9O1xuXG5mdW5jdGlvbiBlZGdlSW5kZXgobWVtYnJhbmU6IEZsb2F0MzJBcnJheSwgc3RyaWRlOiBudW1iZXIsIHJldmVyc2UgPSBmYWxzZSwgb3B0aW9ucz86IEVkZ2VPcHRpb25zKSB7XG4gIGNvbnN0IG4gPSBtZW1icmFuZS5sZW5ndGggLyBzdHJpZGU7XG4gIGNvbnN0IGxpbmtlZCA9IG9wdGlvbnM/LmxpbmtzID8gbmV3IFVpbnQzMkFycmF5KG1lbWJyYW5lLmJ1ZmZlciwgbWVtYnJhbmUuYnl0ZU9mZnNldCwgbWVtYnJhbmUubGVuZ3RoKSA6IG51bGw7XG4gIGNvbnN0IGVkZ2VzOiBFZGdlW10gPSBbXSxcbiAgICByb3dzID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VbXT4oKSxcbiAgICB3aWRlOiBFZGdlW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICBjb25zdCBqID0gbGlua2VkID8gbGlua2VkW2kgKiBzdHJpZGUgKyBUQUlMX1dPUkRdIDogKGkgKyAocmV2ZXJzZSA/IG4gLSAxIDogMSkpICUgbjtcbiAgICBpZiAobGlua2VkICYmIChqID09PSBpIHx8IGogPj0gbikpIGNvbnRpbnVlOyAvLyBmcmVlIHZlcnRleCBvciBkZWFkIGxpbms6IG5vIGVkZ2UgdG8gaW5kZXhcbiAgICBjb25zdCB4ID0gbWVtYnJhbmVbaSAqIHN0cmlkZSArIDJdLFxuICAgICAgeSA9IG1lbWJyYW5lW2kgKiBzdHJpZGUgKyAzXSxcbiAgICAgIGJ4ID0gbWVtYnJhbmVbaiAqIHN0cmlkZSArIDJdLFxuICAgICAgYnkgPSBtZW1icmFuZVtqICogc3RyaWRlICsgM107XG4gICAgaWYgKCFbeCwgeSwgYngsIGJ5XS5ldmVyeShOdW1iZXIuaXNGaW5pdGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJOb24tZmluaXRlIG1lbWJyYW5lIGdlb21ldHJ5XCIpO1xuICAgIGNvbnN0IGUgPSB7IHgsIHksIGR4OiBieCAtIHgsIGR5OiBieSAtIHksIGx4OiBNYXRoLm1pbih4LCBieCksIGh4OiBNYXRoLm1heCh4LCBieCksIGx5OiBNYXRoLm1pbih5LCBieSksIGh5OiBNYXRoLm1heCh5LCBieSkgfTtcbiAgICBlZGdlcy5wdXNoKGUpO1xuICAgIGNvbnN0IGxvdyA9IE1hdGguZmxvb3IoZS5seSAvIEJBTkQpLFxuICAgICAgaGlnaCA9IE1hdGguZmxvb3IoZS5oeSAvIEJBTkQpO1xuICAgIGlmIChoaWdoIC0gbG93ID4gMjU2KSB7XG4gICAgICB3aWRlLnB1c2goZSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgZm9yIChsZXQgcm93ID0gbG93OyByb3cgPD0gaGlnaDsgcm93KyspIHtcbiAgICAgIGNvbnN0IGxpc3QgPSByb3dzLmdldChyb3cpO1xuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChlKTtcbiAgICAgIGVsc2Ugcm93cy5zZXQocm93LCBbZV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4geyBlZGdlcywgcm93cywgd2lkZSB9O1xufVxuXG4vLyBMZWdhY3kgcGFydGljbGUgY291bnRzIHVzZSBwaXhlbC1yb3cgc2FtcGxpbmc7IGV4cGxpY2l0LWZpbGFtZW50IG1vZGUgdXNlc1xuLy8gZXhhY3QgeSBjb29yZGluYXRlcy4gVGhlIGdlb21ldHJ5IGZvcm11bGEvb3JkZXIgbWF0Y2hlcyB0aGUgcHJpb3IgZnVsbCBzY2FuLlxuZXhwb3J0IGZ1bmN0aW9uIHBvbHlnb25PY2N1cGFuY3kobWVtYnJhbmU6IEZsb2F0MzJBcnJheSwgc3RyaWRlID0gMTAsIGV4YWN0ID0gZmFsc2UsIG9wdGlvbnM/OiBFZGdlT3B0aW9ucykge1xuICBjb25zdCB7IHJvd3MsIHdpZGUgfSA9IGVkZ2VJbmRleChtZW1icmFuZSwgc3RyaWRlLCB0cnVlLCBvcHRpb25zKTtcbiAgY29uc3QgY2FjaGUgPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyW10+KCk7XG4gIHJldHVybiAoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh4KSB8fCAhTnVtYmVyLmlzRmluaXRlKHkpKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcih5KSxcbiAgICAgIHNjYW5ZID0gZXhhY3QgPyB5IDogcm93ICsgMC41O1xuICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSByb3dzLmdldChNYXRoLmZsb29yKHNjYW5ZIC8gQkFORCkpID8/IFtdO1xuICAgIGlmIChleGFjdCkge1xuICAgICAgbGV0IGluc2lkZSA9IGZhbHNlO1xuICAgICAgZm9yIChjb25zdCBsaXN0IG9mIFtjYW5kaWRhdGVzLCB3aWRlXSlcbiAgICAgICAgZm9yIChjb25zdCBlIG9mIGxpc3QpIHtcbiAgICAgICAgICBpZiAoZS55ID4gc2NhblkgIT0gZS55ICsgZS5keSA+IHNjYW5ZICYmIGUueCArICgoc2NhblkgLSBlLnkpICogZS5keCkgLyBlLmR5IDw9IHgpIGluc2lkZSA9ICFpbnNpZGU7XG4gICAgICAgIH1cbiAgICAgIHJldHVybiBpbnNpZGU7XG4gICAgfVxuICAgIGxldCBjcm9zc2luZ3MgPSBjYWNoZS5nZXQocm93KTtcbiAgICBpZiAoIWNyb3NzaW5ncykge1xuICAgICAgY3Jvc3NpbmdzID0gW107XG4gICAgICBmb3IgKGNvbnN0IGxpc3Qgb2YgW2NhbmRpZGF0ZXMsIHdpZGVdKVxuICAgICAgICBmb3IgKGNvbnN0IGUgb2YgbGlzdCkge1xuICAgICAgICAgIGlmIChlLnkgPiBzY2FuWSAhPSBlLnkgKyBlLmR5ID4gc2NhblkpIGNyb3NzaW5ncy5wdXNoKGUueCArICgoc2NhblkgLSBlLnkpICogZS5keCkgLyBlLmR5KTtcbiAgICAgICAgfVxuICAgICAgY3Jvc3NpbmdzLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgICAgIGNhY2hlLnNldChyb3csIGNyb3NzaW5ncyk7XG4gICAgfVxuICAgIGxldCBsbyA9IDAsXG4gICAgICBoaSA9IGNyb3NzaW5ncy5sZW5ndGg7XG4gICAgd2hpbGUgKGxvIDwgaGkpIHtcbiAgICAgIGNvbnN0IG1pZCA9IChsbyArIGhpKSA+Pj4gMTtcbiAgICAgIGlmIChjcm9zc2luZ3NbbWlkXSA8PSB4KSBsbyA9IG1pZCArIDE7XG4gICAgICBlbHNlIGhpID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG8gJSAyID09PSAxO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9seWdvbkJvbmRDcm9zc2luZyhtZW1icmFuZTogRmxvYXQzMkFycmF5LCBzdHJpZGUgPSAxMCwgb3B0aW9ucz86IEVkZ2VPcHRpb25zKSB7XG4gIGNvbnN0IHsgZWRnZXMsIHJvd3MsIHdpZGUgfSA9IGVkZ2VJbmRleChtZW1icmFuZSwgc3RyaWRlLCBmYWxzZSwgb3B0aW9ucyk7XG4gIHJldHVybiAoYXg6IG51bWJlciwgYXk6IG51bWJlciwgYng6IG51bWJlciwgYnk6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IGR4ID0gYnggLSBheCxcbiAgICAgIGR5ID0gYnkgLSBheSxcbiAgICAgIG1pblggPSBNYXRoLm1pbihheCwgYngpLFxuICAgICAgbWF4WCA9IE1hdGgubWF4KGF4LCBieCksXG4gICAgICBtaW5ZID0gTWF0aC5taW4oYXksIGJ5KSxcbiAgICAgIG1heFkgPSBNYXRoLm1heChheSwgYnkpO1xuICAgIGNvbnN0IGNyb3NzZXMgPSAobGlzdDogRWRnZVtdKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGUgb2YgbGlzdCkge1xuICAgICAgICBpZiAobWF4WCA8IGUubHggfHwgbWluWCA+IGUuaHggfHwgbWF4WSA8IGUubHkgfHwgbWluWSA+IGUuaHkpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBkZW5vbWluYXRvciA9IGR4ICogZS5keSAtIGR5ICogZS5keDtcbiAgICAgICAgaWYgKE1hdGguYWJzKGRlbm9taW5hdG9yKSA8IDFlLTgpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCB0ID0gKChlLnggLSBheCkgKiBlLmR5IC0gKGUueSAtIGF5KSAqIGUuZHgpIC8gZGVub21pbmF0b3I7XG4gICAgICAgIGNvbnN0IHUgPSAoKGUueCAtIGF4KSAqIGR5IC0gKGUueSAtIGF5KSAqIGR4KSAvIGRlbm9taW5hdG9yO1xuICAgICAgICBpZiAodCA+IDFlLTUgJiYgdCA8IDEgLSAxZS01ICYmIHUgPj0gMCAmJiB1IDw9IDEpIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgY29uc3QgbG93ID0gTWF0aC5mbG9vcihtaW5ZIC8gQkFORCksXG4gICAgICBoaWdoID0gTWF0aC5mbG9vcihtYXhZIC8gQkFORCk7XG4gICAgaWYgKGhpZ2ggLSBsb3cgPiAyKSByZXR1cm4gY3Jvc3NlcyhlZGdlcyk7XG4gICAgaWYgKGNyb3NzZXMod2lkZSkpIHJldHVybiB0cnVlO1xuICAgIGZvciAobGV0IHJvdyA9IGxvdzsgcm93IDw9IGhpZ2g7IHJvdysrKSBpZiAoY3Jvc3Nlcyhyb3dzLmdldChyb3cpID8/IFtdKSkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xufVxuXG5leHBvcnQgdHlwZSBNZW1icmFuZUxvb3BzID0ge1xuICBsb29wczogbnVtYmVyOyAvLyBjbG9zZWQgbG9vcHMgZm91bmQgYnkgZm9sbG93aW5nIHRhaWwgbGlua3MgZnJvbSB1bnZpc2l0ZWQgdmVydGljZXNcbiAgYnJva2VuTGlua3M6IG51bWJlcjsgLy8gdmVydGljZXMgaSB3aXRoIGhlYWQodGFpbChpKSkgIT09IGkgb3IgdGFpbChoZWFkKGkpKSAhPT0gaVxuICBsb29wQXJlYXM6IHsgdmVydGljZXM6IG51bWJlcjsgYXJlYTogbnVtYmVyIH1bXTsgLy8gc2lnbmVkIHBpeGVsIGFyZWFzLCBsYXJnZXN0IHxhcmVhfCBmaXJzdFxufTtcblxuLy8gVG9wb2xvZ3kgb2YgYSBsaW5rLWZvbGxvd2VkIG1lbWJyYW5lLCBhbHdheXMgcmVhZCBmcm9tIHRoZSB0YWlsIGxpbmtzICh3b3JkXG4vLyA2KSBzaW5jZSBmdXNpb24vc2Npc3Npb24gY2FuIHJlLWxpbmsgdGhlIGJ1ZmZlciBpbnRvIHNldmVyYWwgY2xvc2VkIGxvb3BzLlxuLy8gSW5uZXIgbG9vcHMgd2luZCBvcHBvc2l0ZSB0byB0aGUgb3V0ZXIgb25lLCBzbyB0aGVpciBzaWduZWQgYXJlYXMgc3VidHJhY3QuXG4vLyBEZWdlbmVyYXRlIHNlbGYtbGlua3MgYW5kIGxpbmtzIHdpdGhvdXQgYSBkZXN0aW5hdGlvbiB2ZXJ0ZXggY2Fycnkgbm8gZWRnZTpcbi8vIGEgc2VsZi1saW5rIGlzIGEgZnJlZSB2ZXJ0ZXggaW4gbm8gbG9vcCwgd2hpbGUgYSBkZWFkIGxpbmsgY291bnRzIGFzIGJyb2tlblxuLy8gYW5kIG5ldmVyIGpvaW5zIGEgbG9vcC4gV2Fsa3Mgc3RvcCBhdCB2aXNpdGVkIHZlcnRpY2VzLCBzbyBicm9rZW4gdG9wb2xvZ3lcbi8vIGNhbm5vdCBsb29wIGZvcmV2ZXIgb3IgY291bnQgYSBjaGFpbiB0d2ljZS5cbmV4cG9ydCBmdW5jdGlvbiBwb2x5Z29uTG9vcHMobWVtYnJhbmU6IEZsb2F0MzJBcnJheSwgc3RyaWRlID0gMTAsIGNvdW50ID0gbWVtYnJhbmUubGVuZ3RoIC8gc3RyaWRlKTogTWVtYnJhbmVMb29wcyB7XG4gIGNvbnN0IHdvcmRzID0gbmV3IFVpbnQzMkFycmF5KG1lbWJyYW5lLmJ1ZmZlciwgbWVtYnJhbmUuYnl0ZU9mZnNldCwgbWVtYnJhbmUubGVuZ3RoKTtcbiAgY29uc3QgdmlzaXRlZCA9IG5ldyBVaW50OEFycmF5KGNvdW50KTtcbiAgY29uc3QgbG9vcEFyZWFzOiB7IHZlcnRpY2VzOiBudW1iZXI7IGFyZWE6IG51bWJlciB9W10gPSBbXTtcbiAgbGV0IGJyb2tlbkxpbmtzID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgY29uc3QgdGFpbCA9IHdvcmRzW2kgKiBzdHJpZGUgKyBUQUlMX1dPUkRdO1xuICAgIGNvbnN0IGhlYWQgPSB3b3Jkc1tpICogc3RyaWRlICsgSEVBRF9XT1JEXTtcbiAgICAvLyBvdXQtb2YtcmFuZ2UgbGlua3MgcmVhZCBhcyB1bmRlZmluZWQsIHNvIGRlYWQgbGlua3MgY291bnQgYXMgYnJva2VuXG4gICAgaWYgKHdvcmRzW3RhaWwgKiBzdHJpZGUgKyBIRUFEX1dPUkRdICE9PSBpIHx8IHdvcmRzW2hlYWQgKiBzdHJpZGUgKyBUQUlMX1dPUkRdICE9PSBpKSBicm9rZW5MaW5rcysrO1xuICAgIGlmICh2aXNpdGVkW2ldIHx8IHRhaWwgPT09IGkgfHwgdGFpbCA+PSBjb3VudCkgY29udGludWU7XG4gICAgLy8gZm9sbG93IHRhaWwgbGlua3Mgb25jZSBwZXIgbG9vcCwgdW50aWwgdGhlIHdhbGsgY2xvc2VzIGJhY2sgb24gaVxuICAgIGxldCBjdXJyZW50ID0gaTtcbiAgICBsZXQgdmVydGljZXMgPSAwO1xuICAgIGxldCBzaG9lbGFjZSA9IDA7XG4gICAgbGV0IGNsb3NlZCA9IGZhbHNlO1xuICAgIGZvciAoOzspIHtcbiAgICAgIHZpc2l0ZWRbY3VycmVudF0gPSAxO1xuICAgICAgY29uc3QgbmV4dCA9IHdvcmRzW2N1cnJlbnQgKiBzdHJpZGUgKyBUQUlMX1dPUkRdO1xuICAgICAgaWYgKG5leHQgPT09IGN1cnJlbnQgfHwgbmV4dCA+PSBjb3VudCkgYnJlYWs7XG4gICAgICBzaG9lbGFjZSArPSBtZW1icmFuZVtjdXJyZW50ICogc3RyaWRlICsgMl0gKiBtZW1icmFuZVtuZXh0ICogc3RyaWRlICsgM10gLSBtZW1icmFuZVtuZXh0ICogc3RyaWRlICsgMl0gKiBtZW1icmFuZVtjdXJyZW50ICogc3RyaWRlICsgM107XG4gICAgICB2ZXJ0aWNlcysrO1xuICAgICAgaWYgKG5leHQgPT09IGkpIHtcbiAgICAgICAgY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAodmlzaXRlZFtuZXh0XSkgYnJlYWs7XG4gICAgICBjdXJyZW50ID0gbmV4dDtcbiAgICB9XG4gICAgaWYgKGNsb3NlZCkgbG9vcEFyZWFzLnB1c2goeyB2ZXJ0aWNlcywgYXJlYTogc2hvZWxhY2UgLyAyIH0pO1xuICB9XG4gIGxvb3BBcmVhcy5zb3J0KChhLCBiKSA9PiBNYXRoLmFicyhiLmFyZWEpIC0gTWF0aC5hYnMoYS5hcmVhKSk7XG4gIHJldHVybiB7IGxvb3BzOiBsb29wQXJlYXMubGVuZ3RoLCBicm9rZW5MaW5rcywgbG9vcEFyZWFzIH07XG59XG4iLCIvLyBQdXJlIGZ1bGwtc25hcHNob3QgZGlhZ25vc3RpY3MuIFJ1bnMgaW4gdGhlIGJvdW5kZWQgd29ya2VyLCB3aXRoIG5vIERPTSBvclxuLy8gR1BVIGFjY2Vzcy4gR2VvbWV0cnkgY2hlY2tzLCB0b3BvbG9neSB3YWxrcyBhbmQgY291bnRlciBzZW1hbnRpY3MgYXJlIHNoYXJlZFxuLy8gYnkgbGl2ZSBkaWFnbm9zdGljcyBhbmQgZXZlcnkgZm9yY2VkIHNjaWVudGlmaWMtYXNzYXkgY2hlY2twb2ludC5cbmltcG9ydCB7IHBvbHlnb25PY2N1cGFuY3ksIHBvbHlnb25Cb25kQ3Jvc3NpbmcsIHBvbHlnb25Mb29wcyB9IGZyb20gXCIuL29jY3VwYW5jeVwiO1xuXG5jb25zdCBTRUdNRU5UX1dPUkRTID0gMTA7IC8vIGlkLCBzdWJ0eXBlLCBwb3NpdGlvbigyKSwgb3JpZW50YXRpb24oMiksIHRhaWwsIGhlYWQsIGFyY19sZW5ndGgsIGFnZVxuY29uc3QgVEFJTCA9IDY7XG5jb25zdCBIRUFEID0gNztcblxuLy8gbXVzdCBtYXRjaCB0aGUgVEVMRU1FVFJZXyogaW5kaWNlcyBpbiBzaW11bGF0ZS53Z3NsXG5leHBvcnQgY29uc3QgVEVMRU1FVFJZX0NPVU5URVJTID0gW1xuICBcImNhbmRpZGF0ZXNcIiwgLy8gZnJlZSBtb25vbWVycyBpbiB0aGUgcG9seW1lcml6YXRpb24gZmllbGRcbiAgXCJuZWlnaGJvckZvdW5kXCIsIC8vIC4uLiB0aGF0IHNhdyBhbiBhdmFpbGFibGUgaGVhZCBvciBtb25vbWVyIG5lYXJieVxuICBcInBhc3NlZFByb2JcIiwgLy8gLi4uIGFuZCBwYXNzZWQgdGhlIGJpbmQgcHJvYmFiaWxpdHlcbiAgXCJib3VuZFwiLCAvLyAuLi4gYW5kIHdvbiBib3RoIGxvY2tzXG4gIFwidW5ib3VuZFwiLCAvLyBtaW51cy1lbmQgZGVwb2x5bWVyaXphdGlvbnNcbiAgXCJlbG9uZ2F0ZWRcIiwgLy8gYmluZHMgb250byBhbiBleGlzdGluZyBmaWxhbWVudCdzIHBsdXMgZW5kIChib3VuZCBtaW51cyBlbG9uZ2F0ZWQgPSBuZXcgZGltZXJzKVxuICBcImhlYWRzSW5GaWVsZFwiLCAvLyBwbHVzIGVuZHMgaW4gdGhlIHBvbHltZXJpemF0aW9uIGZpZWxkLCBpLmUuIGFibGUgdG8gZWxvbmdhdGVcbiAgXCJoZWFkRm91bmRcIiwgLy8gY2FuZGlkYXRlcyB0aGF0IHNhdyBzdWNoIGEgcGx1cyBlbmQgbmVhcmJ5XG4gIFwiYnJhbmNoZWRcIiwgLy8gbmV3IGJyYW5jaGVzIG51Y2xlYXRlZCBvbiB0aGUgc2lkZSBvZiBhIGZpbGFtZW50IChsYW1lbGxpcG9kaXVtIGZpZWxkKVxuICBcImRlYnJhbmNoZWRcIiwgLy8gYnJhbmNoZXMgdGhhdCBjYW1lIG9mZiB0aGVpciBtb3RoZXJcbiAgXCJwb2ludENvbnRhY3RzXCIsXG4gIFwiYm9uZENvbnRhY3RzXCIsXG4gIFwicmVhck1pbnVzTG9zc1wiLFxuICBcImZyb250TWludXNMb3NzXCIsXG4gIFwicmVhclBsdXNMb3NzXCIsXG4gIFwidGV0aGVyUmVsZWFzZWRcIixcbl0gYXMgY29uc3Q7XG5cbnR5cGUgQ291bnRlcnMgPSBSZWNvcmQ8KHR5cGVvZiBURUxFTUVUUllfQ09VTlRFUlMpW251bWJlcl0sIG51bWJlcj47XG5cbmV4cG9ydCB0eXBlIEFjdGluU3RhdHMgPSB7XG4gIHJ1bjogc3RyaW5nO1xuICBmcmFtZTogbnVtYmVyO1xuICBzdGVwOiBudW1iZXI7XG4gIGFjdGluQ291bnQ6IG51bWJlcjtcbiAgbW9ub21lcnM6IG51bWJlcjtcbiAgZmlsYW1lbnRzOiBudW1iZXI7XG4gIGJyYW5jaGVzOiBudW1iZXI7IC8vIGZpbGFtZW50cyBoYW5naW5nIG9mZiB0aGUgc2lkZSBvZiBhbm90aGVyIG9uZVxuICBpblBvbHltZXI6IG51bWJlcjtcbiAgcG9zdGVyaW9yUG9seW1lckJlYWRzOiBudW1iZXI7IC8vIGxlZ2FjeSBtYXJrZXIteCBoYWxmLCBub3QgdGhlIGN1cnJlbnQgZ2VvbWV0cmljIHBvbGFyaXR5IGZyYW1lXG4gIGluc2lkZVBvbHltZXJCZWFkczogbnVtYmVyO1xuICBpbnNpZGVNb25vbWVyQmVhZHM6IG51bWJlcjtcbiAgZ0FjdGluTW9kZTogXCJ3ZWxsLW1peGVkXCIgfCBcInBhcnRpY2xlc1wiO1xuICBnQWN0aW5BbW91bnQ6IG51bWJlcjtcbiAgZ0FjdGluQ29uY2VudHJhdGlvbjogbnVtYmVyO1xuICBhY3RpbkJhbGFuY2VFcnJvcjogbnVtYmVyO1xuICBjcm9zc2luZ0ZpbGFtZW50Qm9uZHM6IG51bWJlcjtcbiAgbWVhblBvbHltZXJBZ2U6IG51bWJlcjtcbiAgbWF4UG9seW1lckFnZTogbnVtYmVyO1xuICBtZWFuTGVuZ3RoOiBudW1iZXI7XG4gIG1lZGlhbkxlbmd0aDogbnVtYmVyO1xuICBwOTBMZW5ndGg6IG51bWJlcjtcbiAgbWF4TGVuZ3RoOiBudW1iZXI7XG4gIC8vIGZpbGFtZW50IGNvdW50cyBwZXIgbGVuZ3RoIGJpbjogMiwgMy00LCA1LTgsIDktMTYsIDE3LTMyLCAzMy02NCwgNjUrXG4gIGhpc3RvZ3JhbTogbnVtYmVyW107XG4gIG1lZGlhbkJvbmRMZW5ndGg6IG51bWJlcjsgLy8gaW4gdW5pdHMgb2YgdGhlIGFjdGluIHJlc3QgbGVuZ3RoXG4gIG1lZGlhbkJlbmRBbmdsZTogbnVtYmVyOyAvLyBkZWdyZWVzIGJldHdlZW4gY29uc2VjdXRpdmUgYm9uZHMgb2YgYSBmaWxhbWVudDsgbG93ID0gc3RpZmZcbiAgYnJva2VuTGlua3M6IG51bWJlcjsgLy8gYS5oZWFkID0gYiBidXQgYi50YWlsICE9IGFcbiAgY3ljbGVzOiBudW1iZXI7XG4gIHBlclN0ZXA6IENvdW50ZXJzOyAvLyBldmVudCByYXRlcyBzaW5jZSB0aGUgcHJldmlvdXMgc2FtcGxlXG4gIGNlbGw6IENlbGxTaGFwZTtcbiAgZGlhZ25vc3RpY0tpbmQ/OiBcInNpbXVsYXRpb25cIiB8IFwiY29udGFjdC1yZWNoZWNrXCI7XG59O1xuXG4vLyBtZW1icmFuZSBzaGFwZSBpbiBwaXhlbHM7IG5vZGUgMCBpcyB0aGUgZnJvbnQgKHRoZSByaWdodCBzaWRlIGF0IHJlc2V0KSwgbm9kZSBjb3VudCAvIDIgdGhlIHJlYXJcbmV4cG9ydCB0eXBlIENlbGxTaGFwZSA9IHtcbiAgbGVmdDogbnVtYmVyOyAvLyBsZWZ0bW9zdCBtZW1icmFuZSB4XG4gIHJpZ2h0OiBudW1iZXI7IC8vIHJpZ2h0bW9zdCBtZW1icmFuZSB4XG4gIHRvcDogbnVtYmVyO1xuICBib3R0b206IG51bWJlcjtcbiAgZnJvbnRYOiBudW1iZXI7XG4gIHJlYXJYOiBudW1iZXI7XG4gIGNlbnRyb2lkWDogbnVtYmVyO1xuICBjZW50cm9pZFk6IG51bWJlcjtcbiAgbGVuZ3RoOiBudW1iZXI7IC8vIGZyb250IG5vZGUgdG8gcmVhciBub2RlXG4gIGFyZWE6IG51bWJlcjsgLy8gcmVsYXRpdmUgdG8gdGhlIGFyZWEgYXQgcmVzZXRcbiAgLy8gbWVhbiBtZW1icmFuZSBlZGdlIGxlbmd0aCBpbiB1bml0cyBvZiB0aGUgcmVzdCBsZW5ndGgsIG92ZXIgdGhlIHF1YXJ0ZXIgb2YgdGhlIG5vZGVzIGFyb3VuZCB0aGUgZnJvbnQgYW5kIHRoZSByZWFyXG4gIGZyb250U3BhY2luZzogbnVtYmVyO1xuICByZWFyU3BhY2luZzogbnVtYmVyO1xuICBsb29wczogbnVtYmVyOyAvLyBjbG9zZWQgbG9vcHMgZm91bmQgYnkgZm9sbG93aW5nIHRhaWwgbGlua3MgZnJvbSB1bnZpc2l0ZWQgdmVydGljZXNcbiAgbWVtYnJhbmVCcm9rZW5MaW5rczogbnVtYmVyOyAvLyB2ZXJ0aWNlcyBpIHdpdGggaGVhZCh0YWlsKGkpKSAhPT0gaSBvciB0YWlsKGhlYWQoaSkpICE9PSBpXG4gIC8vIG9uZSBlbnRyeSBwZXIgY2xvc2VkIGxvb3AsIHNpZ25lZCBhcmVhIHJlbGF0aXZlIHRvIHJlc3RBcmVhLCBsYXJnZXN0IHxhcmVhfCBmaXJzdFxuICBsb29wQXJlYXM6IHsgdmVydGljZXM6IG51bWJlcjsgYXJlYTogbnVtYmVyIH1bXTtcbn07XG5cbmNvbnN0IEhJU1RPR1JBTV9FREdFUyA9IFsyLCA0LCA4LCAxNiwgMzIsIDY0XTtcblxuZXhwb3J0IGNsYXNzIFRlbGVtZXRyeUFuYWx5c2lzIHtcbiAgcHJpdmF0ZSBsYXN0Q291bnRlcnM6IG51bWJlcltdIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgbGFzdFN0ZXAgPSAwO1xuICAvLyBleHBsaWNpdCBmaWVsZHMgcmF0aGVyIHRoYW4gY29uc3RydWN0b3IgcGFyYW1ldGVyIHByb3BlcnRpZXM6IHRoZSBtb2R1bGVcbiAgLy8gc3RheXMgbG9hZGFibGUgYnkgbm9kZSdzIHR5cGUtc3RyaXBwaW5nIHRlc3QgcnVubmVyXG4gIHByaXZhdGUgYWN0aW5Db3VudDogbnVtYmVyO1xuICBwcml2YXRlIG1lbWJyYW5lQ291bnQ6IG51bWJlcjtcbiAgcHJpdmF0ZSBtZW1icmFuZVJlc3RMZW5ndGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBydW46IHN0cmluZztcbiAgcHJpdmF0ZSB3ZWxsTWl4ZWQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoYWN0aW5Db3VudDogbnVtYmVyLCBtZW1icmFuZUNvdW50OiBudW1iZXIsIG1lbWJyYW5lUmVzdExlbmd0aDogbnVtYmVyLCBydW46IHN0cmluZywgd2VsbE1peGVkID0gZmFsc2UpIHtcbiAgICB0aGlzLmFjdGluQ291bnQgPSBhY3RpbkNvdW50O1xuICAgIHRoaXMubWVtYnJhbmVDb3VudCA9IG1lbWJyYW5lQ291bnQ7XG4gICAgdGhpcy5tZW1icmFuZVJlc3RMZW5ndGggPSBtZW1icmFuZVJlc3RMZW5ndGg7XG4gICAgdGhpcy5ydW4gPSBydW47XG4gICAgdGhpcy53ZWxsTWl4ZWQgPSB3ZWxsTWl4ZWQ7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLmxhc3RDb3VudGVycyA9IG51bGw7XG4gICAgdGhpcy5sYXN0U3RlcCA9IDA7XG4gIH1cblxuICAvLyBSZXN0IGxlbmd0aCBhbmQgY291bnRzIGNhbiBkaWZmZXIgcGVyIGNlbGwgYW5kIGNoYW5nZSBhdCBydW4gdGltZTsgdGhlXG4gIC8vIHBlci1zdGVwIGNvdW50ZXIgaGlzdG9yeSBpcyBkZWxpYmVyYXRlbHkgcHJlc2VydmVkLlxuICBjb25maWd1cmUoYWN0aW5Db3VudDogbnVtYmVyLCBtZW1icmFuZUNvdW50OiBudW1iZXIsIG1lbWJyYW5lUmVzdExlbmd0aDogbnVtYmVyKSB7XG4gICAgdGhpcy5hY3RpbkNvdW50ID0gYWN0aW5Db3VudDtcbiAgICB0aGlzLm1lbWJyYW5lQ291bnQgPSBtZW1icmFuZUNvdW50O1xuICAgIHRoaXMubWVtYnJhbmVSZXN0TGVuZ3RoID0gbWVtYnJhbmVSZXN0TGVuZ3RoO1xuICB9XG5cbiAgYW5hbHl6ZShcbiAgICBhY3RpbjogQXJyYXlCdWZmZXIsXG4gICAgbWVtYnJhbmVEYXRhOiBBcnJheUJ1ZmZlcixcbiAgICBjb3VudGVyRGF0YTogQXJyYXlCdWZmZXIsXG4gICAgZnJhbWU6IG51bWJlcixcbiAgICBzdGVwOiBudW1iZXIsXG4gICAgZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2U6IG51bWJlcixcbiAgICB2ZXJpZmljYXRpb24gPSBmYWxzZVxuICApIHtcbiAgICBjb25zdCBwcmV2aW91c0NvdW50ZXJzID0gdGhpcy5sYXN0Q291bnRlcnMsXG4gICAgICBwcmV2aW91c1N0ZXAgPSB0aGlzLmxhc3RTdGVwO1xuICAgIGNvbnN0IHdvcmRzID0gbmV3IFVpbnQzMkFycmF5KGFjdGluKTtcbiAgICBjb25zdCBmbG9hdHMgPSBuZXcgRmxvYXQzMkFycmF5KHdvcmRzLmJ1ZmZlcik7XG4gICAgY29uc3QgY291bnRlcnMgPSBBcnJheS5mcm9tKG5ldyBVaW50MzJBcnJheShjb3VudGVyRGF0YSkpO1xuICAgIGNvbnN0IG1lbWJyYW5lID0gbmV3IEZsb2F0MzJBcnJheShtZW1icmFuZURhdGEpO1xuICAgIGNvbnN0IGNlbGwgPSB0aGlzLmNlbGxTaGFwZShtZW1icmFuZSk7XG4gICAgY29uc3Qgc3RhdHMgPSB0aGlzLmNvbXB1dGUod29yZHMsIGZsb2F0cywgY291bnRlcnMsIGZyYW1lLCBzdGVwLCBlcXVpbGlicml1bUxpbmVEaXN0YW5jZSwgY2VsbCk7XG4gICAgLy8gZnVzaW9uL3NjaXNzaW9uIGNhbiByZS1saW5rIHRoZSBtZW1icmFuZSBpbnRvIHNldmVyYWwgbG9vcHMsIHNvIGV2ZXJ5XG4gICAgLy8gcG9seWdvbiBwcmVkaWNhdGUgZm9sbG93cyB0YWlsIGxpbmtzIGluc3RlYWQgb2YgaW5kZXggb3JkZXJcbiAgICBjb25zdCBpbnNpZGUgPSBwb2x5Z29uT2NjdXBhbmN5KG1lbWJyYW5lLCBTRUdNRU5UX1dPUkRTLCB0aGlzLndlbGxNaXhlZCwgeyBsaW5rczogdHJ1ZSB9KTtcbiAgICBjb25zdCBjcm9zc2luZyA9IHRoaXMud2VsbE1peGVkID8gcG9seWdvbkJvbmRDcm9zc2luZyhtZW1icmFuZSwgU0VHTUVOVF9XT1JEUywgeyBsaW5rczogdHJ1ZSB9KSA6IG51bGw7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmFjdGluQ291bnQ7IGkrKykge1xuICAgICAgY29uc3QgZGlzY29ubmVjdGVkID0gd29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBUQUlMXSA9PT0gaSAmJiB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIEhFQURdID09PSBpO1xuICAgICAgaWYgKHRoaXMud2VsbE1peGVkICYmIGRpc2Nvbm5lY3RlZCkgY29udGludWU7IC8vIHJlc2Vydm9pciBlbnRyaWVzIGhhdmUgbm8gc3BhdGlhbCBjb29yZGluYXRlc1xuICAgICAgY29uc3QgdGFpbCA9IHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF07XG4gICAgICBpZiAoXG4gICAgICAgIGNyb3NzaW5nICYmXG4gICAgICAgIHRhaWwgIT09IGkgJiZcbiAgICAgICAgY3Jvc3NpbmcoZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgMl0sIGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDNdLCBmbG9hdHNbdGFpbCAqIFNFR01FTlRfV09SRFMgKyAyXSwgZmxvYXRzW3RhaWwgKiBTRUdNRU5UX1dPUkRTICsgM10pXG4gICAgICApXG4gICAgICAgIHN0YXRzLmNyb3NzaW5nRmlsYW1lbnRCb25kcysrO1xuICAgICAgaWYgKCFpbnNpZGUoZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgMl0sIGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDNdKSkgY29udGludWU7XG4gICAgICBpZiAod29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBUQUlMXSA9PT0gaSAmJiB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIEhFQURdID09PSBpKSBzdGF0cy5pbnNpZGVNb25vbWVyQmVhZHMrKztcbiAgICAgIGVsc2Ugc3RhdHMuaW5zaWRlUG9seW1lckJlYWRzKys7XG4gICAgfVxuICAgIHN0YXRzLmdBY3RpbkNvbmNlbnRyYXRpb24gPSB0aGlzLndlbGxNaXhlZCA/IHN0YXRzLmdBY3RpbkFtb3VudCAvICgoY2VsbC5hcmVhICogKHRoaXMubWVtYnJhbmVDb3VudCAqIHRoaXMubWVtYnJhbmVSZXN0TGVuZ3RoKSAqKiAyKSAvICg0ICogTWF0aC5QSSkpIDogMDtcbiAgICBzdGF0cy5kaWFnbm9zdGljS2luZCA9IHZlcmlmaWNhdGlvbiA/IFwiY29udGFjdC1yZWNoZWNrXCIgOiBcInNpbXVsYXRpb25cIjtcbiAgICBpZiAodmVyaWZpY2F0aW9uKSB7XG4gICAgICB0aGlzLmxhc3RDb3VudGVycyA9IHByZXZpb3VzQ291bnRlcnM7XG4gICAgICB0aGlzLmxhc3RTdGVwID0gcHJldmlvdXNTdGVwO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdHM7XG4gIH1cblxuICAvLyBNZW1icmFuZSBlZGdlcyBmb2xsb3cgdGhlIHJ1bnRpbWUgdGFpbCBsaW5rczogYWZ0ZXIgZnVzaW9uL3NjaXNzaW9uIHRoZVxuICAvLyBzYW1lIGJ1ZmZlciBob2xkcyBvbmUgb3V0ZXIgbG9vcCBwbHVzIGlubmVyIGxvb3BzIG9mIG9wcG9zaXRlIHdpbmRpbmcsIHNvXG4gIC8vIHRoZSBzaWduZWQgc2hvZWxhY2Ugc3VtIG92ZXIgYWxsIGxpbmsgZWRnZXMgaXMgdGhlIGN5dG9wbGFzbSBhcmVhIChvdXRlclxuICAvLyBtaW51cyBpbm5lcikgYW5kIHRoZSBjZW50cm9pZCBpcyB0aGUgY3l0b3BsYXNtIGNlbnRyb2lkLiBUaGUgbGVnYWN5IGZpZWxkc1xuICAvLyBmcm9udFgsIHJlYXJYLCBsZW5ndGgsIGZyb250U3BhY2luZyBhbmQgcmVhclNwYWNpbmcgc3RheSBpbmRleC1iYXNlZC5cbiAgcHJpdmF0ZSBjZWxsU2hhcGUoZmxvYXRzOiBGbG9hdDMyQXJyYXkpOiBDZWxsU2hhcGUge1xuICAgIGNvbnN0IG4gPSB0aGlzLm1lbWJyYW5lQ291bnQ7XG4gICAgY29uc3Qgd29yZHMgPSBuZXcgVWludDMyQXJyYXkoZmxvYXRzLmJ1ZmZlciwgZmxvYXRzLmJ5dGVPZmZzZXQsIGZsb2F0cy5sZW5ndGgpO1xuICAgIGNvbnN0IHggPSAoaTogbnVtYmVyKSA9PiBmbG9hdHNbaSAqIFNFR01FTlRfV09SRFMgKyAyXTtcbiAgICBjb25zdCB5ID0gKGk6IG51bWJlcikgPT4gZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgM107XG4gICAgY29uc3QgcmVzdEFyZWEgPSAobiAqIHRoaXMubWVtYnJhbmVSZXN0TGVuZ3RoKSAqKiAyIC8gKDQgKiBNYXRoLlBJKTtcbiAgICBsZXQgbGVmdCA9IEluZmluaXR5O1xuICAgIGxldCByaWdodCA9IC1JbmZpbml0eTtcbiAgICBsZXQgdG9wID0gSW5maW5pdHk7XG4gICAgbGV0IGJvdHRvbSA9IC1JbmZpbml0eTtcbiAgICAvLyBhcmVhLXdlaWdodGVkIGNlbnRyb2lkIChzaG9lbGFjZSkgb3ZlciBhbGwgbGluayBlZGdlc1xuICAgIGxldCBhcmVhID0gMDtcbiAgICBsZXQgY3ggPSAwO1xuICAgIGxldCBjeSA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIGxlZnQgPSBNYXRoLm1pbihsZWZ0LCB4KGkpKTtcbiAgICAgIHJpZ2h0ID0gTWF0aC5tYXgocmlnaHQsIHgoaSkpO1xuICAgICAgdG9wID0gTWF0aC5taW4odG9wLCB5KGkpKTtcbiAgICAgIGJvdHRvbSA9IE1hdGgubWF4KGJvdHRvbSwgeShpKSk7XG4gICAgICBjb25zdCB0YWlsID0gd29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBUQUlMXTtcbiAgICAgIGlmICh0YWlsID09PSBpIHx8IHRhaWwgPj0gbikgY29udGludWU7IC8vIGZyZWUgdmVydGV4IG9yIGRlYWQgbGluazogbm8gZWRnZVxuICAgICAgY29uc3QgY3Jvc3MgPSB4KGkpICogeSh0YWlsKSAtIHgodGFpbCkgKiB5KGkpO1xuICAgICAgYXJlYSArPSBjcm9zcyAvIDI7XG4gICAgICBjeCArPSAoeChpKSArIHgodGFpbCkpICogY3Jvc3M7XG4gICAgICBjeSArPSAoeShpKSArIHkodGFpbCkpICogY3Jvc3M7XG4gICAgfVxuICAgIGNvbnN0IHRvcG9sb2d5ID0gcG9seWdvbkxvb3BzKGZsb2F0cywgU0VHTUVOVF9XT1JEUywgbik7XG4gICAgY29uc3QgbG9vcEFyZWFzID0gdG9wb2xvZ3kubG9vcEFyZWFzLm1hcCgobG9vcCkgPT4gKHsgdmVydGljZXM6IGxvb3AudmVydGljZXMsIGFyZWE6IGxvb3AuYXJlYSAvIHJlc3RBcmVhIH0pKTtcbiAgICBjb25zdCByZWFyID0gbiA+PiAxO1xuICAgIGNvbnN0IHF1YXJ0ZXJTcGFjaW5nID0gKGNlbnRlcjogbnVtYmVyKSA9PiB7XG4gICAgICBsZXQgc3VtID0gMDtcbiAgICAgIGZvciAobGV0IGsgPSAtKG4gPj4gMyk7IGsgPCBuID4+IDM7IGsrKykge1xuICAgICAgICBjb25zdCBpID0gKGNlbnRlciArIGsgKyBuKSAlIG47XG4gICAgICAgIGNvbnN0IGogPSAoaSArIDEpICUgbjtcbiAgICAgICAgc3VtICs9IE1hdGguaHlwb3QoeChqKSAtIHgoaSksIHkoaikgLSB5KGkpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdW0gLyAobiA+PiAyKSAvIHRoaXMubWVtYnJhbmVSZXN0TGVuZ3RoO1xuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgIGxlZnQsXG4gICAgICByaWdodCxcbiAgICAgIHRvcCxcbiAgICAgIGJvdHRvbSxcbiAgICAgIGZyb250WDogeCgwKSxcbiAgICAgIHJlYXJYOiB4KHJlYXIpLFxuICAgICAgY2VudHJvaWRYOiBjeCAvICg2ICogYXJlYSksXG4gICAgICBjZW50cm9pZFk6IGN5IC8gKDYgKiBhcmVhKSxcbiAgICAgIGxlbmd0aDogTWF0aC5oeXBvdCh4KDApIC0geChyZWFyKSwgeSgwKSAtIHkocmVhcikpLFxuICAgICAgYXJlYTogTWF0aC5hYnMoYXJlYSkgLyByZXN0QXJlYSxcbiAgICAgIGZyb250U3BhY2luZzogcXVhcnRlclNwYWNpbmcoMCksXG4gICAgICByZWFyU3BhY2luZzogcXVhcnRlclNwYWNpbmcocmVhciksXG4gICAgICBsb29wczogdG9wb2xvZ3kubG9vcHMsXG4gICAgICBtZW1icmFuZUJyb2tlbkxpbmtzOiB0b3BvbG9neS5icm9rZW5MaW5rcyxcbiAgICAgIGxvb3BBcmVhcyxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBjb21wdXRlKHdvcmRzOiBVaW50MzJBcnJheSwgZmxvYXRzOiBGbG9hdDMyQXJyYXksIGNvdW50ZXJzOiBudW1iZXJbXSwgZnJhbWU6IG51bWJlciwgc3RlcDogbnVtYmVyLCByZXN0TGVuZ3RoOiBudW1iZXIsIGNlbGw6IENlbGxTaGFwZSk6IEFjdGluU3RhdHMge1xuICAgIGNvbnN0IG4gPSB0aGlzLmFjdGluQ291bnQ7XG4gICAgY29uc3QgdmlzaXRlZCA9IG5ldyBVaW50OEFycmF5KG4pO1xuICAgIGNvbnN0IGxlbmd0aHM6IG51bWJlcltdID0gW107XG4gICAgbGV0IG1vbm9tZXJzID0gMDtcbiAgICBsZXQgYnJva2VuTGlua3MgPSAwO1xuICAgIGxldCBjeWNsZXMgPSAwO1xuICAgIGxldCBicmFuY2hlcyA9IDA7XG4gICAgbGV0IHBvc3RlcmlvclBvbHltZXJCZWFkcyA9IDA7XG4gICAgbGV0IGFnZVN1bSA9IDAsXG4gICAgICBtYXhBZ2UgPSAwO1xuICAgIGNvbnN0IGJvbmRMZW5ndGhzOiBudW1iZXJbXSA9IFtdO1xuICAgIGNvbnN0IGJlbmRBbmdsZXM6IG51bWJlcltdID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgY29uc3QgdGFpbCA9IHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF07XG4gICAgICBjb25zdCBoZWFkID0gd29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBIRUFEXTtcbiAgICAgIGlmICh0YWlsID09PSBpICYmIGhlYWQgPT09IGkpIHtcbiAgICAgICAgbW9ub21lcnMrKztcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCBhZ2UgPSBmbG9hdHNbaSAqIFNFR01FTlRfV09SRFMgKyA5XTtcbiAgICAgIGFnZVN1bSArPSBhZ2U7XG4gICAgICBtYXhBZ2UgPSBNYXRoLm1heChtYXhBZ2UsIGFnZSk7XG4gICAgICBpZiAoZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgMl0gPCAoY2VsbC5mcm9udFggKyBjZWxsLnJlYXJYKSAvIDIpIHBvc3RlcmlvclBvbHltZXJCZWFkcysrO1xuICAgICAgaWYgKGhlYWQgIT09IGkgJiYgd29yZHNbaGVhZCAqIFNFR01FTlRfV09SRFMgKyBUQUlMXSAhPT0gaSkge1xuICAgICAgICBicm9rZW5MaW5rcysrO1xuICAgICAgfVxuICAgICAgLy8gYSBicmFuY2ggcm9vdCdzIHRhaWwgaXMgaXRzIG1vdGhlciwgd2hvc2UgaGVhZCBwb2ludHMgZWxzZXdoZXJlIGFsb25nIHRoZSBtb3RoZXIgZmlsYW1lbnRcbiAgICAgIGNvbnN0IGlzQnJhbmNoUm9vdCA9IHRhaWwgIT09IGkgJiYgd29yZHNbdGFpbCAqIFNFR01FTlRfV09SRFMgKyBIRUFEXSAhPT0gaTtcbiAgICAgIGlmICh0YWlsICE9PSBpICYmICFpc0JyYW5jaFJvb3QpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBicmFuY2hlcyArPSBpc0JyYW5jaFJvb3QgPyAxIDogMDtcbiAgICAgIC8vIGEgbWludXMgZW5kIG9yIGJyYW5jaCByb290OiB3YWxrIHRvIHRoZSBwbHVzIGVuZFxuICAgICAgbGV0IGxlbmd0aCA9IDE7XG4gICAgICBsZXQgY3VycmVudCA9IGk7XG4gICAgICBsZXQgcHJldkR4ID0gMDtcbiAgICAgIGxldCBwcmV2RHkgPSAwO1xuICAgICAgdmlzaXRlZFtpXSA9IDE7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBjb25zdCBuZXh0ID0gd29yZHNbY3VycmVudCAqIFNFR01FTlRfV09SRFMgKyBIRUFEXTtcbiAgICAgICAgaWYgKG5leHQgPT09IGN1cnJlbnQpIGJyZWFrO1xuICAgICAgICBpZiAodmlzaXRlZFtuZXh0XSkge1xuICAgICAgICAgIGN5Y2xlcysrO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGR4ID0gZmxvYXRzW25leHQgKiBTRUdNRU5UX1dPUkRTICsgMl0gLSBmbG9hdHNbY3VycmVudCAqIFNFR01FTlRfV09SRFMgKyAyXTtcbiAgICAgICAgY29uc3QgZHkgPSBmbG9hdHNbbmV4dCAqIFNFR01FTlRfV09SRFMgKyAzXSAtIGZsb2F0c1tjdXJyZW50ICogU0VHTUVOVF9XT1JEUyArIDNdO1xuICAgICAgICBib25kTGVuZ3Rocy5wdXNoKE1hdGguaHlwb3QoZHgsIGR5KSk7XG4gICAgICAgIGlmIChsZW5ndGggPiAxKSB7XG4gICAgICAgICAgYmVuZEFuZ2xlcy5wdXNoKChNYXRoLmFicyhNYXRoLmF0YW4yKHByZXZEeCAqIGR5IC0gcHJldkR5ICogZHgsIHByZXZEeCAqIGR4ICsgcHJldkR5ICogZHkpKSAqIDE4MCkgLyBNYXRoLlBJKTtcbiAgICAgICAgfVxuICAgICAgICBwcmV2RHggPSBkeDtcbiAgICAgICAgcHJldkR5ID0gZHk7XG4gICAgICAgIHZpc2l0ZWRbbmV4dF0gPSAxO1xuICAgICAgICBjdXJyZW50ID0gbmV4dDtcbiAgICAgICAgbGVuZ3RoKys7XG4gICAgICB9XG4gICAgICBsZW5ndGhzLnB1c2gobGVuZ3RoKTtcbiAgICB9XG5cbiAgICBsZW5ndGhzLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgICBjb25zdCBpblBvbHltZXIgPSBsZW5ndGhzLnJlZHVjZSgoc3VtLCBsKSA9PiBzdW0gKyBsLCAwKTtcbiAgICBjb25zdCBoaXN0b2dyYW0gPSBuZXcgQXJyYXkoSElTVE9HUkFNX0VER0VTLmxlbmd0aCArIDEpLmZpbGwoMCk7XG4gICAgZm9yIChjb25zdCBsIG9mIGxlbmd0aHMpIHtcbiAgICAgIGNvbnN0IGJpbiA9IEhJU1RPR1JBTV9FREdFUy5maW5kSW5kZXgoKGVkZ2UpID0+IGwgPD0gZWRnZSk7XG4gICAgICBoaXN0b2dyYW1bYmluID09PSAtMSA/IEhJU1RPR1JBTV9FREdFUy5sZW5ndGggOiBiaW5dKys7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RlcHMgPSBNYXRoLm1heCgxLCBzdGVwIC0gdGhpcy5sYXN0U3RlcCk7XG4gICAgY29uc3QgcGVyU3RlcCA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgIFRFTEVNRVRSWV9DT1VOVEVSUy5tYXAoKG5hbWUsIGspID0+IFtuYW1lLCB0aGlzLmxhc3RDb3VudGVycyA/IChjb3VudGVyc1trXSAtIHRoaXMubGFzdENvdW50ZXJzW2tdKSAvIHN0ZXBzIDogMF0pXG4gICAgKSBhcyBDb3VudGVycztcbiAgICB0aGlzLmxhc3RDb3VudGVycyA9IGNvdW50ZXJzO1xuICAgIHRoaXMubGFzdFN0ZXAgPSBzdGVwO1xuXG4gICAgY29uc3QgcXVhbnRpbGUgPSAocTogbnVtYmVyKSA9PiAobGVuZ3Rocy5sZW5ndGggPyBsZW5ndGhzW01hdGgubWluKGxlbmd0aHMubGVuZ3RoIC0gMSwgTWF0aC5mbG9vcihxICogbGVuZ3Rocy5sZW5ndGgpKV0gOiAwKTtcbiAgICByZXR1cm4ge1xuICAgICAgcnVuOiB0aGlzLnJ1bixcbiAgICAgIGZyYW1lLFxuICAgICAgc3RlcCxcbiAgICAgIGFjdGluQ291bnQ6IG4sXG4gICAgICBtb25vbWVycyxcbiAgICAgIGZpbGFtZW50czogbGVuZ3Rocy5sZW5ndGgsXG4gICAgICBicmFuY2hlcyxcbiAgICAgIGluUG9seW1lcixcbiAgICAgIHBvc3RlcmlvclBvbHltZXJCZWFkcyxcbiAgICAgIGluc2lkZVBvbHltZXJCZWFkczogMCxcbiAgICAgIGluc2lkZU1vbm9tZXJCZWFkczogMCxcbiAgICAgIGdBY3Rpbk1vZGU6IHRoaXMud2VsbE1peGVkID8gXCJ3ZWxsLW1peGVkXCIgOiBcInBhcnRpY2xlc1wiLFxuICAgICAgZ0FjdGluQW1vdW50OiBtb25vbWVycyxcbiAgICAgIGdBY3RpbkNvbmNlbnRyYXRpb246IDAsXG4gICAgICBhY3RpbkJhbGFuY2VFcnJvcjogbW9ub21lcnMgKyBpblBvbHltZXIgLSBuLFxuICAgICAgY3Jvc3NpbmdGaWxhbWVudEJvbmRzOiAwLFxuICAgICAgbWVhblBvbHltZXJBZ2U6IG4gPiBtb25vbWVycyA/IGFnZVN1bSAvIChuIC0gbW9ub21lcnMpIDogMCxcbiAgICAgIG1heFBvbHltZXJBZ2U6IG1heEFnZSxcbiAgICAgIG1lYW5MZW5ndGg6IGxlbmd0aHMubGVuZ3RoID8gaW5Qb2x5bWVyIC8gbGVuZ3Rocy5sZW5ndGggOiAwLFxuICAgICAgbWVkaWFuTGVuZ3RoOiBxdWFudGlsZSgwLjUpLFxuICAgICAgcDkwTGVuZ3RoOiBxdWFudGlsZSgwLjkpLFxuICAgICAgbWF4TGVuZ3RoOiBsZW5ndGhzLmxlbmd0aCA/IGxlbmd0aHNbbGVuZ3Rocy5sZW5ndGggLSAxXSA6IDAsXG4gICAgICBoaXN0b2dyYW0sXG4gICAgICBtZWRpYW5Cb25kTGVuZ3RoOiBib25kTGVuZ3Rocy5sZW5ndGggPyBib25kTGVuZ3Rocy5zb3J0KChhLCBiKSA9PiBhIC0gYilbYm9uZExlbmd0aHMubGVuZ3RoID4+IDFdIC8gcmVzdExlbmd0aCA6IDAsXG4gICAgICBtZWRpYW5CZW5kQW5nbGU6IGJlbmRBbmdsZXMubGVuZ3RoID8gYmVuZEFuZ2xlcy5zb3J0KChhLCBiKSA9PiBhIC0gYilbYmVuZEFuZ2xlcy5sZW5ndGggPj4gMV0gOiAwLFxuICAgICAgYnJva2VuTGlua3MsXG4gICAgICBjeWNsZXMsXG4gICAgICBwZXJTdGVwLFxuICAgICAgY2VsbCxcbiAgICB9O1xuICB9XG59XG4iLCJpbXBvcnQgeyBUZWxlbWV0cnlBbmFseXNpcyB9IGZyb20gXCIuL3RlbGVtZXRyeS1hbmFseXNpc1wiO1xudHlwZSBDb25maWcgPSBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgc3RyaW5nLCBib29sZWFuXTtcbi8vIHBlci1jZWxsIGFuYWx5c2lzIHNpemluZzogY2VsbHMgY2FuIGRpZmZlciBpbiByZXN0IGxlbmd0aCBhbmQgY291bnRzLCBhbmRcbi8vIG9uZSB3b3JrZXIga2VlcHMgYSBzZXBhcmF0ZSBjb3VudGVyIGhpc3RvcnkgcGVyIGtleSBzbyB0aGV5IG5ldmVyIG1peFxudHlwZSBTcGVjID0geyBrZXk6IG51bWJlcjsgYWN0aW46IG51bWJlcjsgbWVtYnJhbmU6IG51bWJlcjsgcmVzdDogbnVtYmVyIH07XG50eXBlIEpvYiA9XG4gIHwgeyB0eXBlOiBcImluaXRcIjsgY29uZmlnOiBDb25maWcgfVxuICB8IHsgdHlwZTogXCJyZXNldFwiIH1cbiAgfCB7XG4gICAgICB0eXBlOiBcImFuYWx5emVcIjtcbiAgICAgIGlkOiBudW1iZXI7XG4gICAgICBhY3RpbjogQXJyYXlCdWZmZXI7XG4gICAgICBtZW1icmFuZTogQXJyYXlCdWZmZXI7XG4gICAgICBjb3VudGVyczogQXJyYXlCdWZmZXI7XG4gICAgICBmcmFtZTogbnVtYmVyO1xuICAgICAgc3RlcDogbnVtYmVyO1xuICAgICAgcmVzdDogbnVtYmVyO1xuICAgICAgdmVyaWZpY2F0aW9uPzogYm9vbGVhbjtcbiAgICAgIHNwZWM/OiBTcGVjO1xuICAgIH07XG5jb25zdCBzY29wZSA9IHNlbGYgYXMgdW5rbm93biBhcyB7IG9ubWVzc2FnZTogKGV2ZW50OiBNZXNzYWdlRXZlbnQ8Sm9iPikgPT4gdm9pZDsgcG9zdE1lc3NhZ2U6IChtZXNzYWdlOiB1bmtub3duKSA9PiB2b2lkIH07XG5sZXQgYW5hbHlzaXM6IFRlbGVtZXRyeUFuYWx5c2lzO1xubGV0IGNvbmZpZzogQ29uZmlnIHwgbnVsbCA9IG51bGw7XG5jb25zdCBhbmFseXNlcyA9IG5ldyBNYXA8bnVtYmVyLCBUZWxlbWV0cnlBbmFseXNpcz4oKTtcbnNjb3BlLm9ubWVzc2FnZSA9ICh7IGRhdGEgfSkgPT4ge1xuICBpZiAoZGF0YS50eXBlID09PSBcImluaXRcIikge1xuICAgIGNvbmZpZyA9IGRhdGEuY29uZmlnO1xuICAgIGFuYWx5c2lzID0gbmV3IFRlbGVtZXRyeUFuYWx5c2lzKC4uLmRhdGEuY29uZmlnKTtcbiAgICBhbmFseXNlcy5jbGVhcigpOyAvLyBrZXllZCBpbnN0YW5jZXMgYXJlIGNyZWF0ZWQgbGF6aWx5IGZyb20gdGhpcyBjb25maWdcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGRhdGEudHlwZSA9PT0gXCJyZXNldFwiKSB7XG4gICAgYW5hbHlzaXMucmVzZXQoKTtcbiAgICBmb3IgKGNvbnN0IGtleWVkIG9mIGFuYWx5c2VzLnZhbHVlcygpKSBrZXllZC5yZXNldCgpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICB0cnkge1xuICAgIGxldCBpbnN0YW5jZSA9IGFuYWx5c2lzO1xuICAgIGlmIChkYXRhLnNwZWMpIHtcbiAgICAgIGluc3RhbmNlID1cbiAgICAgICAgYW5hbHlzZXMuZ2V0KGRhdGEuc3BlYy5rZXkpID8/XG4gICAgICAgIG5ldyBUZWxlbWV0cnlBbmFseXNpcyhkYXRhLnNwZWMuYWN0aW4sIGRhdGEuc3BlYy5tZW1icmFuZSwgZGF0YS5zcGVjLnJlc3QsIGNvbmZpZz8uWzNdID8/IFwiXCIsIGNvbmZpZz8uWzRdID8/IGZhbHNlKTtcbiAgICAgIGFuYWx5c2VzLnNldChkYXRhLnNwZWMua2V5LCBpbnN0YW5jZSk7XG4gICAgICBpbnN0YW5jZS5jb25maWd1cmUoZGF0YS5zcGVjLmFjdGluLCBkYXRhLnNwZWMubWVtYnJhbmUsIGRhdGEuc3BlYy5yZXN0KTtcbiAgICB9XG4gICAgY29uc3Qgc3RhdHMgPSBpbnN0YW5jZS5hbmFseXplKGRhdGEuYWN0aW4sIGRhdGEubWVtYnJhbmUsIGRhdGEuY291bnRlcnMsIGRhdGEuZnJhbWUsIGRhdGEuc3RlcCwgZGF0YS5yZXN0LCBkYXRhLnZlcmlmaWNhdGlvbik7XG4gICAgc2NvcGUucG9zdE1lc3NhZ2UoeyBpZDogZGF0YS5pZCwgc3RhdHMsIGFuYWx5c2lzTXM6IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnQgfSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgc2NvcGUucG9zdE1lc3NhZ2UoeyBpZDogZGF0YS5pZCwgZXJyb3I6IFN0cmluZyhlcnJvcikgfSk7XG4gIH1cbn07XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=