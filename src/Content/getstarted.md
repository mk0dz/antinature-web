# Getting Started with Antinature

This guide will help you quickly begin working with the Antinature framework for antimatter quantum chemistry simulations.

## Installation

Antinature can be installed using pip:

```bash
# Basic installation
pip install antinature

# Installation with quantum computing features
pip install antinature[qiskit]

# Full installation with all features and development tools
pip install antinature[all]
```

For development purposes, you can install directly from the source:

```bash
git clone https://github.com/mk0dz/antinature.git
cd antinature
pip install -e .[all]
```

## Basic Usage

### Creating a Simple Positronium Model

Here's a simple example to calculate the ground state of positronium:

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

### Working with Mixed Matter-Antimatter Systems

For more complex systems involving both matter and antimatter:

```python
from antinature.core.molecular_data import MolecularData
from antinature.utils import create_mixed_system

# Create a system with a hydrogen atom and a positron
h_plus_positron = MolecularData(
    atoms=["H"],
    coordinates=np.array([[0.0, 0.0, 0.0]]),
    antimatter_particles=["e+"],
    antimatter_coordinates=np.array([[0.0, 0.0, 1.0]]),  # 1 Å from the H atom
    charge=0,  # System is neutral: proton + electron + positron
    multiplicity=2  # Doublet state
)

# Run calculation
result = create_antinature_calculation(
    h_plus_positron,
    basis_options={
        'electron_basis': 'aug-cc-pVDZ',
        'positron_basis': 'positron-aug-cc-pVDZ'
    },
    calculation_options={
        'scf_method': 'rhf',
        'correlation_method': 'mp2',
        'include_relativistic': True
    }
)

# Analyze results
print(f"Binding energy: {result['binding_energy']:.6f} eV")
print(f"Positron density at nucleus: {result['positron_density'][0]:.6e}")
```

## Setting Up Calculation Parameters

### Choosing Basis Sets

Antinature provides specialized basis sets for antimatter particles:

```python
from antinature.core.basis import get_basis_options

# List available basis sets
all_bases = get_basis_options()
print("Available electron basis sets:", all_bases['electron'])
print("Available positron basis sets:", all_bases['positron'])

# Use a specific basis set combination
calculation_result = create_antinature_calculation(
    molecule,
    basis_options={
        'electron_basis': 'cc-pVTZ',
        'positron_basis': 'positron-cc-pVTZ',
        'explicit_correlation': True  # Add explicit e-p correlation terms
    }
)
```

### Configuring Hamiltonian Options

Customize the physics included in your calculation:

```python
from antinature.core.hamiltonian import create_hamiltonian

# Create a specialized Hamiltonian
hamiltonian = create_hamiltonian(
    molecule,
    include_annihilation=True,
    annihilation_cutoff=1e-6,
    include_relativistic=True,
    relativistic_order='second'  # First or second order corrections
)

# Use in calculation
result = create_antinature_calculation(
    molecule,
    custom_hamiltonian=hamiltonian
)
```

## Visualization and Analysis

Antinature includes tools for analyzing and visualizing results:

```python
from antinature.utils import plot_density, calculate_lifetime

# Plot electron and positron densities
plot_density(result, particle_type='electron', plane='xy', resolution=100)
plot_density(result, particle_type='positron', plane='xy', resolution=100)

# Calculate annihilation lifetime
lifetime = calculate_lifetime(result)
print(f"Predicted lifetime: {lifetime:.2f} nanoseconds")
```

## Next Steps

- Check the [Examples](examples.md) for more complex use cases
- Review the [Tutorials](tutorials.md) for step-by-step guides
- Explore the [How-To Guides](howtos.md) for specific tasks

For more detailed information on the theory behind Antinature, see the [Theory](theory.md) section. 