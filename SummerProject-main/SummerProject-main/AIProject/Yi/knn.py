import numpy as np
import matplotlib.pyplot as plt
from sklearn.neighbors import KNeighborsClassifier as KNN
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report


def file2matrix():
    file = open('../lung cancer data sets.csv')
    numberOfLines = len(file.readlines())
    returnMat = np.zeros((numberOfLines, 24))
    file = open('../lung cancer data sets.csv')
    attributes = file.readline().strip().split(',')
    index = 0
    for line in file.readlines():
        line = line.strip()
        listFromLine = line.split(',')
        for i in range(len(listFromLine)):
            if i == 1:
                listFromLine[i] = listFromLine[i].replace('P', '')
            if i == len(listFromLine) - 1:
                if listFromLine[i] == 'Low':
                    listFromLine[i] = 0
                elif listFromLine[i] == 'Medium':
                    listFromLine[i] = 1
                elif listFromLine[i] == 'High':
                    listFromLine[i] = 2
        returnMat[index, :] = listFromLine[2:26]
        index += 1
    return returnMat[:, 2:25], returnMat[:, -1], attributes[2:25]


def build_model(dataset, label):
    x_train, x_test, y_train, y_test = train_test_split(dataset, label, test_size=0.2, random_state=40)
    scaler = StandardScaler()
    x_train = scaler.fit_transform(x_train)
    x_test = scaler.transform(x_test)
    knnClassifier = KNN(n_neighbors=3, algorithm='auto')
    knnClassifier.fit(x_train, y_train)
    y_predict = knnClassifier.predict(x_test)
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_predict)
    precision = precision_score(y_test, y_predict, average='macro')
    recall = recall_score(y_test, y_predict, average='macro')
    f1 = f1_score(y_test, y_predict, average='macro')

    print("Accuracy: ", accuracy)
    print("Precision: ", precision)
    print("Recall: ", recall)
    print("F1 Score: ", f1)
    print("Classification Report:\n", classification_report(y_test, y_predict))
    
    # Cross-validation accuracy
    stratified_kfold = StratifiedKFold(n_splits=10, shuffle=True, random_state=40)
    cv_scores = cross_val_score(knnClassifier, dataset, label, cv=stratified_kfold)
    print("Cross-Validation Scores: ", cv_scores)
    print("Mean CV Accuracy: ", cv_scores.mean())


if __name__ == '__main__':
    matrix, label, attributes = file2matrix()
    colors = ['green', 'blue', 'red']
    point_colors = [colors[int(i)] for i in label]
    plt.scatter(matrix[:, 3], matrix[:, 4], c=point_colors)
    plt.xlabel(attributes[3])
    plt.ylabel(attributes[4])
    plt.show()

    build_model(matrix, label)
