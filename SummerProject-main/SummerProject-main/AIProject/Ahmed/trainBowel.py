import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
import pickle

def file2matrix():
    df = pd.read_csv('bowel_cancer_data.csv')
    print("Number of duplicate rows: ", df.duplicated().sum())
    print("Number of duplicate Patient Ids: ", df['Patient Id'].duplicated().sum())

    # Preprocessing data
    df['Patient Id'] = df['Patient Id'].str.replace('P', '')
    df['Level'] = df['Level'].map({'Low': 0, 'Medium': 1, 'High': 2})

    # Filter out rows where Level is extremely underrepresented
    df = df[df['Level'] != 2]  # Remove 'High' level with only 1 sample

    # Convert all data to numeric
    data = df.iloc[:, 2:20].apply(pd.to_numeric)
    labels = df['Level'].apply(pd.to_numeric)

    print("Label distribution: ", np.bincount(labels))

    return data.values, labels.values, df.columns[2:20]

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

def predict_risk(model, scaler, attributes):
    print("Enter the following details to predict bowel cancer risk:")
    user_input = []
    for attr in attributes:
        while True:
            try:
                value = float(input(f"{attr}: "))
                user_input.append(value)
                break
            except ValueError:
                print("Invalid input. Please enter a numeric value.")

    user_input = np.array(user_input).reshape(1, -1)
    user_input = scaler.transform(user_input)

    prediction = model.predict(user_input)
    risk_level = ["Low", "High", "High"]

    print(f"The predicted risk level is: {risk_level[int(prediction[0])]}")

if __name__ == '__main__':
    matrix, label, attributes = file2matrix()
    model, scaler = build_model(matrix, label)
    with open('bowel_cancer_model.pkl', 'wb') as f:
        pickle.dump((model, scaler), f)
    predict_risk(model, scaler, attributes)
