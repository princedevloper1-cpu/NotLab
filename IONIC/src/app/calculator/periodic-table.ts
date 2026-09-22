// Source: https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON (2026-09-22)
// Radioactive elements may use the mass of a representative isotope.
export interface ChemicalElement { symbol: string; name: string; atomicNumber: number; atomicMass: number; }
export const PERIODIC_TABLE: ChemicalElement[] = [
  {
    "atomicNumber": 1,
    "symbol": "H",
    "name": "Hydrog?ne",
    "atomicMass": 1.008
  },
  {
    "atomicNumber": 2,
    "symbol": "He",
    "name": "H?lium",
    "atomicMass": 4.0026
  },
  {
    "atomicNumber": 3,
    "symbol": "Li",
    "name": "Lithium",
    "atomicMass": 7.0
  },
  {
    "atomicNumber": 4,
    "symbol": "Be",
    "name": "B?ryllium",
    "atomicMass": 9.012183
  },
  {
    "atomicNumber": 5,
    "symbol": "B",
    "name": "Bore",
    "atomicMass": 10.81
  },
  {
    "atomicNumber": 6,
    "symbol": "C",
    "name": "Carbone",
    "atomicMass": 12.011
  },
  {
    "atomicNumber": 7,
    "symbol": "N",
    "name": "Azote",
    "atomicMass": 14.007
  },
  {
    "atomicNumber": 8,
    "symbol": "O",
    "name": "Oxyg?ne",
    "atomicMass": 15.999
  },
  {
    "atomicNumber": 9,
    "symbol": "F",
    "name": "Fluor",
    "atomicMass": 18.99840316
  },
  {
    "atomicNumber": 10,
    "symbol": "Ne",
    "name": "N?on",
    "atomicMass": 20.18
  },
  {
    "atomicNumber": 11,
    "symbol": "Na",
    "name": "Sodium",
    "atomicMass": 22.9897693
  },
  {
    "atomicNumber": 12,
    "symbol": "Mg",
    "name": "Magn?sium",
    "atomicMass": 24.305
  },
  {
    "atomicNumber": 13,
    "symbol": "Al",
    "name": "Aluminium",
    "atomicMass": 26.981538
  },
  {
    "atomicNumber": 14,
    "symbol": "Si",
    "name": "Silicium",
    "atomicMass": 28.085
  },
  {
    "atomicNumber": 15,
    "symbol": "P",
    "name": "Phosphore",
    "atomicMass": 30.973762
  },
  {
    "atomicNumber": 16,
    "symbol": "S",
    "name": "Soufre",
    "atomicMass": 32.07
  },
  {
    "atomicNumber": 17,
    "symbol": "Cl",
    "name": "Chlore",
    "atomicMass": 35.45
  },
  {
    "atomicNumber": 18,
    "symbol": "Ar",
    "name": "Argon",
    "atomicMass": 39.9
  },
  {
    "atomicNumber": 19,
    "symbol": "K",
    "name": "Potassium",
    "atomicMass": 39.0983
  },
  {
    "atomicNumber": 20,
    "symbol": "Ca",
    "name": "Calcium",
    "atomicMass": 40.08
  },
  {
    "atomicNumber": 21,
    "symbol": "Sc",
    "name": "Scandium",
    "atomicMass": 44.95591
  },
  {
    "atomicNumber": 22,
    "symbol": "Ti",
    "name": "Titane",
    "atomicMass": 47.867
  },
  {
    "atomicNumber": 23,
    "symbol": "V",
    "name": "Vanadium",
    "atomicMass": 50.9415
  },
  {
    "atomicNumber": 24,
    "symbol": "Cr",
    "name": "Chrome",
    "atomicMass": 51.996
  },
  {
    "atomicNumber": 25,
    "symbol": "Mn",
    "name": "Mangan?se",
    "atomicMass": 54.93804
  },
  {
    "atomicNumber": 26,
    "symbol": "Fe",
    "name": "Fer",
    "atomicMass": 55.84
  },
  {
    "atomicNumber": 27,
    "symbol": "Co",
    "name": "Cobalt",
    "atomicMass": 58.93319
  },
  {
    "atomicNumber": 28,
    "symbol": "Ni",
    "name": "Nickel",
    "atomicMass": 58.693
  },
  {
    "atomicNumber": 29,
    "symbol": "Cu",
    "name": "Cuivre",
    "atomicMass": 63.55
  },
  {
    "atomicNumber": 30,
    "symbol": "Zn",
    "name": "Zinc",
    "atomicMass": 65.4
  },
  {
    "atomicNumber": 31,
    "symbol": "Ga",
    "name": "Gallium",
    "atomicMass": 69.723
  },
  {
    "atomicNumber": 32,
    "symbol": "Ge",
    "name": "Germanium",
    "atomicMass": 72.63
  },
  {
    "atomicNumber": 33,
    "symbol": "As",
    "name": "Arsenic",
    "atomicMass": 74.92159
  },
  {
    "atomicNumber": 34,
    "symbol": "Se",
    "name": "S?l?nium",
    "atomicMass": 78.97
  },
  {
    "atomicNumber": 35,
    "symbol": "Br",
    "name": "Brome",
    "atomicMass": 79.9
  },
  {
    "atomicNumber": 36,
    "symbol": "Kr",
    "name": "Krypton",
    "atomicMass": 83.8
  },
  {
    "atomicNumber": 37,
    "symbol": "Rb",
    "name": "Rubidium",
    "atomicMass": 85.468
  },
  {
    "atomicNumber": 38,
    "symbol": "Sr",
    "name": "Strontium",
    "atomicMass": 87.62
  },
  {
    "atomicNumber": 39,
    "symbol": "Y",
    "name": "Yttrium",
    "atomicMass": 88.90584
  },
  {
    "atomicNumber": 40,
    "symbol": "Zr",
    "name": "Zirconium",
    "atomicMass": 91.22
  },
  {
    "atomicNumber": 41,
    "symbol": "Nb",
    "name": "Niobium",
    "atomicMass": 92.90637
  },
  {
    "atomicNumber": 42,
    "symbol": "Mo",
    "name": "Molybd?ne",
    "atomicMass": 95.95
  },
  {
    "atomicNumber": 43,
    "symbol": "Tc",
    "name": "Techn?tium",
    "atomicMass": 96.90636
  },
  {
    "atomicNumber": 44,
    "symbol": "Ru",
    "name": "Ruth?nium",
    "atomicMass": 101.1
  },
  {
    "atomicNumber": 45,
    "symbol": "Rh",
    "name": "Rhodium",
    "atomicMass": 102.9055
  },
  {
    "atomicNumber": 46,
    "symbol": "Pd",
    "name": "Palladium",
    "atomicMass": 106.42
  },
  {
    "atomicNumber": 47,
    "symbol": "Ag",
    "name": "Argent",
    "atomicMass": 107.868
  },
  {
    "atomicNumber": 48,
    "symbol": "Cd",
    "name": "Cadmium",
    "atomicMass": 112.41
  },
  {
    "atomicNumber": 49,
    "symbol": "In",
    "name": "Indium",
    "atomicMass": 114.818
  },
  {
    "atomicNumber": 50,
    "symbol": "Sn",
    "name": "?tain",
    "atomicMass": 118.71
  },
  {
    "atomicNumber": 51,
    "symbol": "Sb",
    "name": "Antimoine",
    "atomicMass": 121.76
  },
  {
    "atomicNumber": 52,
    "symbol": "Te",
    "name": "Tellure",
    "atomicMass": 127.6
  },
  {
    "atomicNumber": 53,
    "symbol": "I",
    "name": "Iode",
    "atomicMass": 126.9045
  },
  {
    "atomicNumber": 54,
    "symbol": "Xe",
    "name": "X?non",
    "atomicMass": 131.29
  },
  {
    "atomicNumber": 55,
    "symbol": "Cs",
    "name": "C?sium",
    "atomicMass": 132.905452
  },
  {
    "atomicNumber": 56,
    "symbol": "Ba",
    "name": "Barium",
    "atomicMass": 137.33
  },
  {
    "atomicNumber": 57,
    "symbol": "La",
    "name": "Lanthane",
    "atomicMass": 138.9055
  },
  {
    "atomicNumber": 58,
    "symbol": "Ce",
    "name": "C?rium",
    "atomicMass": 140.116
  },
  {
    "atomicNumber": 59,
    "symbol": "Pr",
    "name": "Pras?odyme",
    "atomicMass": 140.90766
  },
  {
    "atomicNumber": 60,
    "symbol": "Nd",
    "name": "N?odyme",
    "atomicMass": 144.24
  },
  {
    "atomicNumber": 61,
    "symbol": "Pm",
    "name": "Prom?thium",
    "atomicMass": 144.91276
  },
  {
    "atomicNumber": 62,
    "symbol": "Sm",
    "name": "Samarium",
    "atomicMass": 150.4
  },
  {
    "atomicNumber": 63,
    "symbol": "Eu",
    "name": "Europium",
    "atomicMass": 151.964
  },
  {
    "atomicNumber": 64,
    "symbol": "Gd",
    "name": "Gadolinium",
    "atomicMass": 157.25
  },
  {
    "atomicNumber": 65,
    "symbol": "Tb",
    "name": "Terbium",
    "atomicMass": 158.92535
  },
  {
    "atomicNumber": 66,
    "symbol": "Dy",
    "name": "Dysprosium",
    "atomicMass": 162.5
  },
  {
    "atomicNumber": 67,
    "symbol": "Ho",
    "name": "Holmium",
    "atomicMass": 164.93033
  },
  {
    "atomicNumber": 68,
    "symbol": "Er",
    "name": "Erbium",
    "atomicMass": 167.26
  },
  {
    "atomicNumber": 69,
    "symbol": "Tm",
    "name": "Thulium",
    "atomicMass": 168.93422
  },
  {
    "atomicNumber": 70,
    "symbol": "Yb",
    "name": "Ytterbium",
    "atomicMass": 173.05
  },
  {
    "atomicNumber": 71,
    "symbol": "Lu",
    "name": "Lut?cium",
    "atomicMass": 174.9667
  },
  {
    "atomicNumber": 72,
    "symbol": "Hf",
    "name": "Hafnium",
    "atomicMass": 178.49
  },
  {
    "atomicNumber": 73,
    "symbol": "Ta",
    "name": "Tantale",
    "atomicMass": 180.9479
  },
  {
    "atomicNumber": 74,
    "symbol": "W",
    "name": "Tungst?ne",
    "atomicMass": 183.84
  },
  {
    "atomicNumber": 75,
    "symbol": "Re",
    "name": "Rh?nium",
    "atomicMass": 186.207
  },
  {
    "atomicNumber": 76,
    "symbol": "Os",
    "name": "Osmium",
    "atomicMass": 190.2
  },
  {
    "atomicNumber": 77,
    "symbol": "Ir",
    "name": "Iridium",
    "atomicMass": 192.22
  },
  {
    "atomicNumber": 78,
    "symbol": "Pt",
    "name": "Platine",
    "atomicMass": 195.08
  },
  {
    "atomicNumber": 79,
    "symbol": "Au",
    "name": "Or",
    "atomicMass": 196.96657
  },
  {
    "atomicNumber": 80,
    "symbol": "Hg",
    "name": "Mercure",
    "atomicMass": 200.59
  },
  {
    "atomicNumber": 81,
    "symbol": "Tl",
    "name": "Thallium",
    "atomicMass": 204.383
  },
  {
    "atomicNumber": 82,
    "symbol": "Pb",
    "name": "Plomb",
    "atomicMass": 207.0
  },
  {
    "atomicNumber": 83,
    "symbol": "Bi",
    "name": "Bismuth",
    "atomicMass": 208.9804
  },
  {
    "atomicNumber": 84,
    "symbol": "Po",
    "name": "Polonium",
    "atomicMass": 208.98243
  },
  {
    "atomicNumber": 85,
    "symbol": "At",
    "name": "Astate",
    "atomicMass": 209.98715
  },
  {
    "atomicNumber": 86,
    "symbol": "Rn",
    "name": "Radon",
    "atomicMass": 222.01758
  },
  {
    "atomicNumber": 87,
    "symbol": "Fr",
    "name": "Francium",
    "atomicMass": 223.01973
  },
  {
    "atomicNumber": 88,
    "symbol": "Ra",
    "name": "Radium",
    "atomicMass": 226.02541
  },
  {
    "atomicNumber": 89,
    "symbol": "Ac",
    "name": "Actinium",
    "atomicMass": 227.02775
  },
  {
    "atomicNumber": 90,
    "symbol": "Th",
    "name": "Thorium",
    "atomicMass": 232.038
  },
  {
    "atomicNumber": 91,
    "symbol": "Pa",
    "name": "Protactinium",
    "atomicMass": 231.03588
  },
  {
    "atomicNumber": 92,
    "symbol": "U",
    "name": "Uranium",
    "atomicMass": 238.0289
  },
  {
    "atomicNumber": 93,
    "symbol": "Np",
    "name": "Neptunium",
    "atomicMass": 237.048172
  },
  {
    "atomicNumber": 94,
    "symbol": "Pu",
    "name": "Plutonium",
    "atomicMass": 244.0642
  },
  {
    "atomicNumber": 95,
    "symbol": "Am",
    "name": "Am?ricium",
    "atomicMass": 243.06138
  },
  {
    "atomicNumber": 96,
    "symbol": "Cm",
    "name": "Curium",
    "atomicMass": 247.07035
  },
  {
    "atomicNumber": 97,
    "symbol": "Bk",
    "name": "Berk?lium",
    "atomicMass": 247.07031
  },
  {
    "atomicNumber": 98,
    "symbol": "Cf",
    "name": "Californium",
    "atomicMass": 251.07959
  },
  {
    "atomicNumber": 99,
    "symbol": "Es",
    "name": "Einsteinium",
    "atomicMass": 252.083
  },
  {
    "atomicNumber": 100,
    "symbol": "Fm",
    "name": "Fermium",
    "atomicMass": 257.09511
  },
  {
    "atomicNumber": 101,
    "symbol": "Md",
    "name": "Mend?l?vium",
    "atomicMass": 258.09843
  },
  {
    "atomicNumber": 102,
    "symbol": "No",
    "name": "Nob?lium",
    "atomicMass": 259.101
  },
  {
    "atomicNumber": 103,
    "symbol": "Lr",
    "name": "Lawrencium",
    "atomicMass": 266.12
  },
  {
    "atomicNumber": 104,
    "symbol": "Rf",
    "name": "Rutherfordium",
    "atomicMass": 267.122
  },
  {
    "atomicNumber": 105,
    "symbol": "Db",
    "name": "Dubnium",
    "atomicMass": 268.126
  },
  {
    "atomicNumber": 106,
    "symbol": "Sg",
    "name": "Seaborgium",
    "atomicMass": 269.128
  },
  {
    "atomicNumber": 107,
    "symbol": "Bh",
    "name": "Bohrium",
    "atomicMass": 270.133
  },
  {
    "atomicNumber": 108,
    "symbol": "Hs",
    "name": "Hassium",
    "atomicMass": 269.1336
  },
  {
    "atomicNumber": 109,
    "symbol": "Mt",
    "name": "Meitnerium",
    "atomicMass": 277.154
  },
  {
    "atomicNumber": 110,
    "symbol": "Ds",
    "name": "Darmstadtium",
    "atomicMass": 282.166
  },
  {
    "atomicNumber": 111,
    "symbol": "Rg",
    "name": "Roentgenium",
    "atomicMass": 282.169
  },
  {
    "atomicNumber": 112,
    "symbol": "Cn",
    "name": "Copernicium",
    "atomicMass": 286.179
  },
  {
    "atomicNumber": 113,
    "symbol": "Nh",
    "name": "Nihonium",
    "atomicMass": 286.182
  },
  {
    "atomicNumber": 114,
    "symbol": "Fl",
    "name": "Fl?rovium",
    "atomicMass": 290.192
  },
  {
    "atomicNumber": 115,
    "symbol": "Mc",
    "name": "Moscovium",
    "atomicMass": 290.196
  },
  {
    "atomicNumber": 116,
    "symbol": "Lv",
    "name": "Livermorium",
    "atomicMass": 293.205
  },
  {
    "atomicNumber": 117,
    "symbol": "Ts",
    "name": "Tennesse",
    "atomicMass": 294.211
  },
  {
    "atomicNumber": 118,
    "symbol": "Og",
    "name": "Oganesson",
    "atomicMass": 295.216
  }
];
