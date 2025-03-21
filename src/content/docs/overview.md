# Antinature Documentation

## Welcome to Antinature

Antinature is an open-source Python framework dedicated to studying antimatter systems through computational quantum chemistry approaches. The framework provides a comprehensive suite of tools for modeling, simulating, and analyzing antimatter and mixed matter-antimatter systems with high accuracy and performance.

### What is Antinature?

Antinature enables researchers and scientists to investigate exotic quantum systems involving positrons, antiprotons, and their interactions with regular matter. The framework builds upon established quantum chemistry methodologies while extending them to handle the unique physics of antimatter particles.

### Key Capabilities

- **Advanced Antimatter Modeling**: Specialized algorithms for positrons, antiprotons, and their bound states
- **Positronium Simulations**: Accurate modeling of electron-positron bound systems
- **Mixed Systems**: Study of matter-antimatter interactions in complex molecular configurations
- **Annihilation Dynamics**: Calculation of annihilation rates and lifetimes for antimatter systems
- **Quantum Computing Integration**: Leverage quantum algorithms for antimatter simulations

## Getting Started

To begin using Antinature, follow these steps:

1. **Installation**:
   ```bash
   # Basic installation
   pip install antinature

   # Installation with quantum computing features
   pip install antinature[qiskit]

   # Full installation with all features and development tools
   pip install antinature[all]
   ```

2. **Basic Usage**:
   ```python
   import numpy as np
   from antinature.core.molecular_data import MolecularData
   from antinature.utils import create_antinature_calculation

   # Create a positronium system
   positronium = MolecularData.positronium()

   # Run a basic calculation
   result = create_antinature_calculation(
       positronium,
       basis_options={'quality': 'high'},
       calculation_options={'include_annihilation': True}
   )

   # Print results
   print(f"Ground state energy: {result['energy']:.6f} Hartree")
   print(f"Annihilation rate: {result['annihilation_rate']:.6e} s^-1")
   ```

3. **Explore the tutorials** to learn more about Antinature's capabilities

## Tutorials

Our tutorials guide you through the key features of Antinature, starting from basic concepts and progressing to advanced applications:

1. [**Introduction to Antimatter Quantum Chemistry**](tutorial-1.md)
   - Conceptual overview of antimatter systems
   - Setting up your first positronium calculation
   - Understanding and interpreting basic results

2. [**Working with Positronium**](tutorial-2.md)
   - Computing ground and excited states of positronium
   - Calculating annihilation rates and lifetimes
   - Visualizing positronium orbitals and density distributions

3. [**Basic Mixed Matter-Antimatter Systems**](tutorial-3.md)
   - Setting up calculations for hydrogen with a positron
   - Exploring positron binding energies
   - Analyzing the effect of nuclear charge on positron affinity

4. [**Advanced Basis Set Selection**](tutorial-4.md)
   - Choosing appropriate basis sets for electrons and positrons
   - Convergence studies with increasing basis set size
   - Using explicitly correlated basis functions for electron-positron pairs

5. [**Relativistic Effects in Antimatter Calculations**](tutorial-5.md)
   - Setting up relativistic calculations for antimatter
   - Comparing non-relativistic vs relativistic results
   - Understanding the importance of relativistic effects in antimatter annihilation

6. [**Quantum Computing for Antimatter Simulations**](tutorial-6.md)
   - Mapping antimatter systems to quantum circuits
   - Running antimatter simulations on quantum computers
   - Hybrid quantum-classical approaches for positronium

## How It Works

Antinature operates on the principles of quantum chemistry and particle physics, extending traditional electronic structure methods to accommodate antimatter particles. The framework:

1. Constructs specialized Hamiltonians that account for matter-antimatter interactions
2. Implements modified basis sets optimized for positronic and antiprotonic systems
3. Utilizes adapted self-consistent field (SCF) methods for mixed-particle systems
4. Incorporates annihilation operators and relativistic corrections essential for antimatter
5. Provides analysis tools for extracting physical observables specific to antimatter systems

## Core Components

### Molecular Data

The `MolecularData` class is the central object for defining antimatter systems:

```python
# Create a hydrogen atom with a positron
hydrogen_pos = np.array([0.0, 0.0, 0.0])
h_pos_system = MolecularData(
    atoms=[('H', hydrogen_pos)],
    n_electrons=1,
    n_positrons=1,
    charge=0,
    multiplicity=2
)
```

### Basis Sets

Specialized basis sets for antimatter particles:

```python
from antinature.core.basis import MixedMatterBasis

# Create a mixed basis with different qualities for electrons and positrons
basis = MixedMatterBasis()
basis.create_for_molecule(
    molecule.atoms,
    e_quality='standard',
    p_quality='extended'  # More diffuse functions for positrons
)
```

### Hamiltonians

Extended Hamiltonians accounting for matter-antimatter interactions:

```python
from antinature.core.hamiltonian import AntinatureHamiltonian

hamiltonian = AntinatureHamiltonian(
    molecular_data=molecule,
    basis_set=basis,
    integral_engine=integral_engine,
    include_annihilation=True,  # Include annihilation effects
    include_qed_corrections=True  # Include QED corrections
)
```

### Self-Consistent Field (SCF) Solvers

Adapted SCF methods for mixed systems:

```python
from antinature.core.scf import AntinatureSCF

scf_solver = AntinatureSCF(
    hamiltonian=hamiltonian_matrices,
    molecular_data=molecule,
    basis_set=basis,
    max_iterations=100,
    convergence_threshold=1e-6
)

scf_solver.solve_scf()
energy = scf_solver.compute_energy()
```

### Analysis Tools

Specialized tools for analyzing antimatter systems:

```python
from antinature.specialized import AnnihilationOperator

# Calculate annihilation properties
ann_operator = AnnihilationOperator(
    basis_set=basis,
    wavefunction=wavefunction
)

ann_result = ann_operator.calculate_annihilation_rate()
print(f"Annihilation rate: {ann_result['rate']:.4e} s^-1")
print(f"Lifetime: {ann_result['lifetime']:.4e} s")
```

## Applications

Antinature can be applied to a wide range of scientific problems, including:

- **Fundamental Physics**: Study of positronium, antihydrogen, and other exotic antimatter systems
- **Materials Science**: Positron annihilation lifetime spectroscopy (PALS) for materials characterization
- **Astrophysics**: Modeling antimatter behavior in extreme astrophysical environments
- **Medical Physics**: Understanding positron interactions relevant to PET imaging
- **Quantum Technology**: Exploring matter-antimatter interfaces for novel quantum applications

## Current Status and Roadmap

Antinature is currently at version 0.1.0 with the following features:

- Core framework implementation
- Positronium simulation capabilities
- Small mixed systems support
- Basic analysis tools

Upcoming features include:
- Enhanced correlation methods
- Expanded basis set library
- Advanced relativistic treatments
- Performance improvements

See the [Release Notes](releasenotes.md) for more details.

## Contributing

We welcome contributions from the scientific community! Please see our [Contributor Guide](contibuterguide.md) for information on how to get involved.

## Resources

- **[Tutorials](Tutorials%20will%20be%20added%20through%20ipynb%20files.md)**: Step-by-step guides to using Antinature
- **[Examples](examples%20will%20be%20added%20through%20ipynb%20files.md)**: Example calculations and use cases
- **[How-To Guides](howtos.md)**: Focused guides for specific tasks
- **[Theory](theory.md)**: Detailed theoretical background

## Citation

If you use Antinature in your research, please cite:

```
@software{antinature2025,
  author = {mk0dz},
  title = {Antinature: A Framework for Antimatter Quantum Chemistry},
  year = {2025},
  url = {https://github.com/YOUR-USERNAME/antinature}
}
```

## License

Antinature is released under the [MIT License](LICENSE).
