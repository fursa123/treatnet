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
    age = np.random.randint(30, 80)  # Age between 30 and 80, as ovarian cancer can occur in a wide age range
    gender = 2  # All female for ovarian cancer
    family_history = np.random.randint(1, 8)
    high_fat_diet = np.random.randint(1, 8)
    hormone_replacement_therapy = np.random.randint(1, 8)
    smoking = np.random.randint(1, 8)
    alcohol_consumption = np.random.randint(1, 8)
    obesity = np.random.randint(1, 8)
    physical_activity = np.random.randint(1, 8)
    pelvic_pain = np.random.randint(1, 8)
    abdominal_bloating = np.random.randint(1, 8)
    urinary_urgency = np.random.randint(1, 8)
    difficulty_eating = np.random.randint(1, 8)
    menstrual_irregularities = np.random.randint(1, 8)
    constipation = np.random.randint(1, 8)
    unexplained_weight_loss = np.random.randint(1, 8)
    fatigue = np.random.randint(1, 8)

    # Risk level based on a weighted sum of symptoms and risk factors
    risk_score = (
        family_history + high_fat_diet + hormone_replacement_therapy + smoking +
        alcohol_consumption + obesity + physical_activity * -1 + pelvic_pain +
        abdominal_bloating + urinary_urgency + difficulty_eating + menstrual_irregularities +
        constipation + unexplained_weight_loss + fatigue
    )
    
    if risk_score >= 60:
        risk_level = "High"
    elif risk_score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"
    
    data.append([
        i, patient_id, age, gender, family_history, high_fat_diet, hormone_replacement_therapy,
        smoking, alcohol_consumption, obesity, physical_activity, pelvic_pain,
        abdominal_bloating, urinary_urgency, difficulty_eating, menstrual_irregularities,
        constipation, unexplained_weight_loss, fatigue, risk_level
    ])

# Define column names
columns = [
    "index", "Patient Id", "Age", "Gender", "Family History", "High Fat Diet",
    "Hormone Replacement Therapy", "Smoking", "Alcohol Consumption", "Obesity",
    "Physical Activity", "Pelvic Pain", "Abdominal Bloating", "Urinary Urgency",
    "Difficulty Eating", "Menstrual Irregularities", "Constipation", "Unexplained Weight Loss",
    "Fatigue", "Level"
]

# Create DataFrame
df = pd.DataFrame(data, columns=columns)

# Save to CSV
df.to_csv("ovarian_cancer_data.csv", index=False)
