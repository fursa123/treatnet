import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import random
from sklearn.neighbors import KNeighborsClassifier as KNN
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
from sklearn.inspection import permutation_importance

def file2matrix():
    df = pd.read_csv('../lung cancer data sets.csv')
    print("Number of duplicate rows: ", df.duplicated().sum())
    print("Number of duplicate Patient Ids: ", df['Patient Id'].duplicated().sum())
    
    # Preprocessing data
    df['Patient Id'] = df['Patient Id'].str.replace('P', '')
    df['Level'] = df['Level'].map({'Low': 0, 'Medium': 1, 'High': 2})
    
    # Convert all data to numeric
    data = df.iloc[:, 2:25].apply(pd.to_numeric)
    labels = df['Level'].apply(pd.to_numeric)
    
    print("Label distribution: ", np.bincount(labels))
    
    return data.values, labels.values, df.columns[2:25]

def build_model(dataset, label):
    x_train, x_test, y_train, y_test = train_test_split(dataset, label, test_size=0.2, random_state=40, stratify=label)
    scaler = StandardScaler()
    x_train = scaler.fit_transform(x_train)
    x_test = scaler.transform(x_test)
    knnClassifier = KNN(n_neighbors=3, algorithm='auto')
    knnClassifier.fit(x_train, y_train)
    y_predict = knnClassifier.predict(x_test)
    
    rate = accuracy_score(y_test, y_predict)
    print("Accuracy: ", rate)
    print("Classification Report:\n", classification_report(y_test, y_predict))

    # Cross-validation with stratified splits
    stratified_kfold = StratifiedKFold(n_splits=10, shuffle=True, random_state=40)
    scores = cross_val_score(knnClassifier, dataset, label, cv=stratified_kfold)
    print("Cross-Validation Scores: ", scores)
    print("Mean CV Accuracy: ", scores.mean())

    # Feature importance using permutation importance
    result = permutation_importance(knnClassifier, x_test, y_test, n_repeats=10, random_state=42, n_jobs=2)
    sorted_idx = result.importances_mean.argsort()

    plt.barh(attributes[sorted_idx], result.importances_mean[sorted_idx])
    plt.xlabel("Permutation Importance")
    plt.show()

if __name__ == '__main__':
    matrix, label, attributes = file2matrix()
    colors = ['green', 'blue', 'red']
    point_colors = [colors[int(i)] for i in label]
    
    plt.scatter(matrix[:, 3], matrix[:, 4], c=point_colors)
    plt.xlabel(attributes[3])
    plt.ylabel(attributes[4])
    plt.show()

    build_model(matrix, label)
