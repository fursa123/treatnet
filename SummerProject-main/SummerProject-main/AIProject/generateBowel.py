import pandas as pd
import numpy as np
import random

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

# Create synthetic data
data = []
for i in range(1000):
    patient_id = f"P{i+1}"
    age = np.random.randint(20, 80)  # Age between 20 and 80
    gender = np.random.randint(1, 3)  # 1 for male, 2 for female
    family_history = np.random.randint(1, 8)
    high_fiber_diet = np.random.randint(1, 8)
    red_meat_consumption = np.random.randint(1, 8)
    smoking = np.random.randint(1, 8)
    alcohol_consumption = np.random.randint(1, 8)
    obesity = np.random.randint(1, 8)
    physical_activity = np.random.randint(1, 8)
    ibs = np.random.randint(1, 8)  # Irritable Bowel Syndrome
    chronic_diarrhea = np.random.randint(1, 8)
    blood_in_stool = np.random.randint(1, 8)
    abdominal_pain = np.random.randint(1, 8)
    unexplained_weight_loss = np.random.randint(1, 8)
    constipation = np.random.randint(1, 8)
    frequent_urination = np.random.randint(1, 8)
    fatigue = np.random.randint(1, 8)
    anemia = np.random.randint(1, 8)

    # Risk level based on a weighted sum of symptoms and risk factors
    risk_score = (
        family_history + high_fiber_diet * -1 + red_meat_consumption + smoking +
        alcohol_consumption + obesity + physical_activity * -1 + ibs +
        chronic_diarrhea + blood_in_stool + abdominal_pain + unexplained_weight_loss +
        constipation + frequent_urination + fatigue + anemia
    )
    
    if risk_score >= 75:
        risk_level = "High"
    elif risk_score >= 50:
        risk_level = "Medium"
    else:
        risk_level = "Low"
    
    data.append([
        i, patient_id, age, gender, family_history, high_fiber_diet, red_meat_consumption,
        smoking, alcohol_consumption, obesity, physical_activity, ibs, chronic_diarrhea,
        blood_in_stool, abdominal_pain, unexplained_weight_loss, constipation, frequent_urination,
        fatigue, anemia, risk_level
    ])

# Define column names
columns = [
    "index", "Patient Id", "Age", "Gender", "Family History", "High Fiber Diet",
    "Red Meat Consumption", "Smoking", "Alcohol Consumption", "Obesity",
    "Physical Activity", "IBS", "Chronic Diarrhea", "Blood in Stool",
    "Abdominal Pain", "Unexplained Weight Loss", "Constipation", "Frequent Urination",
    "Fatigue", "Anemia", "Level"
]

# Create DataFrame
df = pd.DataFrame(data, columns=columns)

# Save to CSV
df.to_csv("bowel_cancer_data.csv", index=False)
