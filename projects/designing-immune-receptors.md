---
title: Designing Immune Receptors
layout: post
post-image: /assets/images/pMHC.png
description: The surfaces of white blood cells are covered in receptors that act as three-dimensional puzzle pieces that only match proteins that are not native to the body.
tags:
  - Blender
  - PDB Files
  - Geometry Nodes
---

### Signals of cancer can appear on the surface of tumor cells

Healthy cells present fragments of their proteins, called peptides, on their surface. These peptides are held in place by molecules called MHC. When a cell aquires a mutation that causes it to behave like a tumor cell, there is a chance that the mutation in question gets presented by the MHC. When this happens, white blood cells have an opportunity to recognise the mutated peptide with the receptors on its surface.

<figure>
  <img src="/assets/images/pmhc-2.png" width="128"/>
  <img src="/assets/images/pmhc-3.png" width="128"/>
  <img src="/assets/images/pmhc-4.png" width="128"/>
  <img src="/assets/images/pmhc-5.png" width="128"/>
  <figcaption>A mutation (black) appears in the peptide (white) presented by an MHC molecule (cyan)</figcaption>
</figure>

### Designing receptors that match the cancer signal, but not healthy cells, is hard

- Explain how receptors work
- Explain combinatoric complexity

<figure>
  <img src="/assets/images/tcr-1.png" width="128"/>
  <img src="/assets/images/tcr-2.png" width="128"/>
  <img src="/assets/images/tcr-3.png" width="128"/>
  <img src="/assets/images/tcr-4.png" width="128"/>
  <figcaption>A white blood cell receptor (red) is generated with the help of AI to match the shape of the mutated peptide presented on the MHC</figcaption>
</figure>

### Using Blender to Visualise the Combinatoric Complexity

- Explain PDB file format
- How do I design an AI to generate them?
- Use molecular nodes https://bradyajohnston.github.io/MolecularNodes/
