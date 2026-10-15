const truchetrings = {
    "name": "Truchet Rings",
    "slug": "truchetrings",
    "galleryOrder": 3013,
    "description": "Truchet tiles of paired quarter-circle arcs, rotated at random, tracing interlocking rings across the grid.",
    "palette": [
        "#0A0C27",
        "#8892B0",
        "#51EAEA",
        "#FF9D77"
    ],
    "colors": {
        "min": 2,
        "max": 4,
        "default": 4
    },
    "options": [
        {
            "id": "grid",
            "displayName": "Grid density",
            "type": "ButtonSelectGroup",
            "default": "16x16",
            "options": [
                "10x10",
                "13x13",
                "16x16",
                "19x19",
                "22x22"
            ],
            "replace": "${grid}"
        }
    ],
    "code": {
        "style": "--rule: ( overflow: hidden; position: relative; transform: rotate(@pick(90deg, 180deg, 270deg, 360deg)); :before, :after { content: ''; display: block; position: absolute; width: 100%; height: 100%; border: 2px solid @p(var(--color1), var(--color2), var(--color3)); border-radius: 100%; } :before { transform: translate(calc(-50% + 1px), calc(-50% + 1px)); } :after { transform: translate(calc(50% - 1px), calc(50% - 1px)); } -webkit-transition: ease 450ms; transition: ease 450ms; );",
        "doodle": ":doodle { @grid: ${grid}; @size: ${width} ${height}; overflow:hidden; box-sizing:border-box; } :container { background: var(--color0); overflow:hidden; }"
    }
};
export default truchetrings;
//# sourceMappingURL=truchetrings.js.map