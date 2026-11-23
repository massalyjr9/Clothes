// All site content for NOWHERE® Vol. 01.

const CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/';
export const px = (file, w) =>
  `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(CDN + file)}&w=${w}&q=85`;

const CUTS = [
  'hf_20261108_190717_6580d844-f3b0-4240-8b4a-239355685fc9.png',
  'hf_20261111_034030_a9171bb1-0b34-4468-9a9e-f451d79b8429.png',
  'hf_20261111_034045_5a78f1ff-8dea-4054-85bc-60a28a4cc434.png',
  'hf_20261111_034059_24eecc7c-e8b7-4b9c-b58c-b862b1261e87.png',
  'hf_20261111_034112_5aa3a76f-7e92-48bb-b93d-ec3a35be2494.png',
  'hf_20261111_034123_ce28dc23-bd91-40ba-95e6-7a09442a865f.png',
  'hf_20261111_034137_abed307a-bcb4-4192-82e9-6ec122a80820.png',
  'hf_20261111_034150_fc1776ff-a8d6-4060-a8af-1afedfdfc563.png',
  'hf_20261111_034202_62b7ffb7-14f5-4dfc-87fe-83c6d9ee6134.png',
];
const SHEETS = [
  'hf_20261108_190756_3f427fdd-ba34-433e-bc55-eb9b03d2e1c6.png',
  'hf_20261108_190758_785127d3-ef7d-4831-976b-14540a7188aa.png',
  'hf_20261108_190800_4db1daba-ebb1-436f-857a-91dfab40f4b7.png',
];

const CLOTH = ['S', 'M', 'L', 'XL'];
const SHOE = ['40', '41', '42', '43', '44', '45'];
const ONE = ['One size'];

const RAW = [
  ['Somewhere Else', .0501, [[52, 44], [80, 40], [44, 57]], [['Ribbed Tank Top', 'Top', 36, CLOTH], ['Striped Open Shirt', 'Top', 74, CLOTH], ['Braided Belt', 'Accessory', 32, ONE]]],
  ['Dial-Up', .0501, [[76, 45], [54, 68], [45, 87]], [['Corduroy Trucker', 'Outerwear', 142, CLOTH], ['Pleated Shorts', 'Bottom', 64, CLOTH], ['Suede Moccasin', 'Shoes', 118, SHOE]]],
  ['Long Walks', .0656, [[66, 47], [51, 64], [48, 87]], [['Polar Fleece Zip', 'Top', 92, CLOTH], ['Nylon Hike Shorts', 'Bottom', 58, CLOTH], ['Mesh Trainers', 'Shoes', 124, SHOE]]],
  ['Low Battery', .0582, [[76, 47], [43, 70], [54, 88]], [['Yellow Anorak Shell', 'Outerwear', 128, CLOTH], ['Fleece Joggers', 'Bottom', 72, CLOTH], ['Chunky Sandals', 'Shoes', 84, SHOE]]],
  ['No Reply', .065, [[72, 41], [51, 68], [45, 89]], [['Navy Rollneck Knit', 'Top', 118, CLOTH], ['Wool Trousers', 'Bottom', 106, CLOTH], ['Leather Mary Janes', 'Shoes', 134, SHOE]]],
  ['Analog', .047, [[75, 45], [51, 70], [46, 88]], [['Corduroy Blazer', 'Outerwear', 156, CLOTH], ['Black Slim Jeans', 'Bottom', 98, CLOTH], ['Desert Boots', 'Shoes', 146, SHOE]]],
  ['Rewind', .0377, [[69, 43], [51, 72], [56, 92]], [['Faded Black Hoodie', 'Top', 86, CLOTH], ['Carpenter Trousers', 'Bottom', 94, CLOTH], ['Retro Court Sneaker', 'Shoes', 116, SHOE]]],
  ['Out Of Office', .0891, [[65, 47], [43, 68], [60, 86]], [['Linen Camp Shirt', 'Top', 76, CLOTH], ['Pleated Bermuda', 'Bottom', 68, CLOTH], ['Leather Slides', 'Shoes', 62, SHOE]]],
  ['Paper Maps', .0588, [[66, 41], [48, 72], [56, 88]], [['Rugby Top', 'Top', 88, CLOTH], ['Tapered Khakis', 'Bottom', 84, CLOTH], ['Suede Low-Tops', 'Shoes', 122, SHOE]]],
];

export const LOOKS = RAW.map(([name, foot, tags, items], k) => ({
  n: k + 1, name, foot, tags,
  items: items.map(([iname, kind, price, sizes]) => ({ name: iname, kind, price, sizes })),
  img: px(CUTS[k], 914), small: px(CUTS[k], 571),
  sheet: px(SHEETS[Math.floor(k / 3)], 600), row: k % 3,
}));

export const pad = (n) => String(n).padStart(2, '0');
export const money = (v) => '$' + (Math.round(v * 100) / 100).toFixed(v % 1 ? 2 : 0);
export const sumOf = (L) => L.items.reduce((s, it) => s + it.price, 0);

/* ---------- Places: where each look was shot ---------- */
export const PLACES = [
  { name: 'Lisbon', coords: '38.7223° N · 9.1393° W', time: '06:00', note: 'Where the till printed the first receipt. Trams, steep stairs, no reception in the stairwells.', looks: [1, 5] },
  { name: 'Porto', coords: '41.1579° N · 8.6291° W', time: '07:40', note: 'A payphone by the river still takes coins. Nobody called back, which was the point.', looks: [2, 6] },
  { name: 'Sintra', coords: '38.8029° N · 9.3817° W', time: '09:15', note: 'Fog thick enough to lose the map and the signal at the same time.', looks: [3, 9] },
  { name: 'Marseille', coords: '43.2965° N · 5.3698° E', time: '13:30', note: 'Battery at twelve percent all afternoon. We let it stay there.', looks: [4, 8] },
  { name: 'Tangier', coords: '35.7595° N · 5.8340° W', time: '18:05', note: 'A cassette shop, a rooftop, a long rewind before the ferry.', looks: [7] },
];

/* ---------- Letters: short notes from the road ---------- */
export const LETTERS = [
  {
    title: 'On going quiet', place: 'Lisbon', date: '02.11.2026',
    body: [
      'Dear you, we switched the phones to airplane mode on the first morning and never quite switched them back. The city kept talking; we just stopped answering.',
      'Vol. 01 started there: nine looks for the hours nobody can reach you. Soft fabrics, flat shoes, pockets deep enough for a paper map.',
      'If you are reading this, you are already a little out of the loop. Stay there a while.',
    ],
  },
  {
    title: 'The long way round', place: 'Sintra', date: '05.11.2026',
    body: [
      'The quickest route was eleven minutes. We took two hours, a wrong turn and a bench with a view.',
      'Mesh trainers held up. The fleece did its job when the fog came in. The map is now mostly creases.',
      'Nothing happened, beautifully.',
    ],
  },
  {
    title: 'Out of office, indefinitely', place: 'Marseille', date: '09.11.2026',
    body: [
      'Auto-reply on. Linen shirt on. We wrote the message in pencil first, to see if it still sounded true.',
      'It did: “I am somewhere else. I will reply when I come back, if I come back.”',
      'The sea was loud enough to drown out any notification we might have missed.',
    ],
  },
  {
    title: 'What the dial tone knew', place: 'Porto', date: '13.11.2026',
    body: [
      'There is a sound phones used to make when nobody was on the line. A long, patient hum.',
      'We built Dial-Up around it: corduroy, pleats, a moccasin that walks slower than you think.',
      'Pick up, listen to nothing, hang up. Repeat until rested.',
    ],
  },
];

/* ---------- Postcards: one per look ---------- */
export const POSTCARD_NOTES = [
  'Wish you were here. Actually, wish you were nowhere.',
  'Tried calling. Line busy with silence.',
  'Walked until the road ran out. Then a bit more.',
  'Battery low, spirits high.',
  'Saw your message. Did not reply. Felt great.',
  'Everything here is slower and better.',
  'Rewound the whole afternoon to watch it again.',
  'Back never. Or Monday.',
  'Folded the map wrong on purpose.',
];
