---
title: Brutalism and Pencil Shaders
layout: post
post-image: /assets/images/pencil-shader.gif
description: An experiment in pencil shaders in brutalist environments in Unity.
tags:
  - Unity
  - HLSL
  - C#
---

### Walking through a penicl drawing of a brutalist building

I would like to create a walking simulation of what it would be like to explore a pencil drawing of a brutalist building. Below is an example of the style I am aiming for.

<figure>
  <img src="/assets/images/brutalism-pencil.jpg"/>
  <figcaption>A pencil drawing of a brutalist building</figcaption>
</figure>

As the player walks through the environment, the style of the pencil strokes and shading should change to reflect the mood. Slow straight strokes for calm and thick chaotic strokes for danger. Below a handful of examples to use as reference.

<figure>
  <img src="/assets/images/shading-styles.png"/>
  <figcaption>Shading styles to use as reference</figcaption>
</figure>

### How do pencil strokes look as a shader?

We take inspiration from [Slime mold simulations](https://www.youtube.com/watch?v=X-iSQQgOd1A) and use compute shaders to define the update rules for the position and velocity of each pencil. In our case, instead of having the pencil react to each other, as the slime mold does, the penicls will be a post-processing effect in a rendering pipeline.

<figure>
  <img src="/assets/images/color-pencil.gif"/>
  <figcaption>An example of the pencil shader with normal maps</figcaption>
</figure>

The shader we write will have to make a pencil:

- Follow edges when it can
- Moves in one direction along planes
- Changes thickness according to lighting/depth
- Creates a trail of finite length

The HLSL code for these rules is available in [this repository](https://github.com/gszep/pencil-shader)

### Next steps

There is too much going on with all the moving pencils. More frame-to-frame consistency is required in order to make a walking simulation playable. This can be done by running the compute shaders for multiple passes in the background and only rendering images once the pencil simulation has reached "steady state". This will give the walking simulation a stop-motion feeling like with hand-drawn animation.
