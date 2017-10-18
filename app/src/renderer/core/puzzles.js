const _ = null;
const b = 1;
const g = 2;
const p = 3;
const r = 4;
const y = 5;

/* empty template
{
  panels: [
    _, _, _, _, _, _,
    _, _, _, _, _, _,
    _, _, _, _, _, _,
    _, _, _, _, _, _,
    _, _, _, _, _, _,
    _, _, _, _, _, _,
    _, _, _, _, _, _,
    _, _, _, _, _, _,
    _, _, _, _, _, _,
    _, _, _, _, _, _,
    _, _, _, _, _, _
  ],
  steps: 1
},*/

module.exports = {
  // each new {} inside is a new level
  puzzle_levels: [
    // stage 1 - 01
    {
      panels: [
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, r, _, r, r, _
      ],
      steps: 1
    },

    {
      panels: [
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, b, _, _, _,
        _, b, b, _, b, _
      ],
      steps: 12
    },

    {
      panels: [
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, g, r, _, _,
        _, _, r, g, _, _,
        _, _, r, g, _, _
      ],
      steps: 1
    },

    {
      panels: [
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, b, y, _, _,
        _, _, b, y, _, _,
        _, _, y, b, _, _,
        _, _, b, y, _, _,
        _, _, b, y, _, _
      ],
      steps: 1
    },

    {
      panels: [
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, g, _, _, _,
        g, g, b, _, b, b
      ],
      steps: 1
    },

    {
      panels: [
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        r, r, p, r, p, p
      ],
      steps: 1
    },

    {
      panels: [
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, r, _, _, _,
        _, _, r, _, _, _,
        _, _, b, _, _, _,
        _, _, r, _, _, _,
        _, _, r, _, _, _,
        _, _, b, b, _, _
      ],
      steps: 1
    },

    {
      panels: [
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, y, _,
        _, _, _, _, y, _,
        _, p, p, y, p, _
      ],
      steps: 1
    },

    {
      panels: [
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, b, _, _, _,
        _, _, g, b, _, _,
        _, _, g, g, b, _
      ],
      steps: 1
    },

    {
      panels: [
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, y, r, _, _,
        _, _, r, y, _, _,
        _, _, y, r, _, _,
        _, _, r, y, _, _,
        _, _, y, r, _, _
      ],
      steps: 3
    },
  
    // stage 2 - 01
    {
      panels: [
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,

        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, _, _, _, _,
        _, _, y, _, _, _,
        _, _, r, _, _, _,
        _, _, r, _, _, _,
        _, _, y, _, _, _,
        _, _, r, y, y, _
      ],
      steps: 1
    }
  ]
};
