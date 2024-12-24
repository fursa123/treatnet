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
    age = np.random.randint(40, 80)  # Age between 40 and 80, as prostate cancer is more common in older men
    gender = 1  # All male for prostate cancer
    family_history = np.random.randint(1, 8)
    high_fat_diet = np.random.randint(1, 8)
    red_meat_consumption = np.random.randint(1, 8)
    smoking = np.random.randint(1, 8)
    alcohol_consumption = np.random.randint(1, 8)
    obesity = np.random.randint(1, 8)
    physical_activity = np.random.randint(1, 8)
    psa_levels = np.random.randint(1, 8)  # Prostate-Specific Antigen levels
    urinary_symptoms = np.random.randint(1, 8)
    erectile_dysfunction = np.random.randint(1, 8)
    blood_in_urine = np.random.randint(1, 8)
    bone_pain = np.random.randint(1, 8)
    unexplained_weight_loss = np.random.randint(1, 8)
    fatigue = np.random.randint(1, 8)

    # Risk level based on a weighted sum of symptoms and risk factors
    risk_score = (
        family_history + high_fat_diet + red_meat_consumption + smoking +
        alcohol_consumption + obesity + physical_activity * -1 + psa_levels +
        urinary_symptoms + erectile_dysfunction + blood_in_urine + bone_pain +
        unexplained_weight_loss + fatigue
    )
    
    if risk_score >= 60:
        risk_level = "High"
    elif risk_score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"
    
    data.append([
        i, patient_id, age, gender, family_history, high_fat_diet, red_meat_consumption,
        smoking, alcohol_consumption, obesity, physical_activity, psa_levels,
        urinary_symptoms, erectile_dysfunction, blood_in_urine, bone_pain,
        unexplained_weight_loss, fatigue, risk_level
    ])

# Define column names
columns = [
    "index", "Patient Id", "Age", "Gender", "Family History", "High Fat Diet",
    "Red Meat Consumption", "Smoking", "Alcohol Consumption", "Obesity",
    "Physical Activity", "PSA Levels", "Urinary Symptoms", "Erectile Dysfunction",
    "Blood in Urine", "Bone Pain", "Unexplained Weight Loss", "Fatigue", "Level"
]

# Create DataFrame
df = pd.DataFrame(data, columns=columns)

# Save to CSV
df.to_csv("prostate_cancer_data.csv", index=False)
