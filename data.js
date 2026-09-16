/**
 * DEFAULT_MACHINES
 * ------------------------------------------------------------------
 * Built-in guides that ship with the site. Each entry corresponds to
 * one compiled AR marker image (see README.md), matched by
 * `targetIndex` — that's the position the source image was placed in
 * when you ran the MindAR compiler.
 *
 * Anything added later through the on-screen "⚙️" admin panel is
 * stored separately in localStorage and merged over this list at
 * runtime (app.js does the merging), so editing this file is optional
 * — it's just a convenient place to pre-load your first machine(s).
 *
 * Add a new object to this array for every additional machine you
 * compile a marker for, giving it the next free targetIndex (0-9,
 * matching the <a-entity mindar-image-target="targetIndex: N">
 * slots already in index.html).
 */
const DEFAULT_MACHINES = [
  {
    targetIndex: 0,
    id: "dnm-8z100a",
    name: "DNM 4-Zone Stereo Amplifier (8Z100A)",
    controls: [
      {
        label: "Power Button",
        description: "Turns the amplifier on (I) and off (O)."
      },
      {
        label: "USB Port",
        description: "Plug in a USB drive to play MP3s directly through the amp."
      },
      {
        label: "Zone Volume Knobs (x4)",
        description:
          "Each of the 4 knobs controls one zone's speaker volume. Zone 1 = Room 1 (high volume), Zone 2 = Room 2 (low volume), Zone 3 = Corridor (medium volume), Zone 4 = Room 4 (no sound). The red LED above a knob lights up when that zone is active."
      },
      {
        label: "MIC VOL",
        description: "Adjusts the volume of the connected microphone."
      },
      {
        label: "BASS",
        description: "Turn toward + for more bass/deeper sound, toward − for less bass."
      },
      {
        label: "TREBLE",
        description:
          "Controls high-frequency sound. + = brighter/sharper, − = softer/duller. Affects voice clarity, cymbals, and high notes."
      },
      {
        label: "BALANCE",
        description:
          "Balances left vs right stereo speakers. Turn left for more left sound, right for more right sound. Normally left centered."
      },
      {
        label: "MUSIC VOL (big knob)",
        description:
          "The main/master music volume, applied before the signal is split out to the zones. Signal path: Music Volume → Zone Volume."
      },
      {
        label: "MODE / BT-USB button",
        description: "Switches the media source: Bluetooth, USB, SD, or FM."
      },
      {
        label: "Previous / Next buttons",
        description: "Skip tracks (media mode) or change preset FM stations (tuner mode)."
      },
      {
        label: "Play / Pause",
        description: "Plays or pauses playback when using USB, SD, or Bluetooth."
      },
      {
        label: "CH− / CH+",
        description: "Step to the previous/next FM station."
      },
      {
        label: "AUTO",
        description: "Automatically scans for available FM stations."
      },
      {
        label: "FM",
        description: "Selects FM radio mode. Typical flow: FM → AUTO → CH−/CH+ to browse stations."
      },
      {
        label: "BT / ST-USB / DVD / CD (input select)",
        description:
          "Chooses which input source feeds the amp: Bluetooth, USB/media, DVD, or CD."
      },
      {
        label: "LOUD",
        description:
          "Loudness boost — enhances low/high frequencies, useful when listening at low volume."
      }
    ]
  }
];
