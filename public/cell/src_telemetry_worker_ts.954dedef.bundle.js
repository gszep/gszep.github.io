/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/occupancy.ts":
/*!**************************!*\
  !*** ./src/occupancy.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   polygonBondCrossing: () => (/* binding */ polygonBondCrossing),
/* harmony export */   polygonOccupancy: () => (/* binding */ polygonOccupancy)
/* harmony export */ });
// Conservative y-band edge index. Predicates remain exact; long edges are
// retained in a global list and long bond queries fall back to all edges.
// No boundary/collision is discarded to improve diagnostic latency.
const BAND = 4;
function edgeIndex(membrane, stride, reverse = false) {
    const n = membrane.length / stride;
    const edges = [], rows = new Map(), wide = [];
    for (let i = 0; i < n; i++) {
        const j = (i + (reverse ? n - 1 : 1)) % n;
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
function polygonOccupancy(membrane, stride = 10, exact = false) {
    const { rows, wide } = edgeIndex(membrane, stride, true);
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
function polygonBondCrossing(membrane, stride = 10) {
    const { edges, rows, wide } = edgeIndex(membrane, stride);
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
    actinCount;
    membraneCount;
    membraneRestLength;
    run;
    wellMixed;
    lastCounters = null;
    lastStep = 0;
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
    analyze(actin, membraneData, counterData, frame, step, equilibriumLineDistance, verification = false) {
        const previousCounters = this.lastCounters, previousStep = this.lastStep;
        const words = new Uint32Array(actin);
        const floats = new Float32Array(words.buffer);
        const counters = Array.from(new Uint32Array(counterData));
        const membrane = new Float32Array(membraneData);
        const cell = this.cellShape(membrane);
        const stats = this.compute(words, floats, counters, frame, step, equilibriumLineDistance, cell);
        const inside = (0,_occupancy__WEBPACK_IMPORTED_MODULE_0__.polygonOccupancy)(membrane, SEGMENT_WORDS, this.wellMixed);
        const crossing = this.wellMixed ? (0,_occupancy__WEBPACK_IMPORTED_MODULE_0__.polygonBondCrossing)(membrane) : null;
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
    cellShape(floats) {
        const n = this.membraneCount;
        const x = (i) => floats[i * SEGMENT_WORDS + 2];
        const y = (i) => floats[i * SEGMENT_WORDS + 3];
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;
        // area-weighted centroid (shoelace)
        let area = 0;
        let cx = 0;
        let cy = 0;
        for (let i = 0; i < n; i++) {
            left = Math.min(left, x(i));
            right = Math.max(right, x(i));
            top = Math.min(top, y(i));
            bottom = Math.max(bottom, y(i));
            const j = (i + 1) % n;
            const cross = x(i) * y(j) - x(j) * y(i);
            area += cross / 2;
            cx += (x(i) + x(j)) * cross;
            cy += (y(i) + y(j)) * cross;
        }
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
        const restArea = (n * this.membraneRestLength) ** 2 / (4 * Math.PI);
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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************************!*\
  !*** ./src/telemetry.worker.ts ***!
  \*********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _telemetry_analysis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./telemetry-analysis */ "./src/telemetry-analysis.ts");

const scope = self;
let analysis;
scope.onmessage = ({ data }) => {
    if (data.type === "init") {
        analysis = new _telemetry_analysis__WEBPACK_IMPORTED_MODULE_0__.TelemetryAnalysis(...data.config);
        return;
    }
    if (data.type === "reset") {
        analysis.reset();
        return;
    }
    const start = performance.now();
    try {
        const stats = analysis.analyze(data.actin, data.membrane, data.counters, data.frame, data.step, data.rest, data.verification);
        scope.postMessage({ id: data.id, stats, analysisMs: performance.now() - start });
    }
    catch (error) {
        scope.postMessage({ id: data.id, error: String(error) });
    }
};

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3RlbGVtZXRyeV93b3JrZXJfdHMuOTU0ZGVkZWYuYnVuZGxlLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFDMUUsb0VBQW9FO0FBQ3BFLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQztBQUVmLFNBQVMsU0FBUyxDQUFDLFFBQXNCLEVBQUUsTUFBYyxFQUFFLE9BQU8sR0FBRyxLQUFLO0lBQ3hFLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ25DLE1BQU0sS0FBSyxHQUFXLEVBQUUsRUFDdEIsSUFBSSxHQUFHLElBQUksR0FBRyxFQUFrQixFQUNoQyxJQUFJLEdBQVcsRUFBRSxDQUFDO0lBQ3BCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMzQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQ2hDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFDNUIsRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUM3QixFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFBRSxNQUFNLElBQUksS0FBSyxD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RSxLQUFLLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzNELENBQUM7QUFDSCxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL29jY3VwYW5jeS50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3RlbGVtZXRyeS1hbmFseXNpcy50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy90ZWxlbWV0cnkud29ya2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvbnNlcnZhdGl2ZSB5LWJhbmQgZWRnZSBpbmRleC4gUHJlZGljYXRlcyByZW1haW4gZXhhY3Q7IGxvbmcgZWRnZXMgYXJlXG4vLyByZXRhaW5lZCBpbiBhIGdsb2JhbCBsaXN0IGFuZCBsb25nIGJvbmQgcXVlcmllcyBmYWxsIGJhY2sgdG8gYWxsIGVkZ2VzLlxuLy8gTm8gYm91bmRhcnkvY29sbGlzaW9uIGlzIGRpc2NhcmRlZCB0byBpbXByb3ZlIGRpYWdub3N0aWMgbGF0ZW5jeS5cbmNvbnN0IEJBTkQgPSA0O1xudHlwZSBFZGdlID0geyB4OiBudW1iZXI7IHk6IG51bWJlcjsgZHg6IG51bWJlcjsgZHk6IG51bWJlcjsgbHg6IG51bWJlcjsgaHg6IG51bWJlcjsgbHk6IG51bWJlcjsgaHk6IG51bWJlciB9O1xuZnVuY3Rpb24gZWRnZUluZGV4KG1lbWJyYW5lOiBGbG9hdDMyQXJyYXksIHN0cmlkZTogbnVtYmVyLCByZXZlcnNlID0gZmFsc2UpIHtcbiAgY29uc3QgbiA9IG1lbWJyYW5lLmxlbmd0aCAvIHN0cmlkZTtcbiAgY29uc3QgZWRnZXM6IEVkZ2VbXSA9IFtdLFxuICAgIHJvd3MgPSBuZXcgTWFwPG51bWJlciwgRWRnZVtdPigpLFxuICAgIHdpZGU6IEVkZ2VbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xuICAgIGNvbnN0IGogPSAoaSArIChyZXZlcnNlID8gbiAtIDEgOiAxKSkgJSBuO1xuICAgIGNvbnN0IHggPSBtZW1icmFuZVtpICogc3RyaWRlICsgMl0sXG4gICAgICB5ID0gbWVtYnJhbmVbaSAqIHN0cmlkZSArIDNdLFxuICAgICAgYnggPSBtZW1icmFuZVtqICogc3RyaWRlICsgMl0sXG4gICAgICBieSA9IG1lbWJyYW5lW2ogKiBzdHJpZGUgKyAzXTtcbiAgICBpZiAoIVt4LCB5LCBieCwgYnldLmV2ZXJ5KE51bWJlci5pc0Zpbml0ZSkpIHRocm93IG5ldyBFcnJvcihcIk5vbi1maW5pdGUgbWVtYnJhbmUgZ2VvbWV0cnlcIik7XG4gICAgY29uc3QgZSA9IHsgeCwgeSwgZHg6IGJ4IC0geCwgZHk6IGJ5IC0geSwgbHg6IE1hdGgubWluKHgsIGJ4KSwgaHg6IE1hdGgubWF4KHgsIGJ4KSwgbHk6IE1hdGgubWluKHksIGJ5KSwgaHk6IE1hdGgubWF4KHksIGJ5KSB9O1xuICAgIGVkZ2VzLnB1c2goZSk7XG4gICAgY29uc3QgbG93ID0gTWF0aC5mbG9vcihlLmx5IC8gQkFORCksXG4gICAgICBoaWdoID0gTWF0aC5mbG9vcihlLmh5IC8gQkFORCk7XG4gICAgaWYgKGhpZ2ggLSBsb3cgPiAyNTYpIHtcbiAgICAgIHdpZGUucHVzaChlKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBmb3IgKGxldCByb3cgPSBsb3c7IHJvdyA8PSBoaWdoOyByb3crKykge1xuICAgICAgY29uc3QgbGlzdCA9IHJvd3MuZ2V0KHJvdyk7XG4gICAgICBpZiAobGlzdCkgbGlzdC5wdXNoKGUpO1xuICAgICAgZWxzZSByb3dzLnNldChyb3csIFtlXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB7IGVkZ2VzLCByb3dzLCB3aWRlIH07XG59XG5cbi8vIExlZ2FjeSBwYXJ0aWNsZSBjb3VudHMgdXNlIHBpeGVsLXJvdyBzYW1wbGluZzsgZXhwbGljaXQtZmlsYW1lbnQgbW9kZSB1c2VzXG4vLyBleGFjdCB5IGNvb3JkaW5hdGVzLiBUaGUgZ2VvbWV0cnkgZm9ybXVsYS9vcmRlciBtYXRjaGVzIHRoZSBwcmlvciBmdWxsIHNjYW4uXG5leHBvcnQgZnVuY3Rpb24gcG9seWdvbk9jY3VwYW5jeShtZW1icmFuZTogRmxvYXQzMkFycmF5LCBzdHJpZGUgPSAxMCwgZXhhY3QgPSBmYWxzZSkge1xuICBjb25zdCB7IHJvd3MsIHdpZGUgfSA9IGVkZ2VJbmRleChtZW1icmFuZSwgc3RyaWRlLCB0cnVlKTtcbiAgY29uc3QgY2FjaGUgPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyW10+KCk7XG4gIHJldHVybiAoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh4KSB8fCAhTnVtYmVyLmlzRmluaXRlKHkpKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcih5KSxcbiAgICAgIHNjYW5ZID0gZXhhY3QgPyB5IDogcm93ICsgMC41O1xuICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSByb3dzLmdldChNYXRoLmZsb29yKHNjYW5ZIC8gQkFORCkpID8/IFtdO1xuICAgIGlmIChleGFjdCkge1xuICAgICAgbGV0IGluc2lkZSA9IGZhbHNlO1xuICAgICAgZm9yIChjb25zdCBsaXN0IG9mIFtjYW5kaWRhdGVzLCB3aWRlXSlcbiAgICAgICAgZm9yIChjb25zdCBlIG9mIGxpc3QpIHtcbiAgICAgICAgICBpZiAoZS55ID4gc2NhblkgIT0gZS55ICsgZS5keSA+IHNjYW5ZICYmIGUueCArICgoc2NhblkgLSBlLnkpICogZS5keCkgLyBlLmR5IDw9IHgpIGluc2lkZSA9ICFpbnNpZGU7XG4gICAgICAgIH1cbiAgICAgIHJldHVybiBpbnNpZGU7XG4gICAgfVxuICAgIGxldCBjcm9zc2luZ3MgPSBjYWNoZS5nZXQocm93KTtcbiAgICBpZiAoIWNyb3NzaW5ncykge1xuICAgICAgY3Jvc3NpbmdzID0gW107XG4gICAgICBmb3IgKGNvbnN0IGxpc3Qgb2YgW2NhbmRpZGF0ZXMsIHdpZGVdKVxuICAgICAgICBmb3IgKGNvbnN0IGUgb2YgbGlzdCkge1xuICAgICAgICAgIGlmIChlLnkgPiBzY2FuWSAhPSBlLnkgKyBlLmR5ID4gc2NhblkpIGNyb3NzaW5ncy5wdXNoKGUueCArICgoc2NhblkgLSBlLnkpICogZS5keCkgLyBlLmR5KTtcbiAgICAgICAgfVxuICAgICAgY3Jvc3NpbmdzLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgICAgIGNhY2hlLnNldChyb3csIGNyb3NzaW5ncyk7XG4gICAgfVxuICAgIGxldCBsbyA9IDAsXG4gICAgICBoaSA9IGNyb3NzaW5ncy5sZW5ndGg7XG4gICAgd2hpbGUgKGxvIDwgaGkpIHtcbiAgICAgIGNvbnN0IG1pZCA9IChsbyArIGhpKSA+Pj4gMTtcbiAgICAgIGlmIChjcm9zc2luZ3NbbWlkXSA8PSB4KSBsbyA9IG1pZCArIDE7XG4gICAgICBlbHNlIGhpID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG8gJSAyID09PSAxO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9seWdvbkJvbmRDcm9zc2luZyhtZW1icmFuZTogRmxvYXQzMkFycmF5LCBzdHJpZGUgPSAxMCkge1xuICBjb25zdCB7IGVkZ2VzLCByb3dzLCB3aWRlIH0gPSBlZGdlSW5kZXgobWVtYnJhbmUsIHN0cmlkZSk7XG4gIHJldHVybiAoYXg6IG51bWJlciwgYXk6IG51bWJlciwgYng6IG51bWJlciwgYnk6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IGR4ID0gYnggLSBheCxcbiAgICAgIGR5ID0gYnkgLSBheSxcbiAgICAgIG1pblggPSBNYXRoLm1pbihheCwgYngpLFxuICAgICAgbWF4WCA9IE1hdGgubWF4KGF4LCBieCksXG4gICAgICBtaW5ZID0gTWF0aC5taW4oYXksIGJ5KSxcbiAgICAgIG1heFkgPSBNYXRoLm1heChheSwgYnkpO1xuICAgIGNvbnN0IGNyb3NzZXMgPSAobGlzdDogRWRnZVtdKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGUgb2YgbGlzdCkge1xuICAgICAgICBpZiAobWF4WCA8IGUubHggfHwgbWluWCA+IGUuaHggfHwgbWF4WSA8IGUubHkgfHwgbWluWSA+IGUuaHkpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBkZW5vbWluYXRvciA9IGR4ICogZS5keSAtIGR5ICogZS5keDtcbiAgICAgICAgaWYgKE1hdGguYWJzKGRlbm9taW5hdG9yKSA8IDFlLTgpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCB0ID0gKChlLnggLSBheCkgKiBlLmR5IC0gKGUueSAtIGF5KSAqIGUuZHgpIC8gZGVub21pbmF0b3I7XG4gICAgICAgIGNvbnN0IHUgPSAoKGUueCAtIGF4KSAqIGR5IC0gKGUueSAtIGF5KSAqIGR4KSAvIGRlbm9taW5hdG9yO1xuICAgICAgICBpZiAodCA+IDFlLTUgJiYgdCA8IDEgLSAxZS01ICYmIHUgPj0gMCAmJiB1IDw9IDEpIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgY29uc3QgbG93ID0gTWF0aC5mbG9vcihtaW5ZIC8gQkFORCksXG4gICAgICBoaWdoID0gTWF0aC5mbG9vcihtYXhZIC8gQkFORCk7XG4gICAgaWYgKGhpZ2ggLSBsb3cgPiAyKSByZXR1cm4gY3Jvc3NlcyhlZGdlcyk7XG4gICAgaWYgKGNyb3NzZXMod2lkZSkpIHJldHVybiB0cnVlO1xuICAgIGZvciAobGV0IHJvdyA9IGxvdzsgcm93IDw9IGhpZ2g7IHJvdysrKSBpZiAoY3Jvc3Nlcyhyb3dzLmdldChyb3cpID8/IFtdKSkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xufVxuIiwiLy8gUHVyZSBmdWxsLXNuYXBzaG90IGRpYWdub3N0aWNzLiBSdW5zIGluIHRoZSBib3VuZGVkIHdvcmtlciwgd2l0aCBubyBET00gb3Jcbi8vIEdQVSBhY2Nlc3MuIEdlb21ldHJ5IGNoZWNrcywgdG9wb2xvZ3kgd2Fsa3MgYW5kIGNvdW50ZXIgc2VtYW50aWNzIGFyZSBzaGFyZWRcbi8vIGJ5IGxpdmUgZGlhZ25vc3RpY3MgYW5kIGV2ZXJ5IGZvcmNlZCBzY2llbnRpZmljLWFzc2F5IGNoZWNrcG9pbnQuXG5pbXBvcnQgeyBwb2x5Z29uT2NjdXBhbmN5LCBwb2x5Z29uQm9uZENyb3NzaW5nIH0gZnJvbSBcIi4vb2NjdXBhbmN5XCI7XG5cbmNvbnN0IFNFR01FTlRfV09SRFMgPSAxMDsgLy8gaWQsIHN1YnR5cGUsIHBvc2l0aW9uKDIpLCBvcmllbnRhdGlvbigyKSwgdGFpbCwgaGVhZCwgYXJjX2xlbmd0aCwgYWdlXG5jb25zdCBUQUlMID0gNjtcbmNvbnN0IEhFQUQgPSA3O1xuXG4vLyBtdXN0IG1hdGNoIHRoZSBURUxFTUVUUllfKiBpbmRpY2VzIGluIHNpbXVsYXRlLndnc2xcbmV4cG9ydCBjb25zdCBURUxFTUVUUllfQ09VTlRFUlMgPSBbXG4gIFwiY2FuZGlkYXRlc1wiLCAvLyBmcmVlIG1vbm9tZXJzIGluIHRoZSBwb2x5bWVyaXphdGlvbiBmaWVsZFxuICBcIm5laWdoYm9yRm91bmRcIiwgLy8gLi4uIHRoYXQgc2F3IGFuIGF2YWlsYWJsZSBoZWFkIG9yIG1vbm9tZXIgbmVhcmJ5XG4gIFwicGFzc2VkUHJvYlwiLCAvLyAuLi4gYW5kIHBhc3NlZCB0aGUgYmluZCBwcm9iYWJpbGl0eVxuICBcImJvdW5kXCIsIC8vIC4uLiBhbmQgd29uIGJvdGggbG9ja3NcbiAgXCJ1bmJvdW5kXCIsIC8vIG1pbnVzLWVuZCBkZXBvbHltZXJpemF0aW9uc1xuICBcImVsb25nYXRlZFwiLCAvLyBiaW5kcyBvbnRvIGFuIGV4aXN0aW5nIGZpbGFtZW50J3MgcGx1cyBlbmQgKGJvdW5kIG1pbnVzIGVsb25nYXRlZCA9IG5ldyBkaW1lcnMpXG4gIFwiaGVhZHNJbkZpZWxkXCIsIC8vIHBsdXMgZW5kcyBpbiB0aGUgcG9seW1lcml6YXRpb24gZmllbGQsIGkuZS4gYWJsZSB0byBlbG9uZ2F0ZVxuICBcImhlYWRGb3VuZFwiLCAvLyBjYW5kaWRhdGVzIHRoYXQgc2F3IHN1Y2ggYSBwbHVzIGVuZCBuZWFyYnlcbiAgXCJicmFuY2hlZFwiLCAvLyBuZXcgYnJhbmNoZXMgbnVjbGVhdGVkIG9uIHRoZSBzaWRlIG9mIGEgZmlsYW1lbnQgKGxhbWVsbGlwb2RpdW0gZmllbGQpXG4gIFwiZGVicmFuY2hlZFwiLCAvLyBicmFuY2hlcyB0aGF0IGNhbWUgb2ZmIHRoZWlyIG1vdGhlclxuICBcInBvaW50Q29udGFjdHNcIixcbiAgXCJib25kQ29udGFjdHNcIixcbiAgXCJyZWFyTWludXNMb3NzXCIsXG4gIFwiZnJvbnRNaW51c0xvc3NcIixcbiAgXCJyZWFyUGx1c0xvc3NcIixcbiAgXCJ0ZXRoZXJSZWxlYXNlZFwiLFxuXSBhcyBjb25zdDtcblxudHlwZSBDb3VudGVycyA9IFJlY29yZDwodHlwZW9mIFRFTEVNRVRSWV9DT1VOVEVSUylbbnVtYmVyXSwgbnVtYmVyPjtcblxuZXhwb3J0IHR5cGUgQWN0aW5TdGF0cyA9IHtcbiAgcnVuOiBzdHJpbmc7XG4gIGZyYW1lOiBudW1iZXI7XG4gIHN0ZXA6IG51bWJlcjtcbiAgYWN0aW5Db3VudDogbnVtYmVyO1xuICBtb25vbWVyczogbnVtYmVyO1xuICBmaWxhbWVudHM6IG51bWJlcjtcbiAgYnJhbmNoZXM6IG51bWJlcjsgLy8gZmlsYW1lbnRzIGhhbmdpbmcgb2ZmIHRoZSBzaWRlIG9mIGFub3RoZXIgb25lXG4gIGluUG9seW1lcjogbnVtYmVyO1xuICBwb3N0ZXJpb3JQb2x5bWVyQmVhZHM6IG51bWJlcjsgLy8gbGVnYWN5IG1hcmtlci14IGhhbGYsIG5vdCB0aGUgY3VycmVudCBnZW9tZXRyaWMgcG9sYXJpdHkgZnJhbWVcbiAgaW5zaWRlUG9seW1lckJlYWRzOiBudW1iZXI7XG4gIGluc2lkZU1vbm9tZXJCZWFkczogbnVtYmVyO1xuICBnQWN0aW5Nb2RlOiBcIndlbGwtbWl4ZWRcIiB8IFwicGFydGljbGVzXCI7XG4gIGdBY3RpbkFtb3VudDogbnVtYmVyO1xuICBnQWN0aW5Db25jZW50cmF0aW9uOiBudW1iZXI7XG4gIGFjdGluQmFsYW5jZUVycm9yOiBudW1iZXI7XG4gIGNyb3NzaW5nRmlsYW1lbnRCb25kczogbnVtYmVyO1xuICBtZWFuUG9seW1lckFnZTogbnVtYmVyO1xuICBtYXhQb2x5bWVyQWdlOiBudW1iZXI7XG4gIG1lYW5MZW5ndGg6IG51bWJlcjtcbiAgbWVkaWFuTGVuZ3RoOiBudW1iZXI7XG4gIHA5MExlbmd0aDogbnVtYmVyO1xuICBtYXhMZW5ndGg6IG51bWJlcjtcbiAgLy8gZmlsYW1lbnQgY291bnRzIHBlciBsZW5ndGggYmluOiAyLCAzLTQsIDUtOCwgOS0xNiwgMTctMzIsIDMzLTY0LCA2NStcbiAgaGlzdG9ncmFtOiBudW1iZXJbXTtcbiAgbWVkaWFuQm9uZExlbmd0aDogbnVtYmVyOyAvLyBpbiB1bml0cyBvZiB0aGUgYWN0aW4gcmVzdCBsZW5ndGhcbiAgbWVkaWFuQmVuZEFuZ2xlOiBudW1iZXI7IC8vIGRlZ3JlZXMgYmV0d2VlbiBjb25zZWN1dGl2ZSBib25kcyBvZiBhIGZpbGFtZW50OyBsb3cgPSBzdGlmZlxuICBicm9rZW5MaW5rczogbnVtYmVyOyAvLyBhLmhlYWQgPSBiIGJ1dCBiLnRhaWwgIT0gYVxuICBjeWNsZXM6IG51bWJlcjtcbiAgcGVyU3RlcDogQ291bnRlcnM7IC8vIGV2ZW50IHJhdGVzIHNpbmNlIHRoZSBwcmV2aW91cyBzYW1wbGVcbiAgY2VsbDogQ2VsbFNoYXBlO1xuICBkaWFnbm9zdGljS2luZD86IFwic2ltdWxhdGlvblwiIHwgXCJjb250YWN0LXJlY2hlY2tcIjtcbn07XG5cbi8vIG1lbWJyYW5lIHNoYXBlIGluIHBpeGVsczsgbm9kZSAwIGlzIHRoZSBmcm9udCAodGhlIHJpZ2h0IHNpZGUgYXQgcmVzZXQpLCBub2RlIGNvdW50IC8gMiB0aGUgcmVhclxuZXhwb3J0IHR5cGUgQ2VsbFNoYXBlID0ge1xuICBsZWZ0OiBudW1iZXI7IC8vIGxlZnRtb3N0IG1lbWJyYW5lIHhcbiAgcmlnaHQ6IG51bWJlcjsgLy8gcmlnaHRtb3N0IG1lbWJyYW5lIHhcbiAgdG9wOiBudW1iZXI7XG4gIGJvdHRvbTogbnVtYmVyO1xuICBmcm9udFg6IG51bWJlcjtcbiAgcmVhclg6IG51bWJlcjtcbiAgY2VudHJvaWRYOiBudW1iZXI7XG4gIGNlbnRyb2lkWTogbnVtYmVyO1xuICBsZW5ndGg6IG51bWJlcjsgLy8gZnJvbnQgbm9kZSB0byByZWFyIG5vZGVcbiAgYXJlYTogbnVtYmVyOyAvLyByZWxhdGl2ZSB0byB0aGUgYXJlYSBhdCByZXNldFxuICAvLyBtZWFuIG1lbWJyYW5lIGVkZ2UgbGVuZ3RoIGluIHVuaXRzIG9mIHRoZSByZXN0IGxlbmd0aCwgb3ZlciB0aGUgcXVhcnRlciBvZiB0aGUgbm9kZXMgYXJvdW5kIHRoZSBmcm9udCBhbmQgdGhlIHJlYXJcbiAgZnJvbnRTcGFjaW5nOiBudW1iZXI7XG4gIHJlYXJTcGFjaW5nOiBudW1iZXI7XG59O1xuXG5jb25zdCBISVNUT0dSQU1fRURHRVMgPSBbMiwgNCwgOCwgMTYsIDMyLCA2NF07XG5cbmV4cG9ydCBjbGFzcyBUZWxlbWV0cnlBbmFseXNpcyB7XG4gIHByaXZhdGUgbGFzdENvdW50ZXJzOiBudW1iZXJbXSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGxhc3RTdGVwID0gMDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGFjdGluQ291bnQ6IG51bWJlcixcbiAgICBwcml2YXRlIG1lbWJyYW5lQ291bnQ6IG51bWJlcixcbiAgICBwcml2YXRlIG1lbWJyYW5lUmVzdExlbmd0aDogbnVtYmVyLFxuICAgIHByaXZhdGUgcnVuOiBzdHJpbmcsXG4gICAgcHJpdmF0ZSB3ZWxsTWl4ZWQgPSBmYWxzZVxuICApIHt9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5sYXN0Q291bnRlcnMgPSBudWxsO1xuICAgIHRoaXMubGFzdFN0ZXAgPSAwO1xuICB9XG5cbiAgYW5hbHl6ZShcbiAgICBhY3RpbjogQXJyYXlCdWZmZXIsXG4gICAgbWVtYnJhbmVEYXRhOiBBcnJheUJ1ZmZlcixcbiAgICBjb3VudGVyRGF0YTogQXJyYXlCdWZmZXIsXG4gICAgZnJhbWU6IG51bWJlcixcbiAgICBzdGVwOiBudW1iZXIsXG4gICAgZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2U6IG51bWJlcixcbiAgICB2ZXJpZmljYXRpb24gPSBmYWxzZVxuICApIHtcbiAgICBjb25zdCBwcmV2aW91c0NvdW50ZXJzID0gdGhpcy5sYXN0Q291bnRlcnMsXG4gICAgICBwcmV2aW91c1N0ZXAgPSB0aGlzLmxhc3RTdGVwO1xuICAgIGNvbnN0IHdvcmRzID0gbmV3IFVpbnQzMkFycmF5KGFjdGluKTtcbiAgICBjb25zdCBmbG9hdHMgPSBuZXcgRmxvYXQzMkFycmF5KHdvcmRzLmJ1ZmZlcik7XG4gICAgY29uc3QgY291bnRlcnMgPSBBcnJheS5mcm9tKG5ldyBVaW50MzJBcnJheShjb3VudGVyRGF0YSkpO1xuICAgIGNvbnN0IG1lbWJyYW5lID0gbmV3IEZsb2F0MzJBcnJheShtZW1icmFuZURhdGEpO1xuICAgIGNvbnN0IGNlbGwgPSB0aGlzLmNlbGxTaGFwZShtZW1icmFuZSk7XG4gICAgY29uc3Qgc3RhdHMgPSB0aGlzLmNvbXB1dGUod29yZHMsIGZsb2F0cywgY291bnRlcnMsIGZyYW1lLCBzdGVwLCBlcXVpbGlicml1bUxpbmVEaXN0YW5jZSwgY2VsbCk7XG4gICAgY29uc3QgaW5zaWRlID0gcG9seWdvbk9jY3VwYW5jeShtZW1icmFuZSwgU0VHTUVOVF9XT1JEUywgdGhpcy53ZWxsTWl4ZWQpO1xuICAgIGNvbnN0IGNyb3NzaW5nID0gdGhpcy53ZWxsTWl4ZWQgPyBwb2x5Z29uQm9uZENyb3NzaW5nKG1lbWJyYW5lKSA6IG51bGw7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmFjdGluQ291bnQ7IGkrKykge1xuICAgICAgY29uc3QgZGlzY29ubmVjdGVkID0gd29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBUQUlMXSA9PT0gaSAmJiB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIEhFQURdID09PSBpO1xuICAgICAgaWYgKHRoaXMud2VsbE1peGVkICYmIGRpc2Nvbm5lY3RlZCkgY29udGludWU7IC8vIHJlc2Vydm9pciBlbnRyaWVzIGhhdmUgbm8gc3BhdGlhbCBjb29yZGluYXRlc1xuICAgICAgY29uc3QgdGFpbCA9IHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF07XG4gICAgICBpZiAoXG4gICAgICAgIGNyb3NzaW5nICYmXG4gICAgICAgIHRhaWwgIT09IGkgJiZcbiAgICAgICAgY3Jvc3NpbmcoZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgMl0sIGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDNdLCBmbG9hdHNbdGFpbCAqIFNFR01FTlRfV09SRFMgKyAyXSwgZmxvYXRzW3RhaWwgKiBTRUdNRU5UX1dPUkRTICsgM10pXG4gICAgICApXG4gICAgICAgIHN0YXRzLmNyb3NzaW5nRmlsYW1lbnRCb25kcysrO1xuICAgICAgaWYgKCFpbnNpZGUoZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgMl0sIGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDNdKSkgY29udGludWU7XG4gICAgICBpZiAod29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBUQUlMXSA9PT0gaSAmJiB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIEhFQURdID09PSBpKSBzdGF0cy5pbnNpZGVNb25vbWVyQmVhZHMrKztcbiAgICAgIGVsc2Ugc3RhdHMuaW5zaWRlUG9seW1lckJlYWRzKys7XG4gICAgfVxuICAgIHN0YXRzLmdBY3RpbkNvbmNlbnRyYXRpb24gPSB0aGlzLndlbGxNaXhlZCA/IHN0YXRzLmdBY3RpbkFtb3VudCAvICgoY2VsbC5hcmVhICogKHRoaXMubWVtYnJhbmVDb3VudCAqIHRoaXMubWVtYnJhbmVSZXN0TGVuZ3RoKSAqKiAyKSAvICg0ICogTWF0aC5QSSkpIDogMDtcbiAgICBzdGF0cy5kaWFnbm9zdGljS2luZCA9IHZlcmlmaWNhdGlvbiA/IFwiY29udGFjdC1yZWNoZWNrXCIgOiBcInNpbXVsYXRpb25cIjtcbiAgICBpZiAodmVyaWZpY2F0aW9uKSB7XG4gICAgICB0aGlzLmxhc3RDb3VudGVycyA9IHByZXZpb3VzQ291bnRlcnM7XG4gICAgICB0aGlzLmxhc3RTdGVwID0gcHJldmlvdXNTdGVwO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdHM7XG4gIH1cblxuICBwcml2YXRlIGNlbGxTaGFwZShmbG9hdHM6IEZsb2F0MzJBcnJheSk6IENlbGxTaGFwZSB7XG4gICAgY29uc3QgbiA9IHRoaXMubWVtYnJhbmVDb3VudDtcbiAgICBjb25zdCB4ID0gKGk6IG51bWJlcikgPT4gZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgMl07XG4gICAgY29uc3QgeSA9IChpOiBudW1iZXIpID0+IGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDNdO1xuICAgIGxldCBsZWZ0ID0gSW5maW5pdHk7XG4gICAgbGV0IHJpZ2h0ID0gLUluZmluaXR5O1xuICAgIGxldCB0b3AgPSBJbmZpbml0eTtcbiAgICBsZXQgYm90dG9tID0gLUluZmluaXR5O1xuICAgIC8vIGFyZWEtd2VpZ2h0ZWQgY2VudHJvaWQgKHNob2VsYWNlKVxuICAgIGxldCBhcmVhID0gMDtcbiAgICBsZXQgY3ggPSAwO1xuICAgIGxldCBjeSA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIGxlZnQgPSBNYXRoLm1pbihsZWZ0LCB4KGkpKTtcbiAgICAgIHJpZ2h0ID0gTWF0aC5tYXgocmlnaHQsIHgoaSkpO1xuICAgICAgdG9wID0gTWF0aC5taW4odG9wLCB5KGkpKTtcbiAgICAgIGJvdHRvbSA9IE1hdGgubWF4KGJvdHRvbSwgeShpKSk7XG4gICAgICBjb25zdCBqID0gKGkgKyAxKSAlIG47XG4gICAgICBjb25zdCBjcm9zcyA9IHgoaSkgKiB5KGopIC0geChqKSAqIHkoaSk7XG4gICAgICBhcmVhICs9IGNyb3NzIC8gMjtcbiAgICAgIGN4ICs9ICh4KGkpICsgeChqKSkgKiBjcm9zcztcbiAgICAgIGN5ICs9ICh5KGkpICsgeShqKSkgKiBjcm9zcztcbiAgICB9XG4gICAgY29uc3QgcmVhciA9IG4gPj4gMTtcbiAgICBjb25zdCBxdWFydGVyU3BhY2luZyA9IChjZW50ZXI6IG51bWJlcikgPT4ge1xuICAgICAgbGV0IHN1bSA9IDA7XG4gICAgICBmb3IgKGxldCBrID0gLShuID4+IDMpOyBrIDwgbiA+PiAzOyBrKyspIHtcbiAgICAgICAgY29uc3QgaSA9IChjZW50ZXIgKyBrICsgbikgJSBuO1xuICAgICAgICBjb25zdCBqID0gKGkgKyAxKSAlIG47XG4gICAgICAgIHN1bSArPSBNYXRoLmh5cG90KHgoaikgLSB4KGkpLCB5KGopIC0geShpKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VtIC8gKG4gPj4gMikgLyB0aGlzLm1lbWJyYW5lUmVzdExlbmd0aDtcbiAgICB9O1xuICAgIGNvbnN0IHJlc3RBcmVhID0gKG4gKiB0aGlzLm1lbWJyYW5lUmVzdExlbmd0aCkgKiogMiAvICg0ICogTWF0aC5QSSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxlZnQsXG4gICAgICByaWdodCxcbiAgICAgIHRvcCxcbiAgICAgIGJvdHRvbSxcbiAgICAgIGZyb250WDogeCgwKSxcbiAgICAgIHJlYXJYOiB4KHJlYXIpLFxuICAgICAgY2VudHJvaWRYOiBjeCAvICg2ICogYXJlYSksXG4gICAgICBjZW50cm9pZFk6IGN5IC8gKDYgKiBhcmVhKSxcbiAgICAgIGxlbmd0aDogTWF0aC5oeXBvdCh4KDApIC0geChyZWFyKSwgeSgwKSAtIHkocmVhcikpLFxuICAgICAgYXJlYTogTWF0aC5hYnMoYXJlYSkgLyByZXN0QXJlYSxcbiAgICAgIGZyb250U3BhY2luZzogcXVhcnRlclNwYWNpbmcoMCksXG4gICAgICByZWFyU3BhY2luZzogcXVhcnRlclNwYWNpbmcocmVhciksXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcHV0ZSh3b3JkczogVWludDMyQXJyYXksIGZsb2F0czogRmxvYXQzMkFycmF5LCBjb3VudGVyczogbnVtYmVyW10sIGZyYW1lOiBudW1iZXIsIHN0ZXA6IG51bWJlciwgcmVzdExlbmd0aDogbnVtYmVyLCBjZWxsOiBDZWxsU2hhcGUpOiBBY3RpblN0YXRzIHtcbiAgICBjb25zdCBuID0gdGhpcy5hY3RpbkNvdW50O1xuICAgIGNvbnN0IHZpc2l0ZWQgPSBuZXcgVWludDhBcnJheShuKTtcbiAgICBjb25zdCBsZW5ndGhzOiBudW1iZXJbXSA9IFtdO1xuICAgIGxldCBtb25vbWVycyA9IDA7XG4gICAgbGV0IGJyb2tlbkxpbmtzID0gMDtcbiAgICBsZXQgY3ljbGVzID0gMDtcbiAgICBsZXQgYnJhbmNoZXMgPSAwO1xuICAgIGxldCBwb3N0ZXJpb3JQb2x5bWVyQmVhZHMgPSAwO1xuICAgIGxldCBhZ2VTdW0gPSAwLFxuICAgICAgbWF4QWdlID0gMDtcbiAgICBjb25zdCBib25kTGVuZ3RoczogbnVtYmVyW10gPSBbXTtcbiAgICBjb25zdCBiZW5kQW5nbGVzOiBudW1iZXJbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIGNvbnN0IHRhaWwgPSB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIFRBSUxdO1xuICAgICAgY29uc3QgaGVhZCA9IHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgSEVBRF07XG4gICAgICBpZiAodGFpbCA9PT0gaSAmJiBoZWFkID09PSBpKSB7XG4gICAgICAgIG1vbm9tZXJzKys7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgYWdlID0gZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgOV07XG4gICAgICBhZ2VTdW0gKz0gYWdlO1xuICAgICAgbWF4QWdlID0gTWF0aC5tYXgobWF4QWdlLCBhZ2UpO1xuICAgICAgaWYgKGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDJdIDwgKGNlbGwuZnJvbnRYICsgY2VsbC5yZWFyWCkgLyAyKSBwb3N0ZXJpb3JQb2x5bWVyQmVhZHMrKztcbiAgICAgIGlmIChoZWFkICE9PSBpICYmIHdvcmRzW2hlYWQgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF0gIT09IGkpIHtcbiAgICAgICAgYnJva2VuTGlua3MrKztcbiAgICAgIH1cbiAgICAgIC8vIGEgYnJhbmNoIHJvb3QncyB0YWlsIGlzIGl0cyBtb3RoZXIsIHdob3NlIGhlYWQgcG9pbnRzIGVsc2V3aGVyZSBhbG9uZyB0aGUgbW90aGVyIGZpbGFtZW50XG4gICAgICBjb25zdCBpc0JyYW5jaFJvb3QgPSB0YWlsICE9PSBpICYmIHdvcmRzW3RhaWwgKiBTRUdNRU5UX1dPUkRTICsgSEVBRF0gIT09IGk7XG4gICAgICBpZiAodGFpbCAhPT0gaSAmJiAhaXNCcmFuY2hSb290KSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgYnJhbmNoZXMgKz0gaXNCcmFuY2hSb290ID8gMSA6IDA7XG4gICAgICAvLyBhIG1pbnVzIGVuZCBvciBicmFuY2ggcm9vdDogd2FsayB0byB0aGUgcGx1cyBlbmRcbiAgICAgIGxldCBsZW5ndGggPSAxO1xuICAgICAgbGV0IGN1cnJlbnQgPSBpO1xuICAgICAgbGV0IHByZXZEeCA9IDA7XG4gICAgICBsZXQgcHJldkR5ID0gMDtcbiAgICAgIHZpc2l0ZWRbaV0gPSAxO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHdvcmRzW2N1cnJlbnQgKiBTRUdNRU5UX1dPUkRTICsgSEVBRF07XG4gICAgICAgIGlmIChuZXh0ID09PSBjdXJyZW50KSBicmVhaztcbiAgICAgICAgaWYgKHZpc2l0ZWRbbmV4dF0pIHtcbiAgICAgICAgICBjeWNsZXMrKztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkeCA9IGZsb2F0c1tuZXh0ICogU0VHTUVOVF9XT1JEUyArIDJdIC0gZmxvYXRzW2N1cnJlbnQgKiBTRUdNRU5UX1dPUkRTICsgMl07XG4gICAgICAgIGNvbnN0IGR5ID0gZmxvYXRzW25leHQgKiBTRUdNRU5UX1dPUkRTICsgM10gLSBmbG9hdHNbY3VycmVudCAqIFNFR01FTlRfV09SRFMgKyAzXTtcbiAgICAgICAgYm9uZExlbmd0aHMucHVzaChNYXRoLmh5cG90KGR4LCBkeSkpO1xuICAgICAgICBpZiAobGVuZ3RoID4gMSkge1xuICAgICAgICAgIGJlbmRBbmdsZXMucHVzaCgoTWF0aC5hYnMoTWF0aC5hdGFuMihwcmV2RHggKiBkeSAtIHByZXZEeSAqIGR4LCBwcmV2RHggKiBkeCArIHByZXZEeSAqIGR5KSkgKiAxODApIC8gTWF0aC5QSSk7XG4gICAgICAgIH1cbiAgICAgICAgcHJldkR4ID0gZHg7XG4gICAgICAgIHByZXZEeSA9IGR5O1xuICAgICAgICB2aXNpdGVkW25leHRdID0gMTtcbiAgICAgICAgY3VycmVudCA9IG5leHQ7XG4gICAgICAgIGxlbmd0aCsrO1xuICAgICAgfVxuICAgICAgbGVuZ3Rocy5wdXNoKGxlbmd0aCk7XG4gICAgfVxuXG4gICAgbGVuZ3Rocy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgY29uc3QgaW5Qb2x5bWVyID0gbGVuZ3Rocy5yZWR1Y2UoKHN1bSwgbCkgPT4gc3VtICsgbCwgMCk7XG4gICAgY29uc3QgaGlzdG9ncmFtID0gbmV3IEFycmF5KEhJU1RPR1JBTV9FREdFUy5sZW5ndGggKyAxKS5maWxsKDApO1xuICAgIGZvciAoY29uc3QgbCBvZiBsZW5ndGhzKSB7XG4gICAgICBjb25zdCBiaW4gPSBISVNUT0dSQU1fRURHRVMuZmluZEluZGV4KChlZGdlKSA9PiBsIDw9IGVkZ2UpO1xuICAgICAgaGlzdG9ncmFtW2JpbiA9PT0gLTEgPyBISVNUT0dSQU1fRURHRVMubGVuZ3RoIDogYmluXSsrO1xuICAgIH1cblxuICAgIGNvbnN0IHN0ZXBzID0gTWF0aC5tYXgoMSwgc3RlcCAtIHRoaXMubGFzdFN0ZXApO1xuICAgIGNvbnN0IHBlclN0ZXAgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICBURUxFTUVUUllfQ09VTlRFUlMubWFwKChuYW1lLCBrKSA9PiBbbmFtZSwgdGhpcy5sYXN0Q291bnRlcnMgPyAoY291bnRlcnNba10gLSB0aGlzLmxhc3RDb3VudGVyc1trXSkgLyBzdGVwcyA6IDBdKVxuICAgICkgYXMgQ291bnRlcnM7XG4gICAgdGhpcy5sYXN0Q291bnRlcnMgPSBjb3VudGVycztcbiAgICB0aGlzLmxhc3RTdGVwID0gc3RlcDtcblxuICAgIGNvbnN0IHF1YW50aWxlID0gKHE6IG51bWJlcikgPT4gKGxlbmd0aHMubGVuZ3RoID8gbGVuZ3Roc1tNYXRoLm1pbihsZW5ndGhzLmxlbmd0aCAtIDEsIE1hdGguZmxvb3IocSAqIGxlbmd0aHMubGVuZ3RoKSldIDogMCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJ1bjogdGhpcy5ydW4sXG4gICAgICBmcmFtZSxcbiAgICAgIHN0ZXAsXG4gICAgICBhY3RpbkNvdW50OiBuLFxuICAgICAgbW9ub21lcnMsXG4gICAgICBmaWxhbWVudHM6IGxlbmd0aHMubGVuZ3RoLFxuICAgICAgYnJhbmNoZXMsXG4gICAgICBpblBvbHltZXIsXG4gICAgICBwb3N0ZXJpb3JQb2x5bWVyQmVhZHMsXG4gICAgICBpbnNpZGVQb2x5bWVyQmVhZHM6IDAsXG4gICAgICBpbnNpZGVNb25vbWVyQmVhZHM6IDAsXG4gICAgICBnQWN0aW5Nb2RlOiB0aGlzLndlbGxNaXhlZCA/IFwid2VsbC1taXhlZFwiIDogXCJwYXJ0aWNsZXNcIixcbiAgICAgIGdBY3RpbkFtb3VudDogbW9ub21lcnMsXG4gICAgICBnQWN0aW5Db25jZW50cmF0aW9uOiAwLFxuICAgICAgYWN0aW5CYWxhbmNlRXJyb3I6IG1vbm9tZXJzICsgaW5Qb2x5bWVyIC0gbixcbiAgICAgIGNyb3NzaW5nRmlsYW1lbnRCb25kczogMCxcbiAgICAgIG1lYW5Qb2x5bWVyQWdlOiBuID4gbW9ub21lcnMgPyBhZ2VTdW0gLyAobiAtIG1vbm9tZXJzKSA6IDAsXG4gICAgICBtYXhQb2x5bWVyQWdlOiBtYXhBZ2UsXG4gICAgICBtZWFuTGVuZ3RoOiBsZW5ndGhzLmxlbmd0aCA/IGluUG9seW1lciAvIGxlbmd0aHMubGVuZ3RoIDogMCxcbiAgICAgIG1lZGlhbkxlbmd0aDogcXVhbnRpbGUoMC41KSxcbiAgICAgIHA5MExlbmd0aDogcXVhbnRpbGUoMC45KSxcbiAgICAgIG1heExlbmd0aDogbGVuZ3Rocy5sZW5ndGggPyBsZW5ndGhzW2xlbmd0aHMubGVuZ3RoIC0gMV0gOiAwLFxuICAgICAgaGlzdG9ncmFtLFxuICAgICAgbWVkaWFuQm9uZExlbmd0aDogYm9uZExlbmd0aHMubGVuZ3RoID8gYm9uZExlbmd0aHMuc29ydCgoYSwgYikgPT4gYSAtIGIpW2JvbmRMZW5ndGhzLmxlbmd0aCA+PiAxXSAvIHJlc3RMZW5ndGggOiAwLFxuICAgICAgbWVkaWFuQmVuZEFuZ2xlOiBiZW5kQW5nbGVzLmxlbmd0aCA/IGJlbmRBbmdsZXMuc29ydCgoYSwgYikgPT4gYSAtIGIpW2JlbmRBbmdsZXMubGVuZ3RoID4+IDFdIDogMCxcbiAgICAgIGJyb2tlbkxpbmtzLFxuICAgICAgY3ljbGVzLFxuICAgICAgcGVyU3RlcCxcbiAgICAgIGNlbGwsXG4gICAgfTtcbiAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBUZWxlbWV0cnlBbmFseXNpcyB9IGZyb20gXCIuL3RlbGVtZXRyeS1hbmFseXNpc1wiO1xudHlwZSBDb25maWcgPSBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgc3RyaW5nLCBib29sZWFuXTtcbnR5cGUgSm9iID1cbiAgfCB7IHR5cGU6IFwiaW5pdFwiOyBjb25maWc6IENvbmZpZyB9XG4gIHwgeyB0eXBlOiBcInJlc2V0XCIgfVxuICB8IHtcbiAgICAgIHR5cGU6IFwiYW5hbHl6ZVwiO1xuICAgICAgaWQ6IG51bWJlcjtcbiAgICAgIGFjdGluOiBBcnJheUJ1ZmZlcjtcbiAgICAgIG1lbWJyYW5lOiBBcnJheUJ1ZmZlcjtcbiAgICAgIGNvdW50ZXJzOiBBcnJheUJ1ZmZlcjtcbiAgICAgIGZyYW1lOiBudW1iZXI7XG4gICAgICBzdGVwOiBudW1iZXI7XG4gICAgICByZXN0OiBudW1iZXI7XG4gICAgICB2ZXJpZmljYXRpb24/OiBib29sZWFuO1xuICAgIH07XG5jb25zdCBzY29wZSA9IHNlbGYgYXMgdW5rbm93biBhcyB7IG9ubWVzc2FnZTogKGV2ZW50OiBNZXNzYWdlRXZlbnQ8Sm9iPikgPT4gdm9pZDsgcG9zdE1lc3NhZ2U6IChtZXNzYWdlOiB1bmtub3duKSA9PiB2b2lkIH07XG5sZXQgYW5hbHlzaXM6IFRlbGVtZXRyeUFuYWx5c2lzO1xuc2NvcGUub25tZXNzYWdlID0gKHsgZGF0YSB9KSA9PiB7XG4gIGlmIChkYXRhLnR5cGUgPT09IFwiaW5pdFwiKSB7XG4gICAgYW5hbHlzaXMgPSBuZXcgVGVsZW1ldHJ5QW5hbHlzaXMoLi4uZGF0YS5jb25maWcpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoZGF0YS50eXBlID09PSBcInJlc2V0XCIpIHtcbiAgICBhbmFseXNpcy5yZXNldCgpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICB0cnkge1xuICAgIGNvbnN0IHN0YXRzID0gYW5hbHlzaXMuYW5hbHl6ZShkYXRhLmFjdGluLCBkYXRhLm1lbWJyYW5lLCBkYXRhLmNvdW50ZXJzLCBkYXRhLmZyYW1lLCBkYXRhLnN0ZXAsIGRhdGEucmVzdCwgZGF0YS52ZXJpZmljYXRpb24pO1xuICAgIHNjb3BlLnBvc3RNZXNzYWdlKHsgaWQ6IGRhdGEuaWQsIHN0YXRzLCBhbmFseXNpc01zOiBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0IH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHNjb3BlLnBvc3RNZXNzYWdlKHsgaWQ6IGRhdGEuaWQsIGVycm9yOiBTdHJpbmcoZXJyb3IpIH0pO1xuICB9XG59O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9