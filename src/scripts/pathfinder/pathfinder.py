import clustering
import numpy as np
import matplotlib.pyplot as plt
import os
import json
import math

SAVE_PATH = "./__datacache__/"

# cache clusters so we dont wait a bajillion hours
# delete __datacache__ to reset
def getClusters():
    if os.path.isfile(SAVE_PATH + "clusters.npy"):
        return (np.load(SAVE_PATH + "clusters.npy"), 
        np.load(SAVE_PATH + "mask.npy"))

    c, mask = clustering.retrieveData()
    c = c.to_numpy()
    mask = mask
    if not os.path.exists(SAVE_PATH):
        os.makedirs(SAVE_PATH)
    np.save(SAVE_PATH + "clusters.npy", c)
    np.save(SAVE_PATH + "mask.npy", mask)
    return c
(clusters, mask) = getClusters()

# find the best cluster
def cluster_stats():
    # ignore time, x, y
    cluster_vals = np.delete(clusters, [0,1,2], 1)
    cluster_vals = np.transpose(cluster_vals)
    # sort by cluster #
    cluster_vals = np.sort(cluster_vals, -1)

    # dont average the cluster label lol
    # get the average value for each map-time point
    cluster_labels = cluster_vals[-1]
    avgs = cluster_vals[:-1].mean(0)

    # cluster average
    cluster_avgs = np.array([0] * int(cluster_labels.max()+1), dtype="float32")
    cluster_pops = np.array([0] * int(cluster_labels.max()+1), dtype="float32")
    for i in range(len(cluster_labels)):
        cluster_avgs[int(cluster_labels[i])] += avgs[i]
        cluster_pops[int(cluster_labels[i])] += 1
    cluster_avgs /= cluster_pops

    return (cluster_avgs, cluster_pops, avgs, cluster_labels)

if __name__ == "__main__":
    (cluster_avgs, cluster_pops, avgs, labels) = cluster_stats()
    best_id = cluster_avgs.argmax() - 1
    
    best_mask = (clusters[:,-1] == best_id)
    best_cluster = clusters[best_mask, :]

    print(avgs.shape)
    avgs = avgs[best_mask]
    print(avgs.shape)
    
    # dont need the cluster id anymore
    best_cluster = np.delete(best_cluster, [-1], 1)
    best_cluster = np.sort(best_cluster, 0)

    print(best_cluster)
    print(best_cluster.shape)
    
    # filter by cluster
    #for i in range(30):
        #cMask= (best_cluster[:, 0] == 0)
        #best_cluster = best_cluster[cMask,:]

    dmap = np.zeros((100,100))

    for row in best_cluster:
        dmap
        dmap[int(row[1])][int(row[2])] = 255

    plt.imshow(dmap, cmap='hot', interpolation='nearest')
    plt.show()

    dmap = np.zeros((100,100))

    for row in clusters:
        dmap
        dmap[int(row[1])][int(row[2])] = row[5]

    dmap = dmap * mask

    plt.imshow(dmap, cmap='hot', interpolation='nearest')
    plt.show()

    path1 = []
    path2 = []

    points = [] 

    for row in best_cluster:
        if(row[0] >= len(points)):
            points.append([(row[1], row[2])])
            continue

        points[int(row[0])].append((row[1], row[2]))

    for i in range(30):
        for j in range(len(points[i])):
            if len(path2) <= i or (abs(path2[i][0] - points[i][j][0]) >= 2 and abs(path2[i][1] - points[i][j][1]) >= 2):
                 if(len(path1) == 0): 
                     path1.append(points[i][j])
                 elif len(path1) == i:
                     if abs(points[i][j][0] - path1[i-1][0]) <= 5 and abs(points[i][j][1] - path1[i-1][1]) <= 5:
                         path1.append((points[i][j][0],points[i][j][1]))

            if len(path1) <= i or (abs(path1[i][0] - points[i][j][0]) >= 2 and abs(path1[i][1] - points[i][j][1]) >= 2):
                if(len(path2) == 0): 
                    path2.append(points[i][j])
                elif len(path2) == i:
                    if abs(points[i][j][0] - path2[i-1][0]) <= 5 and abs(points[i][j][1] - path2[i-1][1]) <= 5:
                        path2.append(points[i][j])
            if j == (len(points[i]) - 1) and len(path2) <= i:
                if(i == 0): 
                    path2.append(points[i][j])
                    continue
                print("dsa")
                print(i)
                print(len(path2))
                path2.append((path2[-1][0]+2, path2[-1][1]+1))

    print(path1)
    print(len(path1))

    print(path2)
    print(len(path2))
    temp1 = []
    for p in path1:
        point = {"x": p[0], "y": p[1]}
        temp1.append(point)
    temp2 = []
    for p in path2:
        point = {"x": p[0], "y": p[1]}
        temp2.append(point)
    temp = {"first": temp1, "second": temp2}
    js = json.dumps(temp)

    f = open("../../frontend/src/assets/paths.json", "w")
    f.write(js)
    f.close()




        





    

