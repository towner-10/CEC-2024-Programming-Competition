import math

def get_distance(point1, point2):
    '''Get the distance between two points in 2D space using the Euclidean distance formula'''
    return math.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)

def density_approximator(points: list):
    '''Approximate density as the average distance between all points in the list of points'''
    distances = []

    # Get all distances between all points
    for point in points:
        for other_point in points:
            if point != other_point:
                distances.append(get_distance(point, other_point))

    # Return average of distances in distances list
    return sum(distances) / len(distances)
