# Howtos

# How-To Guides for Antinature

This section provides practical guides for accomplishing specific tasks with the Antinature framework. Each guide focuses on a particular functionality and provides code snippets, explanations, and specific implementation details.

## Building and Customizing Hamiltonians

### How to Create a Basic Hamiltonian

```python
from antinature.core.hamiltonian import create_hamiltonian

# Create a standard Hamiltonian for a positronium system
positronium = MolecularData.positronium()
hamiltonian = create_hamiltonian(
    positronium,
    include_annihilation=True
)
```

**Implementation Details:**
- **Key Classes/Functions:**
  - `create_hamiltonian(molecule, **kwargs)`: Factory function that returns a `Hamiltonian` object.
  - `Hamiltonian`: Base class for all Hamiltonians in Antinature.
  - `PositroniumHamiltonian`: Specialized subclass for positronium systems.

- **Important Parameters:**
  - `molecule`: A `MolecularData` object containing geometry and particle information.
  - `include_annihilation` (bool): Whether to include annihilation terms (default: False).
  - `annihilation_model` (str): Model for annihilation - 'basic', 'spin-dependent', or 'many-body' (default: 'basic').
  - `include_nuclear` (bool): Whether to include nuclear potentials (default: True).

- **Return Value:**
  - Returns a `Hamiltonian` object with methods:
    - `compute_matrix(basis)`: Computes the Hamiltonian matrix in the given basis.
    - `get_one_body_terms()`: Returns the one-body terms as NumPy arrays.
    - `get_two_body_terms()`: Returns the two-body terms as NumPy arrays.

### How to Add Relativistic Corrections

```python
# Create a Hamiltonian with relativistic corrections
hamiltonian = create_hamiltonian(
    molecule,
    include_relativistic=True,
    relativistic_order='second',  # Options: 'first', 'second'
    include_spin_orbit=True
)
```

**Implementation Details:**
- **Key Classes/Functions:**
  - `RelativisticHamiltonian`: Subclass of `Hamiltonian` that includes relativistic terms.
  - `create_relativistic_correction(order, include_spin_orbit)`: Helper function that creates relativistic correction terms.

- **Important Parameters:**
  - `include_relativistic` (bool): Enables relativistic corrections.
  - `relativistic_order` (str): Order of relativistic corrections - 'first' or 'second'.
  - `include_spin_orbit` (bool): Whether to include spin-orbit coupling (default: False).
  - `use_x2c` (bool): Whether to use the exact 2-component (X2C) method (default: False).

- **Attributes of Returned Hamiltonian:**
  - `rel_correction_terms`: Dictionary of relativistic correction terms.
  - `has_spin_orbit`: Boolean indicating if spin-orbit terms are included.
  - `relativistic_method`: String indicating the method used ('breit-pauli', 'x2c', etc.).

### How to Define Custom Interaction Terms

```python
from antinature.core.hamiltonian import CustomInteractionTerm

# Define a custom interaction (e.g., for an external field)
def custom_field(r1, r2):
    # Custom field interaction between particles at r1 and r2
    field_strength = 0.05  # atomic units
    return field_strength * np.dot(r1 - r2, [0, 0, 1])  # Field in z-direction

# Add to Hamiltonian
custom_term = CustomInteractionTerm(custom_field, particles=['e-', 'e+'])
hamiltonian = create_hamiltonian(
    molecule,
    custom_terms=[custom_term]
)
```

**Implementation Details:**
- **Key Classes/Functions:**
  - `CustomInteractionTerm`: Class for defining custom interaction terms.
  - `InteractionRegistry`: Internal class that manages all interaction terms.

- **CustomInteractionTerm Parameters:**
  - `interaction_function`: A function that takes particle coordinates and returns energy.
  - `particles` (list): Types of particles this interaction applies to (e.g., ['e-', 'e+', 'p+']).
  - `name` (str, optional): Name for the interaction term.
  - `is_one_body` (bool): Whether this is a one-body term (default: False).
  - `integral_method` (str): Method to use for integral evaluation (default: 'grid').

- **Methods on CustomInteractionTerm:**
  - `evaluate(r1, r2)`: Evaluates the interaction at given coordinates.
  - `get_integral(basis_i, basis_j, basis_k, basis_l)`: Computes matrix elements.
  - `to_matrix(basis)`: Converts the term to a matrix representation in given basis.

## Working with Basis Sets

### How to Select Appropriate Basis Sets

```python
from antinature.core.basis import get_basis_options, create_basis

# List available basis sets
basis_options = get_basis_options()
print("Electron basis options:", basis_options['electron'])
print("Positron basis options:", basis_options['positron'])

# Create a basis for calculations
basis = create_basis(
    molecule,
    electron_basis='cc-pVTZ',
    positron_basis='positron-cc-pVTZ'
)
```

**Implementation Details:**
- **Key Classes/Functions:**
  - `get_basis_options()`: Returns a dictionary of available basis sets.
  - `create_basis()`: Factory function that returns a `BasisSet` object.
  - `BasisSet`: Class representing a complete basis for calculations.
  - `ElectronBasisSet` and `PositronBasisSet`: Specialized subclasses.

- **Important Parameters for create_basis():**
  - `molecule`: A `MolecularData` object defining the system.
  - `electron_basis` (str): Name of the basis set for electrons.
  - `positron_basis` (str): Name of the basis set for positrons.
  - `add_diffuse` (bool): Whether to add extra diffuse functions (default: True for positrons).
  - `polarization_level` (int): Level of polarization functions to include (default: 1).

- **BasisSet Methods:**
  - `get_num_functions()`: Returns the total number of basis functions.
  - `get_overlap_matrix()`: Computes the overlap matrix.
  - `get_functions_by_particle(particle_type)`: Returns functions for a specific particle type.
  - `evaluate_at_point(r, particle_type)`: Evaluates all basis functions at point r.

### How to Create Custom Basis Functions

```python
from antinature.core.basis import create_custom_basis, GaussianBasisFunction

# Define custom basis functions for positrons
custom_positron_functions = [
    GaussianBasisFunction(
        center=[0, 0, 0],
        angular_momentum=[0, 0, 0],  # s-type function
        exponents=[0.01, 0.03, 0.1, 0.3],
        coefficients=[0.2, 0.4, 0.3, 0.1]
    ),
    GaussianBasisFunction(
        center=[0, 0, 0],
        angular_momentum=[0, 0, 1],  # p-type function
        exponents=[0.05, 0.15, 0.45],
        coefficients=[0.3, 0.5, 0.2]
    )
]

# Create a basis with the custom functions
custom_basis = create_custom_basis(
    molecule,
    electron_basis='cc-pVDZ',
    custom_positron_functions=custom_positron_functions
)
```

**Implementation Details:**
- **Key Classes/Functions:**
  - `GaussianBasisFunction`: Class representing a contracted Gaussian basis function.
  - `create_custom_basis()`: Creates a basis set with custom functions.
  - `BasisFunction`: Abstract base class for all basis functions.

- **GaussianBasisFunction Parameters:**
  - `center` (ndarray): 3D coordinates of the function center.
  - `angular_momentum` (list/tuple): Defines the angular part [l,m,n] for x^l y^m z^n.
  - `exponents` (list): List of Gaussian exponents for the contracted function.
  - `coefficients` (list): List of contraction coefficients.
  - `normalization` (str): Type of normalization to use (default: 'standard').

- **GaussianBasisFunction Methods:**
  - `evaluate(r)`: Evaluates the function at point r.
  - `evaluate_gradient(r)`: Computes the gradient at point r.
  - `get_angular_type()`: Returns the angular type (s, p, d, etc.).
  - `get_quantum_numbers()`: Returns the quantum numbers for this function.

### How to Optimize Basis Set Parameters

```python
from antinature.utils import optimize_basis_parameters

# Optimize exponents for positron description
optimized_basis = optimize_basis_parameters(
    molecule,
    particle_type='positron',
    optimization_method='energy',  # Options: 'energy', 'density', 'annihilation'
    initial_basis='positron-cc-pVDZ'
)
```

**Implementation Details:**
- **Key Functions:**
  - `optimize_basis_parameters()`: Optimizes exponents for a given basis set.
  - `BasisOptimizer`: Internal class that performs the optimization.

- **Important Parameters:**
  - `molecule`: The molecular system to optimize for.
  - `particle_type` (str): Type of particle to optimize basis for ('electron' or 'positron').
  - `optimization_method` (str): What to optimize for ('energy', 'density', or 'annihilation').
  - `initial_basis` (str or BasisSet): Starting basis for optimization.
  - `optimizer` (str): Optimization algorithm ('nelder-mead', 'bfgs', 'genetic', etc.).
  - `max_iterations` (int): Maximum number of iterations (default: 100).
  - `exponent_bounds` (tuple): Min/max bounds for exponents (default: (0.001, 10.0)).

- **Return Value:**
  - Returns an optimized `BasisSet` object.
  - `optimized_basis.optimization_log` contains the optimization history.
  - `optimized_basis.figure_of_merit` contains the final optimized value.

## Creating and Manipulating Antimatter Molecules

### How to Create a Positronium Molecule

```python
from antinature.core.molecular_data import MolecularData

# Create positronium (the simplest case)
positronium = MolecularData.positronium()

# Create ortho-positronium (triplet state)
ortho_positronium = MolecularData.positronium(multiplicity=3)

# Create para-positronium (singlet state)
para_positronium = MolecularData.positronium(multiplicity=1)
```

**Implementation Details:**
- **Key Classes/Methods:**
  - `MolecularData`: Main class for representing molecular systems.
  - `MolecularData.positronium()`: Factory method for creating positronium systems.
  - `MolecularData.antihydrogen()`: Factory method for creating anti-hydrogen.

- **positronium() Parameters:**
  - `multiplicity` (int): Spin multiplicity, 1 for para-positronium, 3 for ortho-positronium.
  - `basis` (str): Basis set to use (default: 'positronium-aug-cc-pVTZ').
  - `include_annihilation` (bool): Whether to include annihilation interactions (default: True).
  - `excited_state` (int): Which excited state to target (default: 0, ground state).

- **MolecularData Attributes:**
  - `atoms`: List of atoms in the system.
  - `coordinates`: NumPy array of atomic coordinates.
  - `antimatter_particles`: List of antimatter particles.
  - `antimatter_coordinates`: NumPy array of antimatter particle coordinates.
  - `charge`: Total charge of the system.
  - `multiplicity`: Spin multiplicity of the system.
  - `name`: Name of the molecular system.

### How to Create Mixed Matter-Antimatter Systems

```python
import numpy as np
from antinature.core.molecular_data import MolecularData

# Create a hydrogen molecule with a positron
h2_positron = MolecularData(
    atoms=["H", "H"],
    coordinates=np.array([
        [0.0, 0.0, -0.35],
        [0.0, 0.0, 0.35]
    ]),
    antimatter_particles=["e+"],
    antimatter_coordinates=np.array([
        [0.0, 0.0, 1.5]
    ]),
    charge=0,
    multiplicity=2
)
```

**Implementation Details:**
- **MolecularData Constructor Parameters:**
  - `atoms` (list): List of atom symbols or atomic numbers.
  - `coordinates` (ndarray): Coordinates of atoms in Angstroms.
  - `antimatter_particles` (list): List of antimatter particle symbols ('e+', 'p+', etc.).
  - `antimatter_coordinates` (ndarray): Coordinates of antimatter particles.
  - `charge` (int): Net charge of the entire system.
  - `multiplicity` (int): Spin multiplicity (1 for singlet, 2 for doublet, etc.).
  - `name` (str, optional): Name for the system.
  - `description` (str, optional): Additional description.

- **Supported Antimatter Particles:**
  - `'e+'`: Positron
  - `'p+'`: Antiproton
  - `'μ+'`: Anti-muon
  - `'τ+'`: Anti-tau

- **Methods of MolecularData:**
  - `get_nuclear_repulsion_energy()`: Returns nuclear repulsion energy.
  - `get_particle_count(particle_type)`: Returns number of particles of the specified type.
  - `validate()`: Checks the system for consistency (charge balance, etc.).
  - `to_xyz()`: Converts to XYZ file format.
  - `save(filename)`: Saves the molecular data to a file.

### How to Optimize Geometries of Mixed Systems

```python
from antinature.utils import optimize_geometry

# Optimize the geometry of a mixed system
optimized_molecule = optimize_geometry(
    molecule,
    optimization_method='energy',
    optimizer='bfgs',
    convergence_threshold=1e-5
)

# Get the optimized coordinates
print("Optimized matter coordinates:")
print(optimized_molecule.coordinates)
print("Optimized antimatter coordinates:")
print(optimized_molecule.antimatter_coordinates)
```

**Implementation Details:**
- **Key Functions/Classes:**
  - `optimize_geometry()`: Optimizes the geometry of a molecular system.
  - `GeometryOptimizer`: Internal class that performs the optimization.

- **Important Parameters:**
  - `molecule`: The `MolecularData` object to optimize.
  - `optimization_method` (str): What to optimize for ('energy', 'binding_energy', 'annihilation').
  - `optimizer` (str): Algorithm - 'bfgs', 'nelder-mead', 'conjugate-gradient', etc.
  - `convergence_threshold` (float): Convergence criterion for optimization.
  - `max_iterations` (int): Maximum number of iterations (default: 100).
  - `optimize_matter` (bool): Whether to optimize positions of matter particles (default: True).
  - `optimize_antimatter` (bool): Whether to optimize positions of antimatter particles (default: True).
  - `fixed_atoms` (list): Indices of atoms to keep fixed during optimization.

- **Return Value:**
  - New `MolecularData` object with optimized geometry.
  - Attributes include:
    - `optimization_trajectory`: List of geometries during optimization.
    - `optimization_energies`: List of energies during optimization.
    - `optimization_forces`: Maximum forces at each step.
    - `optimization_converged`: Boolean indicating convergence.

## Running SCF and Correlation Calculations

### How to Run a Basic SCF Calculation

```python
from antinature.core.scf import run_scf

# Run a self-consistent field calculation
scf_result = run_scf(
    molecule,
    basis,
    hamiltonian,
    method='rhf',  # Options: 'rhf', 'uhf', 'rohf', 'ghf'
    max_iterations=100,
    convergence_threshold=1e-8
)

# Extract SCF energy and orbitals
print(f"SCF Energy: {scf_result['energy']:.6f} Hartree")
print(f"Convergence achieved: {scf_result['converged']}")
```

**Implementation Details:**
- **Key Functions/Classes:**
  - `run_scf()`: Main function to run SCF calculations.
  - `SCFDriver`: Base class for all SCF methods.
  - `RHF`, `UHF`, `ROHF`, `GHF`: Specialized SCF method classes.

- **Important Parameters:**
  - `molecule`: The `MolecularData` object.
  - `basis`: The `BasisSet` object.
  - `hamiltonian`: The `Hamiltonian` object.
  - `method` (str): Type of SCF - 'rhf' (restricted), 'uhf' (unrestricted), 'rohf' (restricted open-shell), or 'ghf' (generalized).
  - `max_iterations` (int): Maximum number of SCF cycles.
  - `convergence_threshold` (float): Convergence criterion for energy change.
  - `diis_start` (int): When to start DIIS acceleration (default: 3).
  - `diis_max` (int): Maximum number of DIIS vectors (default: 6).
  - `level_shift` (float): Energy level shift for convergence (default: 0.0).
  - `damping` (float): Damping factor for density matrix (default: 0.0).

- **Return Value (SCF Result Dictionary):**
  - `energy`: Total SCF energy
  - `converged`: Boolean indicating convergence
  - `num_iterations`: Number of iterations performed
  - `orbital_energies`: Eigenvalues of the Fock matrix
  - `orbital_coefficients`: Eigenvectors of the Fock matrix
  - `density_matrix`: Final density matrix
  - `fock_matrix`: Final Fock matrix
  - `overlap_matrix`: Overlap matrix
  - `scf_type`: String indicating the SCF method used

### How to Run Correlation Calculations

```python
from antinature.core.correlation import run_mp2, run_ci

# Run MP2 calculation using SCF results
mp2_result = run_mp2(
    molecule,
    basis,
    scf_result,
    include_annihilation=True
)
print(f"MP2 Correlation Energy: {mp2_result['correlation_energy']:.6f} Hartree")
print(f"MP2 Total Energy: {mp2_result['total_energy']:.6f} Hartree")

# Run Configuration Interaction calculation
ci_result = run_ci(
    molecule,
    basis,
    scf_result,
    ci_level='sdtq',  # singles, doubles, triples, quadruples
    max_iterations=50
)
print(f"CI Energy: {ci_result['energy']:.6f} Hartree")
```

**Implementation Details:**
- **Key Functions/Classes:**
  - `run_mp2()`: Runs MP2 (Møller-Plesset 2nd order) correlation.
  - `run_ci()`: Runs Configuration Interaction calculation.
  - `MP2Calculator`: Class that performs MP2 calculations.
  - `CIDriver`: Class that performs CI calculations.

- **MP2 Parameters:**
  - `molecule`, `basis`: The system and basis set.
  - `scf_result`: Result dictionary from SCF calculation.
  - `include_annihilation` (bool): Whether to include annihilation effects.
  - `frozen_core` (bool): Whether to freeze core orbitals (default: True).
  - `frozen_virtuals` (list): List of virtual orbitals to freeze.
  - `memory_optimization` (str): Memory usage strategy - 'low', 'medium', 'high'.
  - `explicit_correlation` (bool): Whether to use F12 explicit correlation (default: False).

- **CI Parameters:**
  - `ci_level` (str): Excitation level - 's' (singles), 'sd' (singles+doubles), 'sdt', 'sdtq', etc.
  - `max_iterations` (int): Maximum number of iterations for diagonalization.
  - `convergence_threshold` (float): Convergence criterion.
  - `davidson` (bool): Whether to use Davidson diagonalization (default: True).
  - `root` (int): Which root (eigenstate) to target (default: 0, ground state).
  - `max_space` (int): Maximum subspace size for iterative methods.

- **Return Value (MP2 Result):**
  - `correlation_energy`: MP2 correlation energy
  - `total_energy`: SCF energy + correlation energy
  - `amplitudes`: MP2 amplitudes (t_ijab)
  - `pair_energies`: Energy contributions from each orbital pair

- **Return Value (CI Result):**
  - `energy`: Total CI energy
  - `correlation_energy`: Correlation energy (CI energy - SCF energy)
  - `converged`: Whether convergence was achieved
  - `num_iterations`: Number of iterations performed
  - `ci_vector`: Final CI vector (expansion coefficients)
  - `natural_orbitals`: Natural orbitals from CI density matrix
  - `state_properties`: Dictionary of computed properties for the state

## Analysis and Visualization

### How to Calculate Annihilation Rates

```python
from antinature.utils import calculate_annihilation_rate, calculate_lifetime

# Calculate annihilation rate from wave function
annihilation_rate = calculate_annihilation_rate(result)
print(f"Annihilation rate: {annihilation_rate:.6e} s^-1")

# Calculate lifetime
lifetime = calculate_lifetime(result)
print(f"Lifetime: {lifetime:.4f} nanoseconds")
```

**Implementation Details:**
- **Key Functions/Classes:**
  - `calculate_annihilation_rate()`: Computes annihilation rate from calculation results.
  - `calculate_lifetime()`: Converts annihilation rate to lifetime.
  - `AnnihilationCalculator`: Internal class that performs the calculation.

- **Important Parameters:**
  - `result`: Result dictionary from SCF or post-SCF calculation.
  - `method` (str): Method for rate calculation - 'overlap', 'contact_density', or 'momentum_space'.
  - `enhancement_factor` (float): Empirical enhancement factor (default: 1.0).
  - `grid_level` (int): Integration grid quality level (default: 4).
  - `include_spin` (bool): Whether to include spin effects (default: True).

- **Return Values:**
  - `calculate_annihilation_rate()`: Annihilation rate in s^-1
  - `calculate_lifetime()`: Lifetime in nanoseconds

- **Additional Functions:**
  - `compute_contact_density(result)`: Computes electron-positron overlap density.
  - `compute_momentum_distribution(result)`: Computes momentum distribution of annihilating pair.
  - `compute_angular_correlation(result, angle_range)`: Computes angular correlation of annihilation radiation.

### How to Visualize Electron and Positron Densities

```python
from antinature.utils import plot_density, plot_orbital

# Plot electron density in xy-plane
plot_density(
    result,
    particle_type='electron',
    plane='xy',
    plane_value=0.0,
    resolution=100,
    filename='electron_density.png'
)

# Plot positron density in 3D
plot_density(
    result,
    particle_type='positron',
    plot_type='3d',
    isosurface_value=0.01,
    filename='positron_3d.png'
)

# Plot specific orbital
plot_orbital(
    result,
    orbital_index=0,  # HOMO
    particle_type='positron',
    plot_type='contour',
    filename='positron_homo.png'
)
```

**Implementation Details:**
- **Key Functions/Classes:**
  - `plot_density()`: Creates density plots from calculation results.
  - `plot_orbital()`: Creates orbital visualizations.
  - `DensityPlotter` and `OrbitalPlotter`: Internal classes that handle the visualization.

- **plot_density() Parameters:**
  - `result`: Result dictionary from calculation.
  - `particle_type` (str): Type of particle - 'electron', 'positron', or 'total'.
  - `plane` (str): Plane for 2D plots - 'xy', 'xz', or 'yz'.
  - `plane_value` (float): Coordinate of the plane.
  - `plot_type` (str): Type of plot - 'contour', 'heatmap', or '3d'.
  - `resolution` (int): Number of grid points in each dimension.
  - `colormap` (str): Matplotlib colormap name.
  - `filename` (str): Output filename for the plot.
  - `isosurface_value` (float): Density value for isosurfaces in 3D plots.

- **plot_orbital() Parameters:**
  - `orbital_index` (int): Index of the orbital to plot.
  - `phase_sign` (bool): Whether to show phase information by color (default: True).
  - `show_nodal_plane` (bool): Whether to highlight nodal planes (default: False).
  - `square` (bool): Whether to plot squared orbital (default: False).

- **Additional Visualization Functions:**
  - `plot_density_difference(result1, result2)`: Plots difference between two density distributions.
  - `create_density_animation(results, filename)`: Creates animation from a sequence of densities.
  - `plot_momentum_distribution(result)`: Plots momentum space distribution.
  - `save_cube_file(result, filename)`: Saves density or orbital data in cube format for external visualization.

### How to Extract and Analyze Physical Properties

```python
from antinature.utils import analyze_properties

# Extract various properties from a calculation result
properties = analyze_properties(
    result,
    include=[
        'energy',
        'dipole_moment',
        'charge_distribution',
        'annihilation_rate',
        'positron_binding'
    ]
)

# Print key properties
for key, value in properties.items():
    print(f"{key}: {value}")
```

**Implementation Details:**
- **Key Functions/Classes:**
  - `analyze_properties()`: Extracts and computes properties from calculation results.
  - `PropertyCalculator`: Base class for all property calculators.
  - Specialized calculator classes: `ElectricMomentCalculator`, `BindingEnergyCalculator`, etc.

- **Important Parameters:**
  - `result`: Result dictionary from calculation.
  - `include` (list): List of properties to calculate.
  - `grid_level` (int): Quality of integration grid for grid-based properties (default: 3).
  - `reference` (dict, optional): Reference calculation for relative properties.

- **Available Properties:**
  - `'energy'`: Total energy of the system.
  - `'dipole_moment'`: Electric dipole moment (vector and magnitude).
  - `'quadrupole_moment'`: Electric quadrupole moment tensor.
  - `'charge_distribution'`: Mulliken or natural population analysis.
  - `'annihilation_rate'`: Positron annihilation rate.
  - `'positron_binding'`: Positron binding energy (requires reference).
  - `'spin_density'`: Spin density distribution.
  - `'natural_orbitals'`: Natural orbitals and their occupations.
  - `'electron_density_moments'`: Moments of the electron density distribution.
  - `'positron_density_moments'`: Moments of the positron density distribution.

- **Methods for Customization:**
  - `register_property_calculator(name, calculator)`: Registers a custom property calculator.
  - `create_custom_property_calculator(property_function)`: Creates calculator from a function.

## Quantum Computing Integration

### How to Map Antimatter Problems to Quantum Circuits

```python
from antinature.qiskit_integration import map_to_quantum_circuit

# Map a positronium Hamiltonian to a quantum circuit
circuit, qubit_mapping = map_to_quantum_circuit(
    hamiltonian,
    mapping_type='jordan_wigner',
    num_qubits=4
)

# Print circuit information
print(f"Circuit depth: {circuit.depth()}")
print(f"Number of qubits: {circuit.num_qubits}")
print("Qubit mapping:", qubit_mapping)
```

**Implementation Details:**
- **Key Functions/Classes:**
  - `map_to_quantum_circuit()`: Maps Hamiltonian to a quantum circuit.
  - `HamiltonianMapper`: Internal class that handles the mapping.
  - `QubitOperatorConverter`: Converts Hamiltonians to qubit operators.

- **Important Parameters:**
  - `hamiltonian`: The `Hamiltonian` object to map.
  - `mapping_type` (str): Fermion-to-qubit mapping - 'jordan_wigner', 'parity', or 'bravyi_kitaev'.
  - `num_qubits` (int): Number of qubits to use.
  - `basis` (BasisSet, optional): Basis set for matrix elements.
  - `truncation_threshold` (float): Threshold for truncating small terms (default: 1e-6).
  - `include_annihilation` (bool): Whether to include annihilation terms (default: True).
  - `use_symmetries` (bool): Whether to exploit symmetries to reduce qubit count (default: True).

- **Return Values:**
  - `circuit`: Qiskit `QuantumCircuit` object.
  - `qubit_mapping`: Dictionary mapping orbital indices to qubit indices.

- **Additional Functions:**
  - `get_qubit_operator(hamiltonian)`: Converts Hamiltonian to a QubitOperator.
  - `get_unitary_circuit(hamiltonian, time)`: Creates time evolution circuit for the Hamiltonian.
  - `compress_circuit(circuit)`: Optimizes circuit depth and gate count.
  - `estimate_resources(hamiltonian)`: Estimates quantum resources required for simulation.

### How to Run Quantum Simulation of Antimatter Systems

```python
from antinature.qiskit_integration import run_vqe_simulation

# Run VQE simulation for positronium ground state
vqe_result = run_vqe_simulation(
    hamiltonian,
    ansatz_type='uccsd',
    optimizer='SPSA',
    backend='statevector_simulator',
    shots=1000
)

# Extract and print results
print(f"VQE Energy: {vqe_result['energy']:.6f} Hartree")
print(f"Circuit measurements: {vqe_result['measurements']}")
```

**Implementation Details:**
- **Key Functions/Classes:**
  - `run_vqe_simulation()`: Runs Variational Quantum Eigensolver simulation.
  - `VQESimulator`: Internal class that sets up and runs the VQE simulation.
  - `create_ansatz(type, num_qubits)`: Creates quantum circuit ansatz of specified type.

- **Important Parameters:**
  - `hamiltonian`: The `Hamiltonian` object to simulate.
  - `ansatz_type` (str): Type of ansatz circuit - 'uccsd', 'hwe' (hardware efficient), 'qaoa', etc.
  - `optimizer` (str): Classical optimizer - 'SPSA', 'COBYLA', 'L_BFGS_B', 'SLSQP', etc.
  - `backend` (str): Qiskit backend to use - 'statevector_simulator', 'qasm_simulator', or a real device name.
  - `shots` (int): Number of measurement shots for each circuit (for non-statevector backends).
  - `initial_parameters` (ndarray, optional): Initial ansatz parameters.
  - `max_iterations` (int): Maximum number of optimization iterations (default: 100).
  - `use_noise_model` (bool): Whether to use a noise model (default: False).
  - `noise_model` (NoiseModel, optional): Custom noise model for simulation.

- **Return Value (VQE Result Dictionary):**
  - `energy`: Optimized energy
  - `optimal_parameters`: Optimized circuit parameters
  - `circuit`: Final quantum circuit with optimal parameters
  - `optimizer_history`: List of energies during optimization
  - `measurements`: Measurement counts for final state
  - `correlation_energy`: Correlation energy (if reference energy is provided)
  - `fidelity`: State fidelity with exact solution (for statevector simulator)

- **Additional Functions:**
  - `estimate_vqe_runtime(hamiltonian, backend)`: Estimates runtime for VQE simulation.
  - `analyze_quantum_state(statevector)`: Analyzes quantum state properties.
  - `compute_energy_from_measurement(counts, hamiltonian)`: Computes energy from measurement results.
  - `get_optimal_measurement_settings(hamiltonian)`: Determines optimal measurement bases.

These how-to guides provide a detailed reference for accomplishing common tasks with the Antinature framework. For more complex operations or detailed explanations, please refer to the API documentation and example notebooks. 