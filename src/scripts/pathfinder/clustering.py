from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import MaxAbsScaler
import matplotlib.pyplot as plt

import pandas as pd
import numpy as np
import os
scaler = MinMaxScaler()
CLUSTERS = 38

# import data of one set
# returns a dataframe of time, x, y, and name
# optional -1 param for inversed attributes
def getData(name, scale=1):
    allData = pd.DataFrame(0, [], columns=["time", "x", "y", "value"]) 
    for i in range(30):
        data = pd.read_csv(os.path.join("..","..","..","data",name+'_data_day_'+str(i+1)+'.csv'), usecols=[1,2,3])
        data = data.dropna().sort_values(by=["x", "y"])
        data["time"] = i
        allData = pd.concat([allData, data], ignore_index=True)
    allData["value"] = (allData["value"] - allData["value"].mean()) / allData["value"].std()

    allData["value"] = allData["value"] * scale

    return allData.rename(columns={"value": name})


# ok since the resource values overlap, each data point is a 6-tuple (or 9-tuple if informational data is used)
# therefore the data comes as a cube of x, y, and time
def getDataCube():
    # create the 30x100x100 cube
    map = pd.DataFrame({"time": range(30)})
    map = map.merge(pd.DataFrame({"x": range(100)}), how='cross')
    map = map.merge(pd.DataFrame({"y": range(100)}), how='cross')
   
    # fill with values 
    map = pd.merge(map, getData("metal"), on=["time", "x", "y"])
    map = pd.merge(map, getData("helium"), on=["time", "x", "y"])
    map = pd.merge(map, getData("oil"), on=["time", "x", "y"])
    map = pd.merge(map, getData("coral", -1), on=["time", "x", "y"])
    map = pd.merge(map, getData("species", -1),  on=["time", "x", "y"])
    # more data values can be used

    return map


def kmeans_train(data):
    '''train the kmeans to get clusters'''
    data = data.drop("time", axis=1)
    prep = MaxAbsScaler()
    kmeans = KMeans(n_clusters=CLUSTERS, random_state=0, max_iter=10000, n_init='auto')
    
    scaled_data = prep.fit_transform(data)
    kmeans.fit(scaled_data)
    return kmeans

def retrieveData():
    '''main retrieval function that should be used
    combines the above functions'''
    map = getDataCube()
    clusters = kmeans_train(map)
    map["cluster"] = clusters.labels_
    map.groupby(['cluster'])
    
    x_p = ((map.x.values == 0)[99:].argmax())
    hmap = map.loc[map["time"] == 20]
    hmap = hmap.to_numpy()

    dmap = np.zeros((100,100))

    for row in hmap:
        dmap[int(row[1])][int(row[2])] = 1#row[8]
   
    mask = dmap

    return map, mask

if __name__=="__main__":
    (map, mask) = retrieveData()
    
    
    x_p = ((map.x.values == 0)[99:].argmax())
    hmap = map.loc[map["time"] == 20]
    hmap = hmap.to_numpy()

    dmap = np.zeros((100,100))

    for row in hmap:
        dmap[int(row[1])][int(row[2])] = row[8]

    
    plt.imshow(dmap, cmap='hot', interpolation='nearest')
    #plt.scatter(dmap)

    plt.show()
