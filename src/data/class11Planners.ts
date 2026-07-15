import { Subject, Chapter, Lecture, DPP, StudyDatabase, PlannerTask } from "../types";

// Metadata for programmatic expansion
interface ChapterMeta {
  name: string;
  lectureCount: number;
  startDate: string;
  topics: string[];
}

interface SubjectMeta {
  id: string;
  name: string;
  color: string;
  teacher: string;
  chapters: ChapterMeta[];
}

const subjectsMetadata: SubjectMeta[] = [
  {
    id: "subj-math",
    name: "Mathematics",
    color: "#3b82f6", // Elegant Blue
    teacher: "Sachin Jakhar Sir",
    chapters: [
      {
        name: "Sets",
        lectureCount: 7,
        startDate: "2026-04-13",
        topics: [
          "Types of Sets",
          "Operations on Sets (Basic)",
          "Operations on Sets (Properties)",
          "Algebra of sets",
          "Algebra of sets & De-Morgan's laws",
          "Practical Problems on Union & Intersection 1",
          "Practical Problems on Union & Intersection 2"
        ]
      },
      {
        name: "Basic Mathematics",
        lectureCount: 20,
        startDate: "2026-04-29",
        topics: [
          "Number system introduction",
          "Properties of prime numbers & divisibility",
          "Rationalization & Surds",
          "Intervals & Inequalities",
          "Quadratic expressions base",
          "Number system practice",
          "Wavy Curve Method - Type 1",
          "Wavy Curve Method - Type 2",
          "Wavy Curve Method - Advanced",
          "Wavy Curve Method - Rational Inequalities",
          "Logarithm - Base & definition",
          "Logarithm - Properties & Laws",
          "Logarithm - Advanced equations",
          "Logarithm - Inequalities",
          "Logarithmic system graphs",
          "Modulus Function - Intro & Definition",
          "Modulus Function - Graph & Range",
          "Modulus Function - Equations",
          "Modulus Function - Inequalities 1",
          "Modulus Function - Inequalities 2"
        ]
      },
      {
        name: "Quadratic Equations",
        lectureCount: 9,
        startDate: "2026-06-05",
        topics: [
          "Introduction & Nature of Roots",
          "Relation between roots & coefficients",
          "Common roots condition",
          "Theory of equation (Higher degree)",
          "Theory of equation & Symmetric functions",
          "Graph of quadratic ax^2+bx+c",
          "Location of roots 1",
          "Location of roots 2",
          "Descartes rule of signs & Range of quadratic"
        ]
      },
      {
        name: "Sequence and Series",
        lectureCount: 9,
        startDate: "2026-06-16",
        topics: [
          "Arithmetic Progression (AP) - General",
          "Arithmetic Progression (AP) - Sum & Properties",
          "Geometric Progression (GP) - General & Sum",
          "Harmonic Progression (HP)",
          "Arithmetic, Geometric & Harmonic Means",
          "Properties of Means & Inequalities",
          "Arithmetical Geometric Series (AGS)",
          "Summation Method of difference",
          "Telescopic series & Special series summation"
        ]
      },
      {
        name: "Trigonometric Functions",
        lectureCount: 11,
        startDate: "2026-06-29",
        topics: [
          "Angles measurement & Acute angles",
          "Basic identities & Sign convention",
          "Domain/Range of Trigonometric Functions 1",
          "Domain/Range of Trigonometric Functions 2",
          "Allied Angles & Sum/Difference formulae",
          "Multiple & Submultiple Angles 1",
          "Multiple & Submultiple Angles 2",
          "Transformation Formulae & Product-to-Sum",
          "Maximum & Minimum values of Trig expressions",
          "Sum of sine & cosine series of angles in AP",
          "Advanced Trigonometric identities & problems"
        ]
      },
      {
        name: "Trigonometric Equation",
        lectureCount: 8,
        startDate: "2026-07-16",
        topics: [
          "General solutions of sin, cos, tan",
          "General solutions of squared equations",
          "Type 1: Solving by factorization",
          "Type 2: Equations of form a*cos+b*sin=c",
          "Type 3: Using transformation formulae",
          "Type 4: Solving by change of variable",
          "Type 5: System of simultaneous equations",
          "Type 6: Boundary value problems"
        ]
      },
      {
        name: "Relation Function",
        lectureCount: 7,
        startDate: "2026-07-30",
        topics: [
          "Cartesian Products of Sets",
          "Relation - Definition, Domain, Range",
          "Types of relations (Reflexive, Symmetric, Transitive)",
          "Equivalence Relation",
          "Function as a special relation",
          "Types of functions (One-one, Many-one)",
          "Types of functions (Onto, Into)"
        ]
      },
      {
        name: "Permutations and Combinations",
        lectureCount: 10,
        startDate: "2026-08-12",
        topics: [
          "Fundamental Principle of Counting",
          "Factorial notation & Permutation",
          "Permutations of objects not all distinct",
          "Circular Permutations",
          "Combinations - Selection of distinct objects",
          "Combinations - Selection of identical objects",
          "Divisors of a composite number",
          "Exponent of prime p in n!",
          "Division & distribution into groups 1",
          "Derangements & De-arrangement theorem"
        ]
      },
      {
        name: "Binomial theorem",
        lectureCount: 10,
        startDate: "2026-08-31",
        topics: [
          "Binomial expansion for positive integer index",
          "General term & Middle terms",
          "Numerically greatest term 1",
          "Numerically greatest term 2",
          "Properties of Binomial Coefficients 1",
          "Properties of Binomial Coefficients 2",
          "Summation of series involving coefficients",
          "Multinomial Theorem",
          "Binomial Theorem for any index 1",
          "Binomial Theorem for any index 2"
        ]
      },
      {
        name: "Straight Lines",
        lectureCount: 13,
        startDate: "2026-09-17",
        topics: [
          "Distance & Section formulae",
          "Centroid, Incentre, Orthocentre, Circumcentre",
          "Area of triangle & Locus concept",
          "Slope of line & angle between lines",
          "Forms of equation of line (Point-slope, Two-point)",
          "Forms of equation of line (Slope-intercept, Intercept, Normal)",
          "Distance of point from line & distance between parallel lines",
          "Family of Straight lines passing through intersection",
          "Angle bisectors of two lines (Acute/Obtuse)",
          "Position of point w.r.t line",
          "Concurrent lines condition",
          "Homogenization of equations",
          "Pair of Straight lines"
        ]
      },
      {
        name: "Circles",
        lectureCount: 10,
        startDate: "2026-10-12",
        topics: [
          "Standard, Central & General equations",
          "Diameter form & Parametric equations",
          "Intercepts on axes & Position of point w.r.t circle",
          "Intersection of line & circle (Tangent condition)",
          "Equations of tangent in slope, point, parametric form",
          "Normal to circle & Chord of contact",
          "Length of tangent & Power of point",
          "Common tangents to two circles",
          "Orthogonal circles condition",
          "Radical axis & Radical centre"
        ]
      },
      {
        name: "Conic Sections: Parabola",
        lectureCount: 9,
        startDate: "2026-10-29",
        topics: [
          "Conic sections intro & standard Parabola equations",
          "Focal distance, Focal chord & Parametric form",
          "General equation of parabola & shifting",
          "Line & Parabola interaction (Tangent condition)",
          "Equations of tangent in different forms",
          "Equations of normal & co-normal points",
          "Chord of contact & chord with given mid-point",
          "Pair of tangents & Director circle",
          "Properties of parabola & reflection property"
        ]
      },
      {
        name: "Conic Sections: Ellipse",
        lectureCount: 7,
        startDate: "2026-11-19",
        topics: [
          "Standard equation, eccentricity & auxiliary circle",
          "Focal properties & parametric coordinates",
          "Intersection of line & ellipse & Tangent equations",
          "Equations of normal in different forms",
          "Chord of contact & chord with given mid-point",
          "Director circle & properties of ellipse",
          "Advanced geometric properties"
        ]
      },
      {
        name: "Conic Sections: Hyperbola",
        lectureCount: 5,
        startDate: "2026-12-02",
        topics: [
          "Standard equation, eccentricity & conjugate hyperbola",
          "Focal properties & parametric form",
          "Tangent & Normal equations",
          "Asymptotes of hyperbola",
          "Rectangular hyperbola & properties"
        ]
      },
      {
        name: "Complex Number",
        lectureCount: 10,
        startDate: "2026-12-10",
        topics: [
          "Imaginary unit & Algebraic properties",
          "Argand plane, Modulus & Conjugate",
          "Polar & Euler representation of complex",
          "De Moivre's Theorem & applications",
          "Cube roots of unity & properties",
          "nth roots of unity",
          "Geometry of complex numbers - straight lines",
          "Geometry of complex numbers - circles",
          "Triangle inequalities of complex",
          "Advanced JEE questions practice"
        ]
      },
      {
        name: "Limits and Derivatives",
        lectureCount: 3,
        startDate: "2026-12-29",
        topics: [
          "Limit definition & indeterminate forms",
          "Standard limits formula & L'Hopital rule",
          "First principle of Derivatives"
        ]
      },
      {
        name: "Statistics",
        lectureCount: 4,
        startDate: "2027-01-04",
        topics: [
          "Data presentation & Cumulative frequency",
          "Mean, Median & Mode for grouped data",
          "Measures of dispersion: Range & Mean deviation",
          "Variance & Standard deviation"
        ]
      },
      {
        name: "Probability",
        lectureCount: 2,
        startDate: "2027-01-08",
        topics: [
          "Random experiments, events & Algebra of events",
          "Classical & Axiomatic approaches to probability"
        ]
      },
      {
        name: "Introduction to Three Dimensional Geometry",
        lectureCount: 2,
        startDate: "2027-01-11",
        topics: [
          "Coordinate planes, octants & coordinates of point",
          "Distance formula & Section formula in 3D"
        ]
      },
      {
        name: "Linear Inequalities",
        lectureCount: 2,
        startDate: "2027-01-13",
        topics: [
          "Solving linear inequalities in one variable",
          "Graphical solution of inequalities in two variables"
        ]
      },
      {
        name: "Solution of Triangle",
        lectureCount: 2,
        startDate: "2027-01-16",
        topics: [
          "Sine rule, Cosine rule, Projection formulae",
          "Area, Incircle, Circumcircle & Ex-circles relations"
        ]
      }
    ]
  },
  {
    id: "subj-phys",
    name: "Physics",
    color: "#eab308", // Golden Yellow
    teacher: "Rajwant Singh Sir",
    chapters: [
      {
        name: "Units and Measurements",
        lectureCount: 13,
        startDate: "2026-04-13",
        topics: [
          "Introduction to Physical World & Quantities",
          "Fundamental & Derived units & System of Units",
          "Dimensions of physical quantities definition",
          "Dimensional Constants & Dimensional Variables",
          "Non-dimensional Constants & Variables",
          "Dimensional Analysis and its Applications 1",
          "Dimensional Analysis and its Applications 2",
          "Significant Figures & Rounding off rules",
          "Errors in Measurement (Absolute, Relative, Percent)",
          "Principle of Homogeneity & dimensions checking",
          "Vernier Caliper & Screw Gauge principles",
          "Limitations of Dimensional Analysis 1",
          "Limitations of Dimensional Analysis 2"
        ]
      },
      {
        name: "Mathematical Tools",
        lectureCount: 12,
        startDate: "2026-05-12",
        topics: [
          "Number system & Series (AP/GP)",
          "Basic Trigonometry (Angles & Quadrants)",
          "Quadratic Equations & Binomial Approximation",
          "Logarithm properties & algebraic identities",
          "Slope of a line, Coordinate Geometry & Graphs",
          "Differentiation - Definition & Rates of Change",
          "Differentiation - Formulas & Chain Rule",
          "Maxima & Minima applications in Physics",
          "Integration - Concept of area under curve",
          "Integration - Basic Formulas & Indefinite",
          "Integration - Definite integrals",
          "Vector Algebra Intro (Scalars vs Vectors)"
        ]
      },
      {
        name: "Motion in a Straight Line",
        lectureCount: 16,
        startDate: "2026-06-03",
        topics: [
          "Frame of reference, Position & displacement vector",
          "Distance, speed & velocity (Instantaneous & Average)",
          "Acceleration (Instantaneous & Average)",
          "Unaccelerated motion (Constant velocity problems)",
          "Uniformly accelerated motion - Equations of motion",
          "Derivation of equations of motion (Graphical/Calculus)",
          "Motion under gravity (Vertical projection upward/downward)",
          "Motion under gravity - Galileo's law of odd numbers",
          "Graphs in 1D (x-t, v-t, a-t charts interpretation)",
          "Interconversion of graphs (x-t to v-t, etc.)",
          "Variable acceleration cases (Calculus approach)",
          "Relative velocity in 1D",
          "Relative projection under gravity",
          "Stopping distance & Reaction time",
          "Multi-stage motion problems 1",
          "Multi-stage motion problems 2"
        ]
      },
      {
        name: "Motion in a Plane",
        lectureCount: 17,
        startDate: "2026-06-24",
        topics: [
          "Scalars & Vectors - Components & representation",
          "Vector Addition - Triangle & Parallelogram law",
          "Vector Multiplication - Dot & Cross product",
          "Kinematics in 2D - Position, velocity, acceleration",
          "Projectile Motion - Ground to ground projection",
          "Time of flight, Maximum height & Horizontal Range",
          "Equation of trajectory of projectile",
          "Projection from a height (Horizontal projection)",
          "Projection from a height (Projection at an angle)",
          "Relative velocity in 2D (Rain-umbrella problems)",
          "Relative velocity in 2D (River-boat problems)",
          "Tangential & Normal acceleration",
          "Radius of curvature of trajectory",
          "Projectile motion on an inclined plane 1",
          "Projectile motion on an inclined plane 2",
          "Wind-projectile interaction cases",
          "Advanced 2D kinematics problems"
        ]
      },
      {
        name: "Laws of Motion + Friction",
        lectureCount: 17,
        startDate: "2026-07-21",
        topics: [
          "Concept of Force & Inertia (Newton's 1st Law)",
          "Momentum & Newton's 2nd Law",
          "Newton's 3rd Law & Action-Reaction",
          "Free Body Diagrams (FBD) drawing rules",
          "Apparent weight in elevators",
          "Masses in contact & connected motion",
          "Pulley-block systems (ideal pulleys)",
          "Constraint relations (string constraints)",
          "Constraint relations (wedge constraints)",
          "Inertial & Non-inertial frames of reference",
          "Pseudo force concept & applications",
          "Friction - Origin, static vs kinetic friction",
          "Angle of friction & angle of repose",
          "Blocks on inclined planes with friction",
          "Two block systems (frictional dragging) 1",
          "Two block systems (frictional dragging) 2",
          "Friction in rolling introduction"
        ]
      },
      {
        name: "Circular Motion",
        lectureCount: 10,
        startDate: "2026-08-22",
        topics: [
          "Angular variables (theta, omega, alpha)",
          "Relation between linear & angular variables",
          "Centripetal acceleration & centripetal force",
          "Conical pendulum dynamics",
          "Circular motion on a horizontal turn (road friction)",
          "Banking of Roads (frictionless & with friction)",
          "Death well & centrifugal force frame",
          "Vertical circular motion - Critical conditions",
          "Vertical circular motion - Tension calculations",
          "Non-uniform circular motion dynamics"
        ]
      },
      {
        name: "Work, Energy and Power",
        lectureCount: 12,
        startDate: "2026-09-11",
        topics: [
          "Work done by constant & variable force",
          "Graphical area calculation of work",
          "Kinetic Energy & Work-Energy Theorem",
          "Conservative & Non-conservative forces",
          "Potential Energy concept (U = -grad W)",
          "Gravitational & Elastic potential energy",
          "Conservation of Mechanical Energy",
          "Work done by friction on inclined planes",
          "Spring-mass system dynamics & elongation",
          "Power (Instantaneous & Average)",
          "Efficiency of motors & water pumps",
          "JEE Advanced work-energy challenge problems"
        ]
      },
      {
        name: "Centre of Mass & System of Particles",
        lectureCount: 15,
        startDate: "2026-10-03",
        topics: [
          "Introduction to COM & discrete systems",
          "COM for two-particle systems",
          "COM of continuous bodies (Rod, Ring, Disc)",
          "COM of composite & symmetric bodies",
          "COM of cavity cases",
          "Motion of COM & net external force effect",
          "Conservation of Linear Momentum",
          "Impulse-Momentum Principle",
          "Head-on Elastic Collisions",
          "Inelastic & perfectly inelastic collisions",
          "Coefficient of Restitution (e)",
          "Oblique Collisions (2D collisions)",
          "Loss of KE in collisions",
          "C-Frame (Centre of mass frame calculations)",
          "Spring-block collisions & max compression"
        ]
      },
      {
        name: "Rotational Motion",
        lectureCount: 19,
        startDate: "2026-10-30",
        topics: [
          "Concept of rigid body & pure rotation",
          "Moment of Inertia (MOI) - Definition",
          "Parallel & Perpendicular Axes Theorems",
          "MOI of standard bodies (Ring, Disc, Cylinder, Sphere)",
          "MOI of composite bodies & cavity cases",
          "Torque definition (r x F)",
          "Rotational Equilibrium & couples",
          "Newton's 2nd Law for Rotation (Torque = I * alpha)",
          "Rotational work & Kinetic Energy",
          "Angular Momentum (L = r x p & L = I * w)",
          "Conservation of Angular Momentum",
          "Combined Translational & Rotational Motion (CRTM)",
          "Pure rolling & condition of no slipping",
          "Velocity & acceleration of points on rolling body",
          "Friction in rolling & direction of friction",
          "Rolling on horizontal & inclined planes",
          "Toppling condition of blocks",
          "Collision of bodies with rotating rods",
          "Angular impulse & instantaneous rolling"
        ]
      },
      {
        name: "Gravitation",
        lectureCount: 7,
        startDate: "2026-12-09",
        topics: [
          "Newton's Law of Gravitation & Principle of Superposition",
          "Acceleration due to gravity (g) & variation with altitude",
          "Variation of g with depth & rotation of Earth",
          "Gravitational Field & Gravitational Potential (V)",
          "Escape velocity & Orbital velocity of satellites",
          "Kepler's Laws of Planetary Motion",
          "Energy of satellites & Geostationary satellites"
        ]
      },
      {
        name: "Mechanical Properties of Solids",
        lectureCount: 1,
        startDate: "2026-12-19",
        topics: [
          "Elastic behavior, Stress-Strain curve & Hooke's Law"
        ]
      },
      {
        name: "Mechanical Properties of Fluids",
        lectureCount: 12,
        startDate: "2026-12-23",
        topics: [
          "Fluid pressure, Pascal's Law & Hydraulic lift",
          "Atmospheric pressure & Barometers",
          "Archimedes Principle & Buoyancy force",
          "Fluids in accelerated & rotated containers",
          "Equation of Continuity & Streamline flow",
          "Bernoulli's Theorem & applications (Venturimeter)",
          "Velocity of efflux (Torricelli's Law)",
          "Surface Tension, Cohesive & Adhesive forces",
          "Excess pressure in drops & bubbles",
          "Capillary rise & Jurin's Law",
          "Viscosity, Poiseuille's formula & Stoke's Law",
          "Terminal velocity of spherical bodies"
        ]
      },
      {
        name: "Thermal Properties of Matter",
        lectureCount: 6,
        startDate: "2027-01-08",
        topics: [
          "Temperature scales & Thermal Expansion (Alpha, Beta, Gamma)",
          "Calorimetry, Specific heat & Phase change",
          "Modes of heat transfer: Conduction & Thermal Conductivity",
          "Thermal resistance & composite rods in series/parallel",
          "Radiation - Black body radiation & Prevost's theory",
          "Stefan-Boltzmann Law & Newton's Law of Cooling"
        ]
      },
      {
        name: "Kinetic Theory & Thermodynamics",
        lectureCount: 5,
        startDate: "2027-01-16",
        topics: [
          "Ideal gas laws, Kinetic theory assumptions & Pressure equation",
          "Degrees of freedom & Law of Equipartition of Energy",
          "First Law of Thermodynamics & thermodynamic processes",
          "Indicator diagrams (P-V graphs) & work done calculation",
          "Heat engines, Carnot cycle & second law"
        ]
      },
      {
        name: "Simple Harmonic Motion",
        lectureCount: 6,
        startDate: "2027-01-22",
        topics: [
          "Periodic vs Oscillatory motion & SHM equations",
          "Velocity, Acceleration & Energy in SHM",
          "Spring-block system (Horizontal & Vertical combinations)",
          "Simple Pendulum & angular SHM",
          "Superposition of SHMs (Lissajous figures intro)",
          "Damped & Forced oscillations"
        ]
      },
      {
        name: "Waves",
        lectureCount: 5,
        startDate: "2027-01-30",
        topics: [
          "Wave motion types (Transverse & Longitudinal)",
          "Equation of a progressive wave & wave velocity",
          "Speed of transverse waves on strings",
          "Superposition principle, standing waves & harmonics",
          "Beats & Doppler effect in sound"
        ]
      }
    ]
  },
  {
    id: "subj-phychem",
    name: "Physical Chemistry",
    color: "#a855f7", // Elegant Violet/Purple
    teacher: "Rahul Dudi Sir",
    chapters: [
      {
        name: "Some Basic Concepts of Chemistry",
        lectureCount: 20,
        startDate: "2026-04-14",
        topics: [
          "Nature of Matter & Classification",
          "Properties of Matter & measurement SI units",
          "Uncertainty in Measurement & Significant Figures",
          "Laws of Chemical Combinations 1 (Mass conservation, Constant prop)",
          "Laws of Chemical Combinations 2 (Multiple prop, Reciprocal, Gay-Lussac)",
          "Dalton's Atomic Theory & concept of atom",
          "Atomic Mass & Atomic Mass Unit (amu)",
          "Gram Atomic Mass & Average Atomic Mass",
          "Molecular Mass & Formula Mass",
          "Percentage composition & empirical formula",
          "Molecular formula determination from empirical",
          "Mole Concept definition & Avogadro's number",
          "Vapour density & atomicity relations",
          "Stoichiometry of chemical equations",
          "Limiting Reagent concept & calculations",
          "Concentration Terms: Mass %, Volume %, PPM",
          "Concentration Terms: Mole Fraction & Molarity",
          "Concentration Terms: Molality & Normality",
          "Dilution & mixing of solutions calculations",
          "Eudiometry & gas volume analysis"
        ]
      },
      {
        name: "Structure of Atom",
        lectureCount: 15,
        startDate: "2026-05-25",
        topics: [
          "Subatomic particles discovery (Cathode & Anode rays)",
          "Thomson's & Rutherford's atomic models & alpha scattering",
          "Electromagnetic radiation wave nature & spectrum",
          "Planck's Quantum Theory & Photoelectric Effect",
          "Dual nature of light & Atomic spectra of hydrogen",
          "Bohr's Model of hydrogen atom - Postulates",
          "Radius, velocity & energy derivation in Bohr's orbits",
          "Hydrogen spectrum series (Lyman, Balmer, etc.)",
          "De Broglie's dual nature of matter relationship",
          "Heisenberg's Uncertainty Principle",
          "Quantum Mechanical Model of Atom intro",
          "Schrodinger Wave Equation & Wavefunctions (Psi & Psi^2)",
          "Quantum Numbers (Principal, Azimuthal, Magnetic, Spin)",
          "Shapes of orbitals (s, p, d, f) & Nodes",
          "Rules for filling electrons (Aufbau, Pauli, Hund's)"
        ]
      },
      {
        name: "State of matter",
        lectureCount: 10,
        startDate: "2026-08-11",
        topics: [
          "Intermolecular forces & thermal energy",
          "The Gaseous State variables & Gas Laws (Boyle's, Charles's)",
          "Gas Laws (Gay-Lussac's, Avogadro's) & Ideal Gas Equation",
          "Dalton's Law of Partial Pressures",
          "Graham's Law of Diffusion & Effusion",
          "Kinetic Molecular Theory of Gases postulates",
          "Maxwell-Boltzmann distribution of molecular speeds",
          "Real gases deviation from ideal behavior & compressibility factor Z",
          "Van der Waals Equation of State & critical constants",
          "Liquefaction of gases & Eudiometry"
        ]
      },
      {
        name: "Thermodynamics",
        lectureCount: 13,
        startDate: "2026-09-01",
        topics: [
          "Thermodynamic terms: System, Boundary, Surrounding",
          "Types of systems & state/path functions",
          "Internal Energy, Heat & Work (First Law)",
          "Work of expansion in reversible & irreversible processes",
          "Enthalpy (H) & heat capacity (Cp, Cv relations)",
          "Thermochemistry: Enthalpy changes during reactions",
          "Hess's Law of Constant Heat Summation",
          "Enthalpies of combustion, neutralization, atomization",
          "Spontaneous processes & Entropy (Second Law)",
          "Entropy change in physical & chemical processes",
          "Gibbs Free Energy (G) & Spontaneity criteria",
          "Gibbs-Helmholtz equation & Free Energy change",
          "Third Law of Thermodynamics & Absolute Entropy"
        ]
      },
      {
        name: "Redox Reaction",
        lectureCount: 5,
        startDate: "2026-09-26",
        topics: [
          "Oxidation & reduction concepts (Classical & Electronic)",
          "Oxidation Number rules & calculations",
          "Balancing redox equations (Ion-electron method)",
          "Balancing redox equations (Oxidation number method)",
          "Equivalent weight of oxidant/reductant & n-factor"
        ]
      },
      {
        name: "Chemical Equilibrium",
        lectureCount: 8,
        startDate: "2026-10-06",
        topics: [
          "Reversible reactions & state of chemical equilibrium",
          "Law of Mass Action & Equilibrium constant (Kc, Kp)",
          "Relationship between Kp and Kc & units",
          "Characteristics of equilibrium constant & reaction quotient Qc",
          "Factors affecting equilibrium: Le Chatelier's Principle 1",
          "Factors affecting equilibrium: Le Chatelier's Principle 2",
          "Vapour density method for degree of dissociation",
          "Relationship between free energy (G) & equilibrium constant"
        ]
      },
      {
        name: "Ionic Equilibrium",
        lectureCount: 7,
        startDate: "2026-10-23",
        topics: [
          "Electrolytes (Strong & Weak) & Ostwald's Dilution Law",
          "Acids & Bases theories (Arrhenius, Bronsted-Lowry, Lewis)",
          "Ionic product of water (Kw) & pH scale",
          "Common Ion Effect & hydrolysis of salts",
          "Buffer Solutions (Acidic & Basic) & Henderson's equation",
          "Acid-Base indicators & titration curves",
          "Solubility Product (Ksp) & Common Ion Effect on solubility"
        ]
      }
    ]
  },
  {
    id: "subj-orgchem",
    name: "Organic Chemistry",
    color: "#ec4899", // Magenta/Pink
    teacher: "Pankaj Sijariya Sir",
    chapters: [
      {
        name: "Some Basic principles and Techniques (IUPAC Naming)",
        lectureCount: 10,
        startDate: "2026-11-03",
        topics: [
          "Tetravalency of carbon, shapes of organic molecules & hybridization",
          "Classification of organic compounds based on functional groups",
          "Homologous series & structural representation of organic molecules",
          "Nomenclature rules: IUPAC of straight & branched alkanes",
          "IUPAC nomenclature of alkenes & alkynes",
          "IUPAC of compounds with mono-functional groups",
          "IUPAC of poly-functional compounds",
          "IUPAC nomenclature of aromatic compounds",
          "IUPAC of bicyclic & spiro compounds",
          "Common & trivial system names of organic compounds"
        ]
      },
      {
        name: "Some Basic principles and Techniques (GOC)",
        lectureCount: 16,
        startDate: "2026-11-28",
        topics: [
          "Covalent bond fission: Homolytic & Heterolytic",
          "Reaction Intermediates: Carbocations, Carbanions, Free radicals",
          "Electronic Displacements: Inductive Effect (+I and -I)",
          "Applications of Inductive Effect (Stability of intermediates)",
          "Electromeric effect & Resonance concept",
          "Resonating structures drawing rules & stability criteria",
          "Mesomeric effect (+M and -M) & resonance energy",
          "Hyperconjugation effect & applications in alkenes",
          "Aromaticity, Anti-aromaticity & Non-aromaticity (Huckel's Rule)",
          "Acidic Strength of organic acids & carboxylic acids",
          "Basic Strength of amines & organic bases",
          "Tautomerism: Keto-Enol isomerism mechanisms",
          "Electrophiles & Nucleophiles classification",
          "Types of organic reactions (Substitution, Addition, Elimination)",
          "Purification methods: Sublimation, Distillation, Chromatography",
          "Qualitative & Quantitative analysis of elements in organic compounds"
        ]
      },
      {
        name: "Some Basic principles and Techniques (Isomerism)",
        lectureCount: 11,
        startDate: "2026-12-28",
        topics: [
          "Isomerism classification: Structural vs Stereo",
          "Chain, Position, Functional isomerism",
          "Metamerism & Ring-chain isomerism",
          "Stereoisomerism: Geometrical Isomerism in alkenes (cis/trans, E/Z)",
          "Geometrical Isomerism in cyclic systems & calculation",
          "Conformational Isomerism: Newman & Sawhorse of ethane/butane",
          "Conformations of cyclohexane & stability of chair form",
          "Optical Isomerism: Chirality, asymmetric carbon & enantiomers",
          "Optical rotation, Polarimeter & Specific rotation",
          "Diastereomers, Meso compounds & Racemic mixtures",
          "Calculation of number of optical isomers"
        ]
      },
      {
        name: "Hydrocarbon",
        lectureCount: 9,
        startDate: "2027-01-13",
        topics: [
          "Alkanes: Preparation methods (Wurtz, Decarboxylation)",
          "Alkanes: Chemical properties (Free radical halogenation)",
          "Alkenes: Preparation by elimination reactions",
          "Alkenes: Electrophilic addition reactions (Markovnikov's rule)",
          "Alkenes: Anti-Markovnikov's addition & Peroxide effect",
          "Alkenes: Ozonolysis & oxidation reactions",
          "Alkynes: Preparation & acidic character of terminal alkynes",
          "Alkynes: Addition of hydrogen, halogens, water & polymerization",
          "Benzene: Structure, aromaticity & electrophilic substitution (nitration, Friedel-Crafts)"
        ]
      },
      {
        name: "Purification and Analysis of Organic Compound",
        lectureCount: 1,
        startDate: "2027-01-25",
        topics: [
          "Estimation of Carbon, Hydrogen, Nitrogen (Dumas, Kjeldahl methods)"
        ]
      },
      {
        name: "Environmental Chemistry",
        lectureCount: 1,
        startDate: "2027-01-27",
        topics: [
          "Atmospheric pollution (smog, acid rain) & Green Chemistry concepts"
        ]
      }
    ]
  },
  {
    id: "subj-inorgchem",
    name: "Inorganic Chemistry",
    color: "#06b6d4", // Cyan
    teacher: "Kunwar Om Pandey Sir",
    chapters: [
      {
        name: "Classification of Elements and Periodicity in Properties",
        lectureCount: 13,
        startDate: "2026-06-13",
        topics: [
          "History of Periodic Table & Döbereiner's Triads",
          "Newlands' Law, Mendeleev's Periodic Table & Merits",
          "Modern Periodic Law & Long form of periodic table",
          "Nomenclature of elements with Z > 100",
          "Division of elements into s, p, d, f blocks",
          "Periodic properties: Shielding Effect & Effective Nuclear Charge (Zeff)",
          "Atomic radius (Covalent, Ionic, Van der Waals)",
          "Ionization Enthalpy - Definition & trends",
          "Factors affecting Ionization Enthalpy & exceptions",
          "Electron Gain Enthalpy - Trends & factors",
          "Electronegativity - Pauling, Mulliken scales",
          "Factors affecting Electronegativity & periodic trends",
          "Anomalous properties of second-period elements & Oxides character"
        ]
      },
      {
        name: "Chemical Bonding and Molecular Structure",
        lectureCount: 23,
        startDate: "2026-07-03",
        topics: [
          "Kossel-Lewis approach & octet rule limitations",
          "Ionic or Electrovalent Bond & Lattice Energy",
          "Covalent Bond & Lewis structures",
          "Formal Charge calculation & Resonance concept",
          "Polar character of covalent bond & Dipole Moment",
          "Fajan's Rules for polarizing power & polarizability",
          "Valence Shell Electron Pair Repulsion (VSEPR) Theory",
          "VSEPR predictions of geometries of simple molecules",
          "Valence Bond Theory (VBT) & orbital overlap",
          "Hybridisation concept & sp, sp2, sp3 hybridisation",
          "Hybridisation involving d-orbitals (sp3d, sp3d2, dsp2)",
          "Calculating hybridisation of central atoms",
          "Molecular Orbital Theory (MOT) - Postulates",
          "Linear Combination of Atomic Orbitals (LCAO) rules",
          "Bonding & Anti-bonding Molecular Orbitals",
          "Electronic configuration & Bond Order of homonuclear diatomics",
          "Magnetic properties of molecules (O2, N2, etc.) from MOT",
          "Shapes of Molecular Orbitals",
          "Hydrogen bonding - Types (inter & intra-molecular)",
          "Effects of hydrogen bonding on physical properties",
          "Back bonding & Bridge bonding concepts",
          "Bent bonds (banana bonds) in diborane",
          "Advanced coordinate bonding & metallic bonding models"
        ]
      },
      {
        name: "P-block Elements (Group 13 and 14)",
        lectureCount: 5,
        startDate: "2027-01-28",
        topics: [
          "Group 13 elements: Boron family trends",
          "Anomalous behavior of Boron & Borax, Boric acid properties",
          "Group 14 elements: Carbon family trends",
          "Allotropes of Carbon (diamond, graphite, fullerenes)",
          "Silicates, Silicones & Zeolites overview"
        ]
      },
      {
        name: "S-block Element",
        lectureCount: 2,
        startDate: "2027-02-03",
        topics: [
          "Group 1: Alkali metals physical & chemical properties",
          "Group 2: Alkaline earth metals properties & anomalous lithium/beryllium"
        ]
      },
      {
        name: "Hydrogen and its Compound",
        lectureCount: 1,
        startDate: "2027-02-05",
        topics: [
          "Isotopes of hydrogen, heavy water & water hardness removal"
        ]
      }
    ]
  }
];

// Helper to expand metadata programmatically
export function generateArjunaJEEClass11Db(): StudyDatabase {
  const subjects: Subject[] = [];
  const plannerTasks: PlannerTask[] = [];

  subjectsMetadata.forEach((subMeta) => {
    const chapters: Chapter[] = [];
    const lectures: Lecture[] = [];

    subMeta.chapters.forEach((chapMeta, chapIdx) => {
      const chapterId = `chap-${subMeta.id.replace("subj-", "")}-${chapIdx + 1}`;
      
      // Calculate chapter metrics
      chapters.push({
        id: chapterId,
        name: chapMeta.name,
        priority: chapIdx < 3 ? "High" : chapIdx < 7 ? "Medium" : "Low",
        difficulty: chapIdx % 3 === 0 ? "Hard" : chapIdx % 3 === 1 ? "Medium" : "Easy",
        teacher: subMeta.teacher,
        status: "To Do",
        progress: 0,
        expectedTime: chapMeta.lectureCount * 2, // 2 hours per lecture
        actualTime: 0,
        revisionCount: 0,
        mistakeCount: 0,
        confidence: "Low"
      });

      // Generate lectures
      const startDate = new Date(chapMeta.startDate);
      for (let i = 0; i < chapMeta.lectureCount; i++) {
        const lectureId = `lec-${subMeta.id.replace("subj-", "")}-${chapIdx + 1}-${i + 1}`;
        const topic = chapMeta.topics[i] || `${chapMeta.name} - Lecture ${i + 1}`;

        // Calculate lecture schedule date (approx every 2-3 days from start)
        const lecDateObj = new Date(startDate);
        lecDateObj.setDate(startDate.getDate() + i * 2);
        const dateStr = lecDateObj.toISOString().split("T")[0];

        lectures.push({
          id: lectureId,
          name: `Lec ${i + 1}: ${topic}`,
          teacher: subMeta.teacher,
          platform: "PhysicsWallah (Arjuna)",
          duration: 105, // Standard PW lectures are 1 hr 45 min (105 mins)
          watchedPercent: 0,
          playbackSpeed: 1.0,
          lectureLink: "",
          status: "To Do",
          chapterId: chapterId,
          completedDate: "",
          rating: 0,
          bookmarked: false
        });

        // Add to calendar planner (first 10 lectures marked complete as a demo, rest active)
        const isDemoCompleted = subMeta.id === "subj-math" && chapIdx === 0 && i < 3;
        
        // Add a task in planner
        plannerTasks.push({
          id: `plan-${subMeta.id.replace("subj-", "")}-${chapIdx + 1}-${i + 1}`,
          title: `Arjuna ${subMeta.name}: Lec ${i + 1} - ${topic}`,
          subjectId: subMeta.id,
          chapterId: chapterId,
          date: dateStr,
          startTime: "16:00",
          endTime: "17:45",
          priority: "High",
          completed: isDemoCompleted,
          type: "Lecture"
        });
      }
    });

    subjects.push({
      id: subMeta.id,
      name: subMeta.name,
      color: subMeta.color,
      chapters,
      lectures,
      notes: [],
      dpps: []
    });
  });

  // Setup sample profile
  const profile = {
    name: "Arjuna Aspirant",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop",
    bio: "Cracking JEE 2027 with PW Arjuna. Consistency is key.",
    exam: "JEE Main & Advanced",
    targetScore: "99.8 Percentile",
    goals: [
      "Master Class 11 Mechanics and Calculus",
      "Solve and bookmark 100% of DPPs",
      "Revise GOC & Chemical Bonding weekly"
    ],
    examDate: "2027-04-15"
  };

  // Pre-seed 3 demo flashcards for the active subjects
  const flashcards = [
    {
      id: "fc-seeded-1",
      front: "What is the hybridisation & geometry of PCl5?",
      back: "sp3d hybridisation with Trigonal Bipyramidal geometry.",
      subjectId: "subj-phychem",
      chapterId: "chap-phychem-2", // Chemical Bonding
      nextReviewDate: "2026-07-16",
      box: 1
    },
    {
      id: "fc-seeded-2",
      front: "Formula for maximum height (H) of a projectile?",
      back: "H = (u^2 * sin^2(theta)) / (2 * g)",
      subjectId: "subj-phys",
      chapterId: "chap-phys-4", // Motion in a plane
      nextReviewDate: "2026-07-16",
      box: 1
    },
    {
      id: "fc-seeded-3",
      front: "If A and B are symmetric matrices, what is AB - BA?",
      back: "AB - BA is a skew-symmetric matrix.",
      subjectId: "subj-math",
      chapterId: "chap-math-2", // Basic Maths
      nextReviewDate: "2026-07-16",
      box: 1
    }
  ];

  // Pre-seed some demo logs
  const focusLogs = [
    { date: "2026-07-12", durationMinutes: 120 },
    { date: "2026-07-13", durationMinutes: 180 },
    { date: "2026-07-14", durationMinutes: 240 },
    { date: "2026-07-15", durationMinutes: 90 }
  ];

  const habits = [
    { id: "h-1", name: "PW Lectures (Daily)", history: { "2026-07-13": true, "2026-07-14": true, "2026-07-15": true } },
    { id: "h-2", name: "DPP Solving", history: { "2026-07-13": true, "2026-07-14": false, "2026-07-15": true } },
    { id: "h-3", name: "Organic/Maths Revision", history: { "2026-07-13": false, "2026-07-14": true, "2026-07-15": false } }
  ];

  return {
    profile,
    subjects,
    revisions: [],
    planner: { tasks: plannerTasks },
    mistakeBook: [],
    tests: [],
    focusLogs,
    habits,
    resources: [
      {
        id: "res-arjuna-1",
        name: "PW Arjuna JEE Physics DPP Booklet",
        type: "PDF",
        url: "",
        subjectId: "subj-phys",
        notes: "Contains all practice questions for class 11th mechanics."
      },
      {
        id: "res-arjuna-2",
        name: "IUPAC & GOC Quick Revision Sheet",
        type: "Cheat Sheet",
        url: "",
        subjectId: "subj-orgchem",
        notes: "Handwritten summary sheet of electronic effects and naming priority."
      }
    ],
    flashcards,
    streak: {
      current: 5,
      lastActiveDate: "2026-07-15",
      xp: 450,
      level: 1
    },
    settings: {
      theme: "dark",
      language: "English",
      notifications: true,
      dailyXpGoal: 150,
      showAiRecommendation: true
    }
  };
}
