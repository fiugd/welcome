## Evolution


this started as a simple js script that modified itself, but then....

[Explore Instruction Sets and Hybrid Architectures](https://chatgpt.com/share/675875e2-e880-8004-9b25-f2d847fb057b)


### Self-Modifying Code Virtual Machine

##### Components
- **Instructions**  
  - Phenotype → Developmental  
  - Genotype → Mutation  

- **Storage**  
  - Dumb, just exists, with no concept of what it is  

- **Graph**  
  - Links to other nodes with a weighted edge  

---

#### Details

### Storage
- Passive, with no inherent logic
- serves as resource for instructions

### Instructions
- Perform operations (e.g., functions, maps)
- Can be tied to storage
- can specify graph nodes?
- types:
    1. Affect output
    2. Affect self

### Graph Nodes
- Connect to other graph nodes
- Take an input and output to other nodes based on weight
- Weights can be adjusted