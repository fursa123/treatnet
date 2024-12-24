import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler, label_binarize
from sklearn.dummy import DummyClassifier
from sklearn.metrics import accuracy_score, classification_report, roc_curve, auc
from sklearn.metrics import precision_score, recall_score, f1_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from numpy import interp
import pickle


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

    rf = RandomForestClassifier(random_state=42)
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5, 10]
    }

    grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=3, n_jobs=-1, verbose=2)
    grid_search.fit(x_train, y_train)
    best_rf = grid_search.best_estimator_

    y_predict = best_rf.predict(x_test)
    rate = accuracy_score(y_test, y_predict)
    print("Accuracy: ", rate)
    print("Classification Report:\n", classification_report(y_test, y_predict))

    # Cross-validation with stratified splits
    stratified_kfold = StratifiedKFold(n_splits=10, shuffle=True, random_state=40)
    scores = cross_val_score(best_rf, dataset, label, cv=stratified_kfold)
    print("Cross-Validation Scores: ", scores)
    print("Mean CV Accuracy: ", scores.mean())

    # Feature importance using permutation importance
    result = permutation_importance(best_rf, x_test, y_test, n_repeats=10, random_state=42, n_jobs=2)
    sorted_idx = result.importances_mean.argsort()

    plt.barh(attributes[sorted_idx], result.importances_mean[sorted_idx])
    plt.xlabel("Permutation Importance")
    plt.show()

    return best_rf, scaler


def plot_roc_curve(y_test, y_score, n_classes):
    # Binarize the output labels for multi-class ROC
    y_test_bin = label_binarize(y_test, classes=[0, 1, 2])
    
    fpr = dict()
    tpr = dict()
    roc_auc = dict()
    for i in range(n_classes):
        fpr[i], tpr[i], _ = roc_curve(y_test_bin[:, i], y_score[:, i])
        roc_auc[i] = auc(fpr[i], tpr[i])

    # Compute micro-average ROC curve and ROC area
    fpr["micro"], tpr["micro"], _ = roc_curve(y_test_bin.ravel(), y_score.ravel())
    roc_auc["micro"] = auc(fpr["micro"], tpr["micro"])

    plt.figure()
    plt.plot(fpr["micro"], tpr["micro"],
             label='micro-average ROC curve (area = {0:0.2f})'.format(roc_auc["micro"]),
             color='deeppink', linestyle=':', linewidth=4)

    for i in range(n_classes):
        plt.plot(fpr[i], tpr[i], lw=2, label='ROC curve of class {0} (area = {1:0.2f})'.format(i, roc_auc[i]))

    plt.plot([0, 1], [0, 1], 'k--', lw=2)
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic (ROC)')
    plt.legend(loc="lower right")
    plt.show()


# Function to evaluate and print model performance
def evaluate_model(model, x_test, y_test, model_name="Model"):
    y_predict = model.predict(x_test)
    y_score = model.predict_proba(x_test)
    
    accuracy = accuracy_score(y_test, y_predict)
    precision = precision_score(y_test, y_predict, average='weighted')
    recall = recall_score(y_test, y_predict, average='weighted')
    f1 = f1_score(y_test, y_predict, average='weighted')

    print(f"Results for {model_name}:")
    print("Accuracy: ", accuracy)
    print("Precision: ", precision)
    print("Recall: ", recall)
    print("F1 Score: ", f1)
    print("Classification Report:\n", classification_report(y_test, y_predict))
    
    # Plot ROC curve
    plot_roc_curve(y_test, y_score, n_classes=3)


# Load data and split
matrix, label, attributes = file2matrix()
x_train, x_test, y_train, y_test = train_test_split(matrix, label, test_size=0.2, random_state=40, stratify=label)
scaler = StandardScaler()
x_train = scaler.fit_transform(x_train)
x_test = scaler.transform(x_test)

# Baseline Model
baseline_model = DummyClassifier(strategy="most_frequent")
baseline_model.fit(x_train, y_train)

# Cross-validation for baseline model
stratified_kfold = StratifiedKFold(n_splits=10, shuffle=True, random_state=40)
baseline_cv_scores = cross_val_score(baseline_model, matrix, label, cv=stratified_kfold)
print("Baseline Model Cross-Validation Scores: ", baseline_cv_scores)
print("Baseline Model Mean CV Accuracy: ", baseline_cv_scores.mean())

evaluate_model(baseline_model, x_test, y_test, model_name="Baseline Model")

# Current Model (Random Forest)
model, scaler = build_model(matrix, label)
evaluate_model(model, x_test, y_test, model_name="Current Random Forest Model")
