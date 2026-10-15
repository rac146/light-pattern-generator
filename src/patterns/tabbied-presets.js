// Generated from pinned MIT Tabbied definitions; edit scripts/tabbied-*.mjs, not this file.
const TabbiedPresets = {
  "version": "0.10.0",
  "designs": [
    {
      "id": "tabbied:hilbert",
      "slug": "hilbert",
      "label": "Hilbert",
      "category": "Polygons",
      "kind": "polygon",
      "description": "U-shaped cutouts turn through four orientations in a tiled field.",
      "polygon": [
        [
          0.14,
          0.14
        ],
        [
          0.34,
          0.14
        ],
        [
          0.34,
          0.66
        ],
        [
          0.66,
          0.66
        ],
        [
          0.66,
          0.14
        ],
        [
          0.86,
          0.14
        ],
        [
          0.86,
          0.86
        ],
        [
          0.14,
          0.86
        ]
      ],
      "orientation": "cycle",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:switchback",
      "slug": "switchback",
      "label": "Switchback",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Bold L-shaped cutouts turn in random directions, with solid gaps between tiles.",
      "polygon": [
        [
          0,
          0
        ],
        [
          0.35,
          0
        ],
        [
          0.35,
          0.65
        ],
        [
          1,
          0.65
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:spark",
      "slug": "spark",
      "label": "Spark",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Pointed spark cutouts repeat across the panel.",
      "polygon": [
        [
          0.5,
          0
        ],
        [
          0.61,
          0.39
        ],
        [
          1,
          0.5
        ],
        [
          0.61,
          0.61
        ],
        [
          0.5,
          1
        ],
        [
          0.39,
          0.61
        ],
        [
          0,
          0.5
        ],
        [
          0.39,
          0.39
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1
      ]
    },
    {
      "id": "tabbied:annulus",
      "slug": "annulus",
      "label": "Annulus",
      "orientation": "fixed",
      "turns": [
        0
      ],
      "kind": "annulus",
      "category": "Curves",
      "minCell": 14,
      "description": "Rings thicken down the panel. Two solid bridges hold each center in place."
    },
    {
      "id": "tabbied:apse",
      "slug": "apse",
      "label": "Apse",
      "orientation": "random",
      "turns": [
        0,
        1
      ],
      "kind": "apse",
      "category": "Curves",
      "description": "Rectangular bodies end in a semicircular extension."
    },
    {
      "id": "tabbied:bangle",
      "slug": "bangle",
      "label": "Bangle",
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ],
      "kind": "arc",
      "category": "Curves",
      "outer": 0.8202438661763951,
      "inner": 0.6222539674441618,
      "description": "Quarter-ring arcs turn around tile corners, separated by material bridges."
    },
    {
      "id": "tabbied:bauhaus",
      "slug": "bauhaus",
      "label": "Bauhaus",
      "orientation": "fixed",
      "turns": [
        0
      ],
      "kind": "rounded",
      "category": "Curves",
      "corners": [
        [
          0.5,
          0.5,
          0.5,
          0.5
        ],
        [
          0.5,
          0.5,
          0,
          0
        ],
        [
          0,
          0,
          0.5,
          0.5
        ],
        [
          0.5,
          0,
          0,
          0.5
        ],
        [
          0,
          0.5,
          0.5,
          0
        ],
        [
          0,
          0,
          0,
          0
        ],
        [
          0.5,
          0,
          0.5,
          0
        ],
        [
          0,
          0.5,
          0,
          0.5
        ]
      ],
      "description": "Circles, rounded blocks and leaf-like shapes mix in a geometric field."
    },
    {
      "id": "tabbied:bight",
      "slug": "bight",
      "label": "Bight",
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ],
      "kind": "bight",
      "category": "Curves",
      "description": "Broad blocks have a curved bay removed from one edge."
    },
    {
      "id": "tabbied:bluff",
      "slug": "bluff",
      "label": "Bluff",
      "orientation": "random",
      "turns": [
        0,
        1
      ],
      "kind": "bluff",
      "category": "Curves",
      "description": "Rounded bulges project from the edge of each tile."
    },
    {
      "id": "tabbied:bowl",
      "slug": "bowl",
      "label": "Bowl",
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ],
      "kind": "rounded",
      "category": "Curves",
      "box": [
        0.06,
        0.06,
        0.88,
        0.88
      ],
      "corners": [
        [
          0,
          0,
          0.5,
          0.5
        ]
      ],
      "description": "Bowl-shaped cutouts with rounded lower corners turn across the panel."
    },
    {
      "id": "tabbied:cavetto",
      "slug": "cavetto",
      "label": "Cavetto",
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ],
      "kind": "rounded",
      "category": "Curves",
      "corners": [
        [
          0,
          0,
          0,
          1
        ],
        [
          0,
          0,
          0.5,
          0.5
        ]
      ],
      "weights": [
        0.7,
        0.3
      ],
      "description": "Single curved corners mix with bowls, rotated within separate tiles."
    },
    {
      "id": "tabbied:protractor",
      "slug": "protractor",
      "label": "Protractor",
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ],
      "kind": "protractor",
      "category": "Curves",
      "description": "Half-ring cutouts leave a solid opening to their center."
    },
    {
      "id": "tabbied:radius",
      "slug": "radius",
      "label": "Radius",
      "orientation": "fixed",
      "turns": [
        0
      ],
      "kind": "radius",
      "category": "Curves",
      "description": "Quarter discs and circles fill separate tiles with solid gaps."
    },
    {
      "id": "tabbied:alcove",
      "slug": "alcove",
      "label": "Alcove",
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ],
      "kind": "alcove",
      "category": "Multi-part",
      "description": "Three bands join into a U-shaped opening in each tile."
    },
    {
      "id": "tabbied:casing",
      "slug": "casing",
      "label": "Casing",
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ],
      "kind": "casing",
      "category": "Multi-part",
      "description": "Square frames have two deliberate breaks to keep their centers attached."
    },
    {
      "id": "tabbied:strand",
      "slug": "strand",
      "label": "Strand",
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ],
      "kind": "rectangles",
      "category": "Multi-part",
      "minCell": 20,
      "boxes": [
        [
          0,
          0,
          1,
          0.3
        ],
        [
          0,
          0.46,
          1,
          0.12
        ]
      ],
      "description": "A broad band and a narrow band share each tile."
    },
    {
      "id": "tabbied:twohalf",
      "slug": "twohalf",
      "label": "Twohalf",
      "orientation": "random",
      "turns": [
        0,
        1
      ],
      "kind": "rectangles",
      "category": "Multi-part",
      "minCell": 24,
      "boxes": [
        [
          0,
          0,
          0.44,
          1
        ],
        [
          0.56,
          0,
          0.44,
          1
        ]
      ],
      "description": "Two broad blocks share each tile, separated by a solid channel."
    },
    {
      "id": "tabbied:weave",
      "slug": "weave",
      "label": "Weave",
      "orientation": "random",
      "turns": [
        0,
        1
      ],
      "kind": "weave",
      "category": "Multi-part",
      "minCell": 23,
      "description": "Alternating stripe tiles mix with occasional round or square patches."
    },
    {
      "id": "tabbied:anabranch",
      "slug": "anabranch",
      "label": "Anabranch",
      "orientation": "random",
      "turns": [
        0,
        1
      ],
      "kind": "paired-arcs",
      "category": "Paths",
      "outer": 0.6,
      "inner": 0.4,
      "minCell": 14,
      "description": "Broad paired arcs form winding channels with solid gaps between tiles."
    },
    {
      "id": "tabbied:circuit",
      "slug": "circuit",
      "label": "Circuit",
      "orientation": "fixed",
      "turns": [
        0
      ],
      "kind": "circuit",
      "category": "Paths",
      "minCell": 18,
      "description": "Random horizontal and vertical traces meet at corners, with occasional component nodes and solid gaps."
    },
    {
      "id": "tabbied:curl",
      "slug": "curl",
      "label": "Curl",
      "orientation": "random",
      "turns": [
        0,
        1
      ],
      "kind": "paired-arcs",
      "category": "Paths",
      "outer": 0.58,
      "inner": 0.42,
      "minCell": 14,
      "description": "Paired quarter arcs suggest winding paths. Solid gaps keep loops from detaching material."
    },
    {
      "id": "tabbied:maze",
      "slug": "maze",
      "label": "Maze",
      "orientation": "random",
      "turns": [
        0,
        1
      ],
      "kind": "maze",
      "category": "Paths",
      "description": "Diagonal maze strokes and occasional round nodes have solid gaps between tiles."
    },
    {
      "id": "tabbied:truchetrings",
      "slug": "truchetrings",
      "label": "Truchet Rings",
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ],
      "kind": "paired-arcs",
      "category": "Paths",
      "outer": 0.54,
      "inner": 0.46,
      "minCell": 14,
      "description": "Thin paired arcs turn across the grid, with solid bridges between tiles."
    },
    {
      "id": "tabbied:abutment",
      "slug": "abutment",
      "label": "Abutment",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Abutment shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          0.46,
          0
        ],
        [
          0.68,
          0.44
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:angleoff",
      "slug": "angleoff",
      "label": "Angleoff",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Angleoff shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          0.16
        ],
        [
          0,
          0.92
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:arris",
      "slug": "arris",
      "label": "Arris",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Arris shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0.26,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ],
        [
          0,
          0.26
        ]
      ],
      "orientation": "fixed",
      "turns": [
        0
      ]
    },
    {
      "id": "tabbied:battlement",
      "slug": "battlement",
      "label": "Battlement",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Battlement shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0.35
        ],
        [
          0.2,
          0.35
        ],
        [
          0.2,
          0
        ],
        [
          0.4,
          0
        ],
        [
          0.4,
          0.35
        ],
        [
          0.6,
          0.35
        ],
        [
          0.6,
          0
        ],
        [
          0.8,
          0
        ],
        [
          0.8,
          0.35
        ],
        [
          1,
          0.35
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:bench",
      "slug": "bench",
      "label": "Bench",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Bench shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          1
        ],
        [
          0,
          0.58
        ],
        [
          0.46,
          0.58
        ],
        [
          0.46,
          0.26
        ],
        [
          1,
          0.26
        ],
        [
          1,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:bevelset",
      "slug": "bevelset",
      "label": "Bevelset",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Bevelset shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0.3,
          0
        ],
        [
          0.7,
          0
        ],
        [
          1,
          0.3
        ],
        [
          1,
          0.7
        ],
        [
          0.7,
          1
        ],
        [
          0.3,
          1
        ],
        [
          0,
          0.7
        ],
        [
          0,
          0.3
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1
      ]
    },
    {
      "id": "tabbied:birdsmouth",
      "slug": "birdsmouth",
      "label": "Birdsmouth",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Birdsmouth shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0.5,
          0.46
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:bobbin",
      "slug": "bobbin",
      "label": "Bobbin",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Bobbin shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0.12,
          0.08
        ],
        [
          0.88,
          0.08
        ],
        [
          0.88,
          0.28
        ],
        [
          0.6,
          0.42
        ],
        [
          0.6,
          0.58
        ],
        [
          0.88,
          0.72
        ],
        [
          0.88,
          0.92
        ],
        [
          0.12,
          0.92
        ],
        [
          0.12,
          0.72
        ],
        [
          0.4,
          0.58
        ],
        [
          0.4,
          0.42
        ],
        [
          0.12,
          0.28
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1
      ]
    },
    {
      "id": "tabbied:bracket",
      "slug": "bracket",
      "label": "Bracket",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Bracket shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          0.42,
          0
        ],
        [
          0.42,
          0.58
        ],
        [
          1,
          0.58
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:caltrop",
      "slug": "caltrop",
      "label": "Caltrop",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Caltrop shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0.5,
          0.12
        ],
        [
          0.62,
          0.38
        ],
        [
          0.88,
          0.5
        ],
        [
          0.62,
          0.62
        ],
        [
          0.5,
          0.88
        ],
        [
          0.38,
          0.62
        ],
        [
          0.12,
          0.5
        ],
        [
          0.38,
          0.38
        ]
      ],
      "orientation": "fixed",
      "turns": [
        0
      ]
    },
    {
      "id": "tabbied:cascade",
      "slug": "cascade",
      "label": "Cascade",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Cascade shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          0.34,
          0
        ],
        [
          0.34,
          0.34
        ],
        [
          0.67,
          0.34
        ],
        [
          0.67,
          0.67
        ],
        [
          1,
          0.67
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:chamfer",
      "slug": "chamfer",
      "label": "Chamfer",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Chamfer shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          0.7,
          0
        ],
        [
          1,
          0.3
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:clipcorner",
      "slug": "clipcorner",
      "label": "Clipcorner",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Clipcorner shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0.36,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          0.64
        ],
        [
          0.64,
          1
        ],
        [
          0,
          1
        ],
        [
          0,
          0.36
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1
      ]
    },
    {
      "id": "tabbied:cornerchip",
      "slug": "cornerchip",
      "label": "Cornerchip",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Cornerchip shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0.44,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          0.56
        ],
        [
          0.56,
          1
        ],
        [
          0,
          1
        ],
        [
          0,
          0.44
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1
      ]
    },
    {
      "id": "tabbied:cornercut",
      "slug": "cornercut",
      "label": "Cornercut",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Cornercut shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          0.62,
          0
        ],
        [
          1,
          0.38
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:dieblock",
      "slug": "dieblock",
      "label": "Dieblock",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Dieblock shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0.22,
          0
        ],
        [
          0.78,
          0
        ],
        [
          0.78,
          0.22
        ],
        [
          1,
          0.22
        ],
        [
          1,
          0.78
        ],
        [
          0.78,
          0.78
        ],
        [
          0.78,
          1
        ],
        [
          0.22,
          1
        ],
        [
          0.22,
          0.78
        ],
        [
          0,
          0.78
        ],
        [
          0,
          0.22
        ],
        [
          0.22,
          0.22
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1
      ]
    },
    {
      "id": "tabbied:dogtooth",
      "slug": "dogtooth",
      "label": "Dogtooth",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Dogtooth shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          0.6,
          0
        ],
        [
          0.6,
          0.4
        ],
        [
          1,
          0.4
        ],
        [
          1,
          1
        ],
        [
          0.4,
          1
        ],
        [
          0.4,
          0.6
        ],
        [
          0,
          0.6
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:ell",
      "slug": "ell",
      "label": "Ell",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Ell shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          0.48,
          0
        ],
        [
          0.48,
          0.52
        ],
        [
          1,
          0.52
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:gnomonwedge",
      "slug": "gnomonwedge",
      "label": "Gnomonwedge",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Gnomonwedge shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:gorge",
      "slug": "gorge",
      "label": "Gorge",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Gorge shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          0.42,
          0
        ],
        [
          0.46,
          0.88
        ],
        [
          0.54,
          0.88
        ],
        [
          0.58,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:guernsey",
      "slug": "guernsey",
      "label": "Guernsey",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Guernsey shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0.44
        ],
        [
          0.25,
          0.2
        ],
        [
          0.5,
          0.44
        ],
        [
          0.75,
          0.2
        ],
        [
          1,
          0.44
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:gully",
      "slug": "gully",
      "label": "Gully",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Gully shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0.58,
          1
        ],
        [
          0.5,
          0.4
        ],
        [
          0.42,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:halving",
      "slug": "halving",
      "label": "Halving",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Halving shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          0.36,
          0
        ],
        [
          0.36,
          0.26
        ],
        [
          0.64,
          0.26
        ],
        [
          0.64,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0.64,
          1
        ],
        [
          0.64,
          0.74
        ],
        [
          0.36,
          0.74
        ],
        [
          0.36,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1
      ]
    },
    {
      "id": "tabbied:housing",
      "slug": "housing",
      "label": "Housing",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Housing shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ],
        [
          0,
          0.66
        ],
        [
          0.64,
          0.66
        ],
        [
          0.64,
          0.34
        ],
        [
          0,
          0.34
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:jerkinhead",
      "slug": "jerkinhead",
      "label": "Jerkinhead",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Jerkinhead shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          1
        ],
        [
          1,
          1
        ],
        [
          1,
          0.46
        ],
        [
          0.72,
          0.14
        ],
        [
          0.28,
          0.14
        ],
        [
          0,
          0.46
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:larmier",
      "slug": "larmier",
      "label": "Larmier",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Larmier shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0.3
        ],
        [
          1,
          0.3
        ],
        [
          1,
          0.52
        ],
        [
          0.84,
          0.68
        ],
        [
          0.16,
          0.68
        ],
        [
          0,
          0.52
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1
      ]
    },
    {
      "id": "tabbied:lintel",
      "slug": "lintel",
      "label": "Lintel",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Lintel shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0.72,
          1
        ],
        [
          0.72,
          0.28
        ],
        [
          0.28,
          0.28
        ],
        [
          0.28,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "fixed",
      "turns": [
        0
      ]
    },
    {
      "id": "tabbied:louvre",
      "slug": "louvre",
      "label": "Louvre",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Louvre shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0.22
        ],
        [
          1,
          0
        ],
        [
          1,
          0.78
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "fixed",
      "turns": [
        0
      ]
    },
    {
      "id": "tabbied:merlon",
      "slug": "merlon",
      "label": "Merlon",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Merlon shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0.66,
          1
        ],
        [
          0.66,
          0.45
        ],
        [
          0.34,
          0.45
        ],
        [
          0.34,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:mitre",
      "slug": "mitre",
      "label": "Mitre",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Mitre shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          0.24
        ],
        [
          0,
          0.88
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:modillion",
      "slug": "modillion",
      "label": "Modillion",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Modillion shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          0.28
        ],
        [
          0.58,
          0.28
        ],
        [
          0.58,
          0.52
        ],
        [
          0.82,
          0.52
        ],
        [
          0.4,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:mutule",
      "slug": "mutule",
      "label": "Mutule",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Mutule shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          0.7
        ],
        [
          0.76,
          0.7
        ],
        [
          0.76,
          1
        ],
        [
          0.24,
          1
        ],
        [
          0.24,
          0.7
        ],
        [
          0,
          0.7
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:northstar",
      "slug": "northstar",
      "label": "Northstar",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Northstar shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0.5,
          0
        ],
        [
          0.61,
          0.39
        ],
        [
          1,
          0.5
        ],
        [
          0.61,
          0.61
        ],
        [
          0.5,
          1
        ],
        [
          0.39,
          0.61
        ],
        [
          0,
          0.5
        ],
        [
          0.39,
          0.39
        ]
      ],
      "orientation": "fixed",
      "turns": [
        0
      ]
    },
    {
      "id": "tabbied:nosing",
      "slug": "nosing",
      "label": "Nosing",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Nosing shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          0.62
        ],
        [
          0.7,
          0.62
        ],
        [
          0.7,
          0.8
        ],
        [
          0.36,
          0.8
        ],
        [
          0.36,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:notchblock",
      "slug": "notchblock",
      "label": "Notchblock",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Notchblock shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0.58,
          1
        ],
        [
          0.58,
          0.58
        ],
        [
          0,
          0.58
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:octagon",
      "slug": "octagon",
      "label": "Octagon",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Octagon shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0.3,
          0.04
        ],
        [
          0.7,
          0.04
        ],
        [
          0.96,
          0.3
        ],
        [
          0.96,
          0.7
        ],
        [
          0.7,
          0.96
        ],
        [
          0.3,
          0.96
        ],
        [
          0.04,
          0.7
        ],
        [
          0.04,
          0.3
        ]
      ],
      "orientation": "fixed",
      "turns": [
        0
      ]
    },
    {
      "id": "tabbied:quoinwedge",
      "slug": "quoinwedge",
      "label": "Quoinwedge",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Quoinwedge shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          0.34
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:rabbet",
      "slug": "rabbet",
      "label": "Rabbet",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Rabbet shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0.16,
          0.16
        ],
        [
          0.52,
          0.16
        ],
        [
          0.52,
          0.52
        ],
        [
          0.84,
          0.52
        ],
        [
          0.84,
          0.84
        ],
        [
          0.16,
          0.84
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:rafter",
      "slug": "rafter",
      "label": "Rafter",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Rafter shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0.58
        ],
        [
          0.58,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          0.42
        ],
        [
          0.42,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "fixed",
      "turns": [
        0
      ]
    },
    {
      "id": "tabbied:rebate",
      "slug": "rebate",
      "label": "Rebate",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Rebate shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0.14,
          0.14
        ],
        [
          0.86,
          0.14
        ],
        [
          0.86,
          0.86
        ],
        [
          0.62,
          0.86
        ],
        [
          0.62,
          0.56
        ],
        [
          0.14,
          0.56
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:skewback",
      "slug": "skewback",
      "label": "Skewback",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Skewback shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0.26
        ],
        [
          0.58,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:snipcorner",
      "slug": "snipcorner",
      "label": "Snipcorner",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Snipcorner shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          0.76
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:staple",
      "slug": "staple",
      "label": "Staple",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Staple shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0.14,
          0.16
        ],
        [
          0.86,
          0.16
        ],
        [
          0.86,
          0.88
        ],
        [
          0.68,
          0.88
        ],
        [
          0.68,
          0.36
        ],
        [
          0.32,
          0.36
        ],
        [
          0.32,
          0.88
        ],
        [
          0.14,
          0.88
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:stylobate",
      "slug": "stylobate",
      "label": "Stylobate",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Stylobate shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          0.34,
          0
        ],
        [
          0.34,
          0.34
        ],
        [
          0.67,
          0.34
        ],
        [
          0.67,
          0.67
        ],
        [
          1,
          0.67
        ],
        [
          1,
          1
        ],
        [
          0,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:tetro",
      "slug": "tetro",
      "label": "Tetro",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Tetro shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          0.5
        ],
        [
          0.66,
          0.5
        ],
        [
          0.66,
          1
        ],
        [
          0.33,
          1
        ],
        [
          0.33,
          0.5
        ],
        [
          0,
          0.5
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:ziggurat",
      "slug": "ziggurat",
      "label": "Ziggurat",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Ziggurat shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          1
        ],
        [
          0,
          0.6659999999999999
        ],
        [
          0.33299999999999996,
          0.6659999999999999
        ],
        [
          0.33299999999999996,
          0.33299999999999996
        ],
        [
          0.6659999999999999,
          0.33299999999999996
        ],
        [
          0.6659999999999999,
          0
        ],
        [
          1,
          0
        ],
        [
          1,
          1
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "id": "tabbied:ziggy",
      "slug": "ziggy",
      "label": "Ziggy",
      "category": "Polygons",
      "kind": "polygon",
      "description": "Ziggy shapes repeat in separate tiles with solid gaps.",
      "polygon": [
        [
          0,
          0
        ],
        [
          0.5,
          0.5
        ],
        [
          1,
          0
        ],
        [
          1,
          0.5
        ],
        [
          0.5,
          1
        ],
        [
          0,
          0.5
        ]
      ],
      "orientation": "random",
      "turns": [
        0,
        0,
        2,
        2,
        1,
        3
      ]
    }
  ]
};
