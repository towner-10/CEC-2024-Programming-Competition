# CEC 2024 team Castle

## Requirements
- node.js >=20.11.1
- python >= 3.12.2

### Packages for node

### Packages for python 
- scikit-learn >= 1.3
- pandas >= 2.1
- numpy >= 1.26
- matplotlib >= 3.8.0

## Thoughts on improvements
- Weighted k-means
> we are currently using unweighted k-means, as it is less complex and better suits the time we have to build. However, a weighted k-means would likely find more optimal clusters, so with more time we would utilize that instead.

- after using k means
> we currently just choose the largest cluster. Ideally it would be the densest cluster, but that would take a bit more work. This was an active decision we made to save time.
