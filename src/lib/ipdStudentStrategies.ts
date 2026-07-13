// Shared live-session strategy submissions for the iterated prisoner's dilemma.
// Add student strategies here once; both the histogram tournament and the
// spatial population simulation import this list.
export const STUDENT_STRATEGIES: any[] = [
  {
    key: "copycat", name: "Copy-Cat", color: "#a855f7", category: "good", source: "student", stochastic: false,
    decide: (h: any[]) => h.length === 0 ? "C" : h[h.length - 1].theirs,
  },
  {
    key: "slycat", name: "Sly-Cat", color: "#f43f5e", category: "bad", source: "student", stochastic: false,
    decide: (h: any[]) => {
      if (h.length < 4) return "C";
      if (h[h.length - 1].mine === "D") return "C";
      const recent = h.slice(-3);
      return recent.every((r: any) => r.theirs === "C") ? "D" : "C";
    },
  },
  {
    key: "fatcat", name: "Fat-Cat", color: "#dc2626", category: "bad", source: "student", stochastic: false,
    decide: () => "D",
  },
  {
    key: "swagcat", name: "Swag-Cat", color: "#f59e0b", category: "mixed", source: "student", stochastic: false,
    decide: (h: any[]) => {
      if (h.length === 0) return "C";
      for (let i = h.length - 1; i >= 0; i--) {
        if (h[i].theirs === "D") return (h.length - i) <= 3 ? "D" : "C";
        if (h[i].theirs === "C") return "C";
      }
      return "C";
    },
  },
  {
    key: "realcat", name: "Real-Cat", color: "#e11d48", category: "bad", source: "student", stochastic: false,
    decide: (h: any[]) => {
      if (h.length < 3) return "C";
      const recent = h.slice(-5);
      const coops = recent.filter((r: any) => r.theirs === "C").length;
      return coops >= 3 ? "D" : "C";
    },
  },
  {
    key: "mizuki", name: "Mizuki", color: "#6366f1", category: "mixed", source: "student", stochastic: false,
    decide: (h: any[]) => {
      if (h.length === 0) return "C";
      let streak = 0;
      for (let i = 0; i < h.length; i++) {
        streak = h[i].theirs === "D" ? streak + 1 : 0;
        if (streak >= 3) return "D";
      }
      return h[h.length - 1].theirs;
    },
  },
];
