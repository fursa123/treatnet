import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report, accuracy_score, roc_curve, auc
import matplotlib.pyplot as plt
from sklearn.preprocessing import label_binarize
from sklearn.multiclass import OneVsRestClassifier

# Load the dataset
df = pd.read_csv('../lung cancer data sets.csv')

# Prepare features and target variable
X = df.drop(["Patient Id", "Level"], axis=1)
y = df["Level"]

# Encode the target variable
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y)

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize the model
model = DecisionTreeClassifier(random_state=42)

# Perform cross-validation
cv_scores = cross_val_score(model, X_train, y_train, cv=5)

# Train the model
model.fit(X_train, y_train)

# Predict on the test set
y_pred_proba = model.predict_proba(X_test)  # Probabilities for each class

# Binarize the output
y_test_binarized = label_binarize(y_test, classes=range(len(label_encoder.classes_)))

# Compute ROC curve and ROC area for each class
plt.figure()
for i in range(len(label_encoder.classes_)):
    fpr, tpr, _ = roc_curve(y_test_binarized[:, i], y_pred_proba[:, i])
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, lw=2, label='Class %d (area = %0.2f)' % (i, roc_auc))

plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver Operating Characteristic (ROC) Curve')
plt.legend(loc='lower right')
plt.show()

# Print results
print("Accuracy:", accuracy_score(y_test, model.predict(X_test)))
print("Classification Report:\n", classification_report(y_test, model.predict(X_test), target_names=label_encoder.classes_))
print("Mean Cross-Validation Accuracy:", cv_scores.mean())
print("Cross-Validation Scores:", cv_scores)
