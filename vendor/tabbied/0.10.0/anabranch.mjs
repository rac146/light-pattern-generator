const anabranch = {
    "name": "Anabranch",
    "slug": "anabranch",
    "galleryOrder": 4019,
    "galleryWhite": true,
    "description": "Truchet tiles of paired quarter arcs whose turn follows a smooth field, so the arcs run in long parallel channels that split and rejoin like a braided river.",
    "palette": [
        "#1B1B3A",
        "#FFD166",
        "#EF476F",
        "#06D6A0",
        "#118AB2",
        "#F8F4E3"
    ],
    "colors": {
        "min": 2,
        "max": 6,
        "default": 6
    },
    "options": [
        {
            "id": "grid",
            "displayName": "Columns and rows",
            "type": "ButtonSelectGroup",
            "default": "8x12",
            "options": [
                "2x3",
                "4x6",
                "6x9",
                "8x12",
                "10x15"
            ],
            "replace": "${grid}"
        },
        {
            "id": "frequency",
            "displayName": "Frequency",
            "type": "Slider",
            "default": 1,
            "min": 0.2,
            "max": 1,
            "step": 0.1,
            "replace": "${shapeFrequency}"
        }
    ],
    "code": {
        "style": "--rule: ( @random(${shapeFrequency}) { --n: @rn(0, 6, 1.3); -webkit-transform: rotate(@calc(floor($(n)) % 2 * 90)deg); transform: rotate(@calc(floor($(n)) % 2 * 90)deg); :before { content: ''; position: absolute; inset: 0; background: @p(var(--color1), var(--color2), var(--color3), var(--color4), var(--color5)); -webkit-clip-path: @var(--qa); clip-path: @var(--qa); -webkit-transition: ease 450ms; transition: ease 450ms; } :after { content: ''; position: absolute; inset: 0; background: @p(var(--color1), var(--color2), var(--color3), var(--color4), var(--color5)); -webkit-clip-path: @var(--qb); clip-path: @var(--qb); -webkit-transition: ease 450ms; transition: ease 450ms; } } -webkit-transition: ease 450ms; transition: ease 450ms; );",
        "doodle": ":doodle { @grid: ${grid}; @size: ${width} ${height}; overflow:hidden; text-align:center; box-sizing:border-box; --qa: polygon(60.0% 0.0%, 59.9% 3.9%, 59.5% 7.8%, 58.8% 11.7%, 58.0% 15.5%, 56.8% 19.3%, 55.4% 23.0%, 53.8% 26.5%, 52.0% 30.0%, 49.9% 33.3%, 47.6% 36.5%, 45.1% 39.6%, 42.4% 42.4%, 39.6% 45.1%, 36.5% 47.6%, 33.3% 49.9%, 30.0% 52.0%, 26.5% 53.8%, 23.0% 55.4%, 19.3% 56.8%, 15.5% 58.0%, 11.7% 58.8%, 7.8% 59.5%, 3.9% 59.9%, 0.0% 60.0%, 0.0% 40.0%, 2.6% 39.9%, 5.2% 39.7%, 7.8% 39.2%, 10.4% 38.6%, 12.9% 37.9%, 15.3% 37.0%, 17.7% 35.9%, 20.0% 34.6%, 22.2% 33.3%, 24.4% 31.7%, 26.4% 30.1%, 28.3% 28.3%, 30.1% 26.4%, 31.7% 24.4%, 33.3% 22.2%, 34.6% 20.0%, 35.9% 17.7%, 37.0% 15.3%, 37.9% 12.9%, 38.6% 10.4%, 39.2% 7.8%, 39.7% 5.2%, 39.9% 2.6%, 40.0% 0.0%); --qb: polygon(40.0% 100.0%, 40.1% 96.1%, 40.5% 92.2%, 41.2% 88.3%, 42.0% 84.5%, 43.2% 80.7%, 44.6% 77.0%, 46.2% 73.5%, 48.0% 70.0%, 50.1% 66.7%, 52.4% 63.5%, 54.9% 60.4%, 57.6% 57.6%, 60.4% 54.9%, 63.5% 52.4%, 66.7% 50.1%, 70.0% 48.0%, 73.5% 46.2%, 77.0% 44.6%, 80.7% 43.2%, 84.5% 42.0%, 88.3% 41.2%, 92.2% 40.5%, 96.1% 40.1%, 100.0% 40.0%, 100.0% 60.0%, 97.4% 60.1%, 94.8% 60.3%, 92.2% 60.8%, 89.6% 61.4%, 87.1% 62.1%, 84.7% 63.0%, 82.3% 64.1%, 80.0% 65.4%, 77.8% 66.7%, 75.6% 68.3%, 73.6% 69.9%, 71.7% 71.7%, 69.9% 73.6%, 68.3% 75.6%, 66.7% 77.8%, 65.4% 80.0%, 64.1% 82.3%, 63.0% 84.7%, 62.1% 87.1%, 61.4% 89.6%, 60.8% 92.2%, 60.3% 94.8%, 60.1% 97.4%, 60.0% 100.0%); } :container { background: var(--color0); overflow:hidden; }"
    }
};
export default anabranch;
//# sourceMappingURL=anabranch.js.map