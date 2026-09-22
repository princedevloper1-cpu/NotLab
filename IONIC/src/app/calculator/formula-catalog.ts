import { FormulaDefinition } from './calculator.models';
export const FORMULAS: FormulaDefinition[] = [
  {
    "id": "speed",
    "subject": "physics",
    "category": "M?canique",
    "name": "Vitesse",
    "display": "v = d / t",
    "expression": "d/t",
    "unit": "m/s",
    "inputs": [
      {
        "id": "d",
        "label": "Distance",
        "unit": "m",
        "nonnegative": true
      },
      {
        "id": "t",
        "label": "Dur?e",
        "unit": "s",
        "positive": true
      }
    ]
  },
  {
    "id": "acceleration",
    "subject": "physics",
    "category": "M?canique",
    "name": "Acc?l?ration",
    "display": "a = ?v / ?t",
    "expression": "v/t",
    "unit": "m/s?",
    "inputs": [
      {
        "id": "v",
        "label": "Variation de vitesse",
        "unit": "m/s"
      },
      {
        "id": "t",
        "label": "Dur?e",
        "unit": "s",
        "positive": true
      }
    ]
  },
  {
    "id": "force",
    "subject": "physics",
    "category": "M?canique",
    "name": "Force",
    "display": "F = m ? a",
    "expression": "m*a",
    "unit": "N",
    "inputs": [
      {
        "id": "m",
        "label": "Masse",
        "unit": "kg",
        "positive": true
      },
      {
        "id": "a",
        "label": "Acc?l?ration",
        "unit": "m/s?"
      }
    ]
  },
  {
    "id": "pressure",
    "subject": "physics",
    "category": "Pression",
    "name": "Pression",
    "display": "P = F / A",
    "expression": "f/a",
    "unit": "Pa",
    "inputs": [
      {
        "id": "f",
        "label": "Force",
        "unit": "N",
        "nonnegative": true
      },
      {
        "id": "a",
        "label": "Surface",
        "unit": "m?",
        "positive": true
      }
    ]
  },
  {
    "id": "kinetic",
    "subject": "physics",
    "category": "?nergie",
    "name": "?nergie cin?tique",
    "display": "Ec = ?mv?",
    "expression": "0.5*m*v^2",
    "unit": "J",
    "inputs": [
      {
        "id": "m",
        "label": "Masse",
        "unit": "kg",
        "positive": true
      },
      {
        "id": "v",
        "label": "Vitesse",
        "unit": "m/s"
      }
    ]
  },
  {
    "id": "potential",
    "subject": "physics",
    "category": "?nergie",
    "name": "?nergie potentielle",
    "display": "Ep = mgh",
    "expression": "m*g*h",
    "unit": "J",
    "inputs": [
      {
        "id": "m",
        "label": "Masse",
        "unit": "kg",
        "positive": true
      },
      {
        "id": "g",
        "label": "Pesanteur",
        "unit": "m/s?",
        "positive": true
      },
      {
        "id": "h",
        "label": "Hauteur",
        "unit": "m"
      }
    ]
  },
  {
    "id": "power",
    "subject": "physics",
    "category": "?nergie",
    "name": "Puissance",
    "display": "P = E / t",
    "expression": "e/t",
    "unit": "W",
    "inputs": [
      {
        "id": "e",
        "label": "?nergie",
        "unit": "J"
      },
      {
        "id": "t",
        "label": "Dur?e",
        "unit": "s",
        "positive": true
      }
    ]
  },
  {
    "id": "ohm",
    "subject": "physics",
    "category": "?lectricit?",
    "name": "Loi d?Ohm",
    "display": "V = R ? I",
    "expression": "r*i",
    "unit": "V",
    "inputs": [
      {
        "id": "r",
        "label": "R?sistance",
        "unit": "?",
        "nonnegative": true
      },
      {
        "id": "i",
        "label": "Courant",
        "unit": "A"
      }
    ]
  },
  {
    "id": "electric-power",
    "subject": "physics",
    "category": "?lectricit?",
    "name": "Puissance ?lectrique",
    "display": "P = V ? I",
    "expression": "v*i",
    "unit": "W",
    "inputs": [
      {
        "id": "v",
        "label": "Tension",
        "unit": "V"
      },
      {
        "id": "i",
        "label": "Courant",
        "unit": "A"
      }
    ]
  },
  {
    "id": "charge",
    "subject": "physics",
    "category": "?lectricit?",
    "name": "Charge ?lectrique",
    "display": "Q = I ? t",
    "expression": "i*t",
    "unit": "C",
    "inputs": [
      {
        "id": "i",
        "label": "Courant",
        "unit": "A"
      },
      {
        "id": "t",
        "label": "Dur?e",
        "unit": "s",
        "positive": true
      }
    ]
  },
  {
    "id": "frequency",
    "subject": "physics",
    "category": "Ondes",
    "name": "Fr?quence",
    "display": "f = 1 / T",
    "expression": "1/t",
    "unit": "Hz",
    "inputs": [
      {
        "id": "t",
        "label": "P?riode",
        "unit": "s",
        "positive": true
      }
    ]
  },
  {
    "id": "wave",
    "subject": "physics",
    "category": "Ondes",
    "name": "Vitesse d?une onde",
    "display": "v = ? ? f",
    "expression": "l*f",
    "unit": "m/s",
    "inputs": [
      {
        "id": "l",
        "label": "Longueur d?onde",
        "unit": "m",
        "positive": true
      },
      {
        "id": "f",
        "label": "Fr?quence",
        "unit": "Hz",
        "positive": true
      }
    ]
  },
  {
    "id": "mass-energy",
    "subject": "physics",
    "category": "?nergie",
    "name": "?quivalence masse-?nergie",
    "display": "E = m ? c?",
    "expression": "m*299792458^2",
    "unit": "J",
    "inputs": [
      {
        "id": "m",
        "label": "Masse",
        "unit": "kg",
        "nonnegative": true
      }
    ],
    "note": "c = 299 792 458 m/s dans le vide."
  },
  {
    "id": "density",
    "subject": "physics",
    "category": "M?canique",
    "name": "Masse volumique",
    "display": "? = m / V",
    "expression": "m/v",
    "unit": "kg/m?",
    "inputs": [
      {
        "id": "m",
        "label": "Masse",
        "unit": "kg",
        "positive": true
      },
      {
        "id": "v",
        "label": "Volume",
        "unit": "m?",
        "positive": true
      }
    ]
  },
  {
    "id": "heat",
    "subject": "physics",
    "category": "Thermodynamique",
    "name": "Chaleur sensible",
    "display": "Q = m ? c ? ?T",
    "expression": "m*c*t",
    "unit": "J",
    "inputs": [
      {
        "id": "m",
        "label": "Masse",
        "unit": "kg",
        "positive": true
      },
      {
        "id": "c",
        "label": "Capacit? thermique massique",
        "unit": "J/(kg?K)",
        "positive": true
      },
      {
        "id": "t",
        "label": "?cart de temp?rature",
        "unit": "?K"
      }
    ]
  },
  {
    "id": "amount",
    "subject": "chemistry",
    "category": "Formules",
    "name": "Quantit? de mati?re",
    "display": "n = m / M",
    "expression": "m/molar",
    "unit": "mol",
    "inputs": [
      {
        "id": "m",
        "label": "Masse",
        "unit": "g",
        "nonnegative": true
      },
      {
        "id": "molar",
        "label": "Masse molaire",
        "unit": "g/mol",
        "positive": true
      }
    ]
  },
  {
    "id": "concentration",
    "subject": "chemistry",
    "category": "Concentration",
    "name": "Concentration molaire",
    "display": "C = n / V",
    "expression": "n/v",
    "unit": "mol/L",
    "inputs": [
      {
        "id": "n",
        "label": "Quantit? de mati?re",
        "unit": "mol",
        "nonnegative": true
      },
      {
        "id": "v",
        "label": "Volume",
        "unit": "L",
        "positive": true
      }
    ]
  },
  {
    "id": "mass-concentration",
    "subject": "chemistry",
    "category": "Concentration",
    "name": "Concentration massique",
    "display": "Cm = m / V",
    "expression": "m/v",
    "unit": "g/L",
    "inputs": [
      {
        "id": "m",
        "label": "Masse",
        "unit": "g",
        "nonnegative": true
      },
      {
        "id": "v",
        "label": "Volume",
        "unit": "L",
        "positive": true
      }
    ]
  },
  {
    "id": "dilution",
    "subject": "chemistry",
    "category": "Dilution",
    "name": "Volume ? pr?lever",
    "display": "C?V? = C?V? ? V? = C?V? / C?",
    "expression": "c2*v2/c1",
    "unit": "L",
    "inputs": [
      {
        "id": "c1",
        "label": "Concentration initiale",
        "unit": "mol/L",
        "positive": true
      },
      {
        "id": "c2",
        "label": "Concentration finale",
        "unit": "mol/L",
        "nonnegative": true
      },
      {
        "id": "v2",
        "label": "Volume final",
        "unit": "L",
        "positive": true
      }
    ]
  },
  {
    "id": "gas",
    "subject": "chemistry",
    "category": "Gaz",
    "name": "Volume d?un gaz parfait",
    "display": "PV = nRT ? V = nRT / P",
    "expression": "n*8.31446261815324*t/p",
    "unit": "m?",
    "inputs": [
      {
        "id": "n",
        "label": "Quantit? de mati?re",
        "unit": "mol",
        "positive": true
      },
      {
        "id": "t",
        "label": "Temp?rature absolue",
        "unit": "K",
        "positive": true
      },
      {
        "id": "p",
        "label": "Pression absolue",
        "unit": "Pa",
        "positive": true
      }
    ],
    "note": "Mod?le du gaz parfait ; R = 8,31446261815324 J/(mol?K)."
  },
  {
    "id": "chemical-density",
    "subject": "chemistry",
    "category": "Formules",
    "name": "Masse volumique",
    "display": "? = m / V",
    "expression": "m/v",
    "unit": "kg/m?",
    "inputs": [
      {
        "id": "m",
        "label": "Masse",
        "unit": "kg",
        "positive": true
      },
      {
        "id": "v",
        "label": "Volume",
        "unit": "m?",
        "positive": true
      }
    ]
  },
  {
    "id": "ph",
    "subject": "chemistry",
    "category": "pH",
    "name": "pH d?une solution",
    "display": "pH = ?log[H?]",
    "expression": "-log(h)",
    "unit": "",
    "inputs": [
      {
        "id": "h",
        "label": "Concentration en H?",
        "unit": "mol/L",
        "positive": true
      }
    ],
    "note": "Approximation id?ale : activit? assimil?e ? la concentration en mol/L."
  },
  {
    "id": "percentage",
    "subject": "maths",
    "category": "Proportions",
    "name": "Pourcentage",
    "display": "Valeur ? taux / 100",
    "expression": "v*p/100",
    "unit": "",
    "inputs": [
      {
        "id": "v",
        "label": "Valeur",
        "unit": ""
      },
      {
        "id": "p",
        "label": "Pourcentage",
        "unit": ""
      }
    ]
  },
  {
    "id": "proportion",
    "subject": "maths",
    "category": "Proportions",
    "name": "R?gle de trois",
    "display": "a / b = c / x ? x = b ? c / a",
    "expression": "b*c/a",
    "unit": "",
    "inputs": [
      {
        "id": "a",
        "label": "a",
        "unit": ""
      },
      {
        "id": "b",
        "label": "b",
        "unit": ""
      },
      {
        "id": "c",
        "label": "c",
        "unit": ""
      }
    ]
  },
  {
    "id": "quadratic",
    "subject": "maths",
    "category": "Alg?bre",
    "name": "?quation du second degr?",
    "display": "ax? + bx + c = 0",
    "expression": "(-b+sqrt(b^2-4*a*c))/(2*a)",
    "unit": "",
    "inputs": [
      {
        "id": "a",
        "label": "a (non nul)",
        "unit": ""
      },
      {
        "id": "b",
        "label": "b",
        "unit": ""
      },
      {
        "id": "c",
        "label": "c",
        "unit": ""
      }
    ]
  },
  {
    "id": "pythagoras",
    "subject": "maths",
    "category": "G?om?trie",
    "name": "Th?or?me de Pythagore",
    "display": "c = ?(a? + b?)",
    "expression": "sqrt(a^2+b^2)",
    "unit": "m",
    "inputs": [
      {
        "id": "a",
        "label": "C?t? a",
        "unit": "m",
        "positive": true
      },
      {
        "id": "b",
        "label": "C?t? b",
        "unit": "m",
        "positive": true
      }
    ]
  },
  {
    "id": "rectangle-area",
    "subject": "maths",
    "category": "Surface",
    "name": "Aire du rectangle",
    "display": "A = L ? l",
    "expression": "a*b",
    "unit": "m?",
    "inputs": [
      {
        "id": "a",
        "label": "Longueur",
        "unit": "m",
        "positive": true
      },
      {
        "id": "b",
        "label": "Largeur",
        "unit": "m",
        "positive": true
      }
    ]
  },
  {
    "id": "circle-area",
    "subject": "maths",
    "category": "Surface",
    "name": "Aire du disque",
    "display": "A = ?r?",
    "expression": "pi*r^2",
    "unit": "m?",
    "inputs": [
      {
        "id": "r",
        "label": "Rayon",
        "unit": "m",
        "positive": true
      }
    ]
  },
  {
    "id": "triangle-area",
    "subject": "maths",
    "category": "Surface",
    "name": "Aire du triangle",
    "display": "A = b ? h / 2",
    "expression": "b*h/2",
    "unit": "m?",
    "inputs": [
      {
        "id": "b",
        "label": "Base",
        "unit": "m",
        "positive": true
      },
      {
        "id": "h",
        "label": "Hauteur",
        "unit": "m",
        "positive": true
      }
    ]
  },
  {
    "id": "rectangle-perimeter",
    "subject": "maths",
    "category": "P?rim?tre",
    "name": "P?rim?tre du rectangle",
    "display": "P = 2(L + l)",
    "expression": "2*(a+b)",
    "unit": "m",
    "inputs": [
      {
        "id": "a",
        "label": "Longueur",
        "unit": "m",
        "positive": true
      },
      {
        "id": "b",
        "label": "Largeur",
        "unit": "m",
        "positive": true
      }
    ]
  },
  {
    "id": "circle-perimeter",
    "subject": "maths",
    "category": "P?rim?tre",
    "name": "Circonf?rence",
    "display": "P = 2?r",
    "expression": "2*pi*r",
    "unit": "m",
    "inputs": [
      {
        "id": "r",
        "label": "Rayon",
        "unit": "m",
        "positive": true
      }
    ]
  },
  {
    "id": "box-volume",
    "subject": "maths",
    "category": "Volume",
    "name": "Volume du pav?",
    "display": "V = L ? l ? h",
    "expression": "a*b*h",
    "unit": "m?",
    "inputs": [
      {
        "id": "a",
        "label": "Longueur",
        "unit": "m",
        "positive": true
      },
      {
        "id": "b",
        "label": "Largeur",
        "unit": "m",
        "positive": true
      },
      {
        "id": "h",
        "label": "Hauteur",
        "unit": "m",
        "positive": true
      }
    ]
  },
  {
    "id": "sphere-volume",
    "subject": "maths",
    "category": "Volume",
    "name": "Volume de la sph?re",
    "display": "V = 4?r? / 3",
    "expression": "4*pi*r^3/3",
    "unit": "m?",
    "inputs": [
      {
        "id": "r",
        "label": "Rayon",
        "unit": "m",
        "positive": true
      }
    ]
  },
  {
    "id": "cylinder-volume",
    "subject": "maths",
    "category": "Volume",
    "name": "Volume du cylindre",
    "display": "V = ?r?h",
    "expression": "pi*r^2*h",
    "unit": "m?",
    "inputs": [
      {
        "id": "r",
        "label": "Rayon",
        "unit": "m",
        "positive": true
      },
      {
        "id": "h",
        "label": "Hauteur",
        "unit": "m",
        "positive": true
      }
    ]
  }
];
