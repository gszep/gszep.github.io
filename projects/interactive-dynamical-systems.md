---
title: Interactive Dynamical Systems
layout: post
post-image: /assets/images/limit-cycle.gif
description: Using interactive features in Julia and WebGL to explore qualitative behaviours in dynamical systems.
tags:
  - WebGL
  - Shaders
  - Makie.jl
---

### Designing dynamical systems in Makie.jl with fixed points and limit cycles

In the following example we will study two qualitatively distinct types of behaviour: relaxation towards some equilibrium or steady state, oscillation around a limit cycle and a combination of the two. Below is a flow field showing both possibilities.

<figure>
  <img src="/assets/images/dynamical-system.png"/>
  <figcaption>A steady state and a limit cycle, separated by an unstable point (light blue cross)</figcaption>
</figure>

Starting in some areas of this field will always result in cycling, other areas will always lead to the same point. With Julia and `Makie.jl` we can connect the parameters of the system to mouse events. With this we can, for example, place a cycle of a certain radius, or choose the position of a steady state.

### Realtime manipulation of parameters in spatial systems using WebGL

Suppose we have a set of parameters that we would like to see the effect of, on a system of equations in real time! WebGL is well suited for this task, especially if our system is spatially extended. Below is an example where the equations describe how populations of two genetically engineered bacteria interact.

<figure>
  <img src="/assets/images/double-exclusive-reporter.gif"/>
  <figcaption>Painting initial conditions with your mouse, changing parameters with sliders.</figcaption>
</figure>

Code to run the web app is [available on GitHub](https://github.com/gszep/reaction-diffusion)

### References

G. Szep. 2022. Inferring bifurcations between phenotypes. Thesis

P.K. Grant, G. Szep et al. 2020. Interpretation of morphogen gradients by a synthetic bistable circuit. Nature communications 11 (1), 5545

G. Szep. 2020. Reaction-diffusion in two spatial dimensions.
