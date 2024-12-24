export function getLungCancerQuestions() {
    return [
        {
            'id': 0,
            'topic': 'Age',
            'detailed_question': 'How old are you?',
            'choices': [],
            'value': []
        },
        {
            'id': 1,
            'topic': 'Sex',
            'detailed_question': 'What is your biological sex?',
            'choices': ['Male', 'Female'],
            'value': [1, 0]
        },
        {
            'id': 2,
            'topic': 'Air Pollution',
            'detailed_question': 'How much air pollution are you exposed to?',
            'choices': ['None', 'Low', 'Moderate', 'High', 'Very High'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 3,
            'topic': 'Alcohol use',
            'detailed_question': 'Do you drink alcohol? If so, how often?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 4,
            'topic': 'Dust Allergy',
            'detailed_question': 'Do you have a dust allergy? If so, how bad is it?',
            'choices': ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 5,
            'topic': 'Occupational Hazards',
            'detailed_question': 'How often are you exposed to asbestos, silica or diesel fumes?',
            'choices': ['None', 'Low', 'Moderate', 'High', 'Very High'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 6,
            'topic': 'Genetic Risk',
            'detailed_question': 'Do you have a family history of lung cancer?',
            'choices': ['None', 'Low', 'Moderate', 'High', 'Very High'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 7,
            'topic': 'Chronic Lung Disease',
            'detailed_question': 'Do you have a long-term lung disease? How severe is it?',
            'choices': ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 8,
            'topic': 'Balanced Diet',
            'detailed_question': 'How often do you eat a balanced diet?',
            'choices': ['None', 'Rarely', 'Sometimes', 'Often', 'Always'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 9,
            'topic': 'Obesity',
            'detailed_question': 'How would you describe your weight?',
            'choices': ['Not Obese', 'Slightly Obese (BMI 25-26)', 'Moderately Obese (BMI 26-30)', 'Highly Obese (BMI 30-35)', 'Very Highly Obese (BMI 35+)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 10,
            'topic': 'Smoking',
            'detailed_question': 'Do you smoke? If so, how often?',
            'choices': ['None', 'Rarely (monthly or yearly)', 'Occasionally (social/weekly)', 'Often (daily)', 'Very Often (more than one pack per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 11,
            'topic': 'Passive Smoker',
            'detailed_question': 'How often are you exposed to second-hand smoke?',
            'choices': ['Never', 'Rarely (monthly or yearly)', 'Occasionally (social/weekly)', 'Often (daily)', 'Very Often (more than one pack per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 12,
            'topic': 'Chest Pain',
            'detailed_question': 'Do you experience chest pain? If so, how often?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 13,
            'topic': 'Coughing of Blood',
            'detailed_question': 'Do you cough up blood. If so, how often?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 14,
            'topic': 'Fatigue',
            'detailed_question': 'How often do you feel really tired?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 15,
            'topic': 'Weight Loss',
            'detailed_question': 'Have you lost weight without trying?',
            'choices': ['Never', 'Mild (noticeable only with scales)', 'Moderate (noticeable with fit of clothes)', 'Severe (noticeable visibly)', 'Very Severe (underweight)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 16,
            'topic': 'Shortness of Breath',
            'detailed_question': 'How often do you have trouble breathing?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 17,
            'topic': 'Wheezing',
            'detailed_question': 'How often do you wheeze when breathing?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 18,
            'topic': 'Swallowing Difficulty',
            'detailed_question': 'Do you have trouble swallowing?',
            'choices': ['No Difficulty', 'Slight Difficulty', 'Moderate Difficulty', 'Severe Difficulty', 'Very Severe Difficulty'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 19,
            'topic': 'Clubbing of Finger Nails',
            'detailed_question': 'Have you noticed any changes in the shape of your fingernails, particularly rounding and bulging at the tip?',
            'choices': ['None', 'Mild (barely visible change)', 'Moderate (visible change)', 'Severe (significant change in multiple fingernails)', 'Very Severe (all nails)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 20,
            'topic': 'Frequent Cold',
            'detailed_question': 'How often do you get colds?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 21,
            'topic': 'Dry Cough',
            'detailed_question': 'How often do you have a dry cough?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 22,
            'topic': 'Snoring',
            'detailed_question': 'How often do you snore?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
    ]
}

export function getBowelCancerQuestions() {
    return [
        {
            'id': 0,
            'topic': 'Age',
            'detailed_question': 'How old are you?',
            'choices': [],
            'value': []
        },
        {
            'id': 1,
            'topic': 'Sex',
            'detailed_question': 'What is your biological sex?',
            'choices': ['Male', 'Female'],
            'value': [1, 0]
        },
        {
            'id': 2,
            'topic': 'Family history',
            'detailed_question': 'Do you have a family history of bowel cancer?',
            'choices': ['None', 'Low', 'Moderate', 'High', 'Very High'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 3,
            'topic': 'High Fiber Diet',
            'detailed_question': 'How often do you eat foods that are high in fiber?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 4,
            'topic': 'Red Meat Consumption',
            'detailed_question': 'How often do you consume red meat?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 5,
            'topic': 'Smoking',
            'detailed_question': 'Do you smoke? If so, how often?',
            'choices': ['None', 'Rarely (monthly or yearly)', 'Occasionally (social/weekly)', 'Often (daily)', 'Very Often (more than one pack per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 6,
            'topic': 'Alcohol Consumption',
            'detailed_question': 'Do you drink alcohol? If so, how often?',
            'choices': ['None', 'Rarely (monthly or yearly)', 'Occasionally (social/weekly)', 'Often (daily)', 'Very Often (more than one pack per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 7,
            'topic': 'Obesity',
            'detailed_question': 'How would you describe your weight?',
            'choices': ['Not Obese', 'Slightly Obese (BMI 25-26)', 'Moderately Obese (BMI 26-30)', 'Highly Obese (BMI 30-35)', 'Very Highly Obese (BMI 35+)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 8,
            'topic': 'Physical Activity',
            'detailed_question': 'How often do you exercise?',
            'choices': ['None', 'Rarely (monthly or yearly)', 'Occasionally (social/weekly)', 'Often (daily)', 'Very Often (more than one pack per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 9,
            'topic': 'IBS',
            'detailed_question': 'Do you have IBS? If so, how severe are your symptoms?',
            'choices': ['None', 'Low', 'Moderate', 'Severe', 'Very Severe'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 10,
            'topic': 'Chronic Diarrhoea',
            'detailed_question': 'How often do you have diarrhoea?',
            'choices': ['None', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 11,
            'topic': 'Blood in Stool',
            'detailed_question': 'How often do you have blood in stool?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 12,
            'topic': 'Abdominal Pain',
            'detailed_question': 'How often do you have stomach pain?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 13,
            'topic': 'Unexplained Weight Loss',
            'detailed_question': 'Have you lost weight without trying?',
            'choices': ['Never', 'Mild (noticeable only with scales)', 'Moderate (noticeable with fit of clothes)', 'Severe (noticeable visibly)', 'Very Severe (underweight)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 14,
            'topic': 'Constipation',
            'detailed_question': 'How often do you have constipation?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 15,
            'topic': 'Frequent Urination',
            'detailed_question': 'How often do you need to urinate??',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 16,
            'topic': 'Fatigue',
            'detailed_question': 'How often do you feel really tired?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 17,
            'topic': 'Anemia',
            'detailed_question': 'How often do you experience symptoms of anemia, such as fatigue or weakness?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
    ]
}

export function getBreastCancerQuestions() {
    return [
        {
            'id': 0,
            'topic': 'Age',
            'detailed_question': 'What is your age?',
            'choices': [],
            'value': []
        },
        {
            'id': 1,
            'topic': 'Gender',
            'detailed_question': 'What is your gender?',
            'choices': ['Male', 'Female'],
            'value': [1, 0]
        },
        {
            'id': 2,
            'topic': 'Family history',
            'detailed_question': 'How would you rate your hazard from family history?',
            'choices': ['None', 'Low', 'Moderate', 'High', 'Very High'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 3,
            'topic': 'High Fat Diet',
            'detailed_question': 'How frequently do you have high fat diet?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 4,
            'topic': 'Hormone replacement therapy',
            'detailed_question': 'How frequently do you experience Hormone replacement therapy?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 5,
            'topic': 'Smoking',
            'detailed_question': 'How frequently do you smoke?',
            'choices': ['None', 'Rarely (monthly or yearly)', 'Occasionally (social/weekly)', 'Often (daily)', 'Very Often (more than one pack per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 6,
            'topic': 'Alcohol Consumption',
            'detailed_question': 'How frequently do you drink alcohol?',
            'choices': ['None', 'Rarely (monthly or yearly)', 'Occasionally (social/weekly)', 'Often (daily)', 'Very Often (more than one pack per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 7,
            'topic': 'Obesity',
            'detailed_question': 'How would you rate your level of obesity?',
            'choices': ['Not Obese', 'Slightly Obese (BMI 25-26)', 'Moderately Obese (BMI 26-30)', 'Highly Obese (BMI 30-35)', 'Very Highly Obese (BMI 35+)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 8,
            'topic': 'Physical Activity',
            'detailed_question': 'How often do you do physical activity?',
            'choices': ['None', 'Rarely (monthly or yearly)', 'Occasionally (social/weekly)', 'Often (daily)', 'Very Often (more than one pack per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 9,
            'topic': 'Lump in breast',
            'detailed_question': 'How would you rate your Lump in breast?',
            'choices': ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 10,
            'topic': 'Skin changes',
            'detailed_question': 'How would you rate your skin changes?',
            'choices': ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 11,
            'topic': 'Nipple discharge',
            'detailed_question': 'How often do you have nipple discharge?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 12,
            'topic': 'Nipple retraction',
            'detailed_question': 'How would you rate your skin retraction?',
            'choices': ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 13,
            'topic': 'Breast pain',
            'detailed_question': 'How severe is your Breast pain?',
            'choices': ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 14,
            'topic': 'Unexplained weight loss',
            'detailed_question': 'How severe is your unexplained weight loss?',
            'choices': ['Never', 'Mild (noticeable only with scales)', 'Moderate (noticeable with fit of clothes)', 'Severe (noticeable visibly)', 'Very Severe (underweight)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 15,
            'topic': 'Fatigue',
            'detailed_question': 'How often do you feel fatigued?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
    ]
}

export function getOvarianCancerQuestions() {
    return [{
        'id': 0,
        'topic': 'Age',
        'detailed_question': 'What is your age?',
        'choices': [],
        'value': []
    },
        {
            'id': 1,
            'topic': 'Gender',
            'detailed_question': 'What is your gender?',
            'choices': ['Male', 'Female'],
            'value': [1, 0]
        },
        {
            'id': 2,
            'topic': 'Family history',
            'detailed_question': 'How would you rate your hazard from family history?',
            'choices': ['None', 'Low', 'Moderate', 'High', 'Very High'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 3,
            'topic': 'High Fiber Diet',
            'detailed_question': 'How frequently do you have high fiber diet?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 4,
            'topic': 'Hormone replacement therapy',
            'detailed_question': 'How frequently do you consume red meat?',
            'choices': ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 5,
            'topic': 'Smoking',
            'detailed_question': 'How frequently do you smoke?',
            'choices': ['None', 'Rarely (monthly or yearly)', 'Occasionally (social/weekly)', 'Often (daily)', 'Very Often (more than one pack per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 6,
            'topic': 'Alcohol Consumption',
            'detailed_question': 'How frequently do you drink alcohol?',
            'choices': ['None', 'Rarely (monthly or yearly)', 'Occasionally (social/weekly)', 'Often (daily)', 'Very Often (more than one pack per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 7,
            'topic': 'Obesity',
            'detailed_question': 'How would you rate your level of obesity?',
            'choices': ['Not Obese', 'Slightly Obese (BMI 25-26)', 'Moderately Obese (BMI 26-30)', 'Highly Obese (BMI 30-35)', 'Very Highly Obese (BMI 35+)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 8,
            'topic': 'Physical Activity',
            'detailed_question': 'How often do you do physical activity?',
            'choices': ['None', 'Rarely (monthly or yearly)', 'Occasionally (social/weekly)', 'Often (daily)', 'Very Often (more than one pack per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 9,
            'topic': 'Pelvic pain',
            'detailed_question': 'How would you the severity of your Pelvic Pain?',
            'choices': ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 10,
            'topic': 'Abdominal bloating',
            'detailed_question': 'How frequently do you have diarrhea?',
            'choices': ['None', 'Rarely (monthly or yearly)', 'Occasionally', 'Often (daily)', 'Very Often (more than once per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 11,
            'topic': 'Urinary urgency',
            'detailed_question': 'How often do you experience an urgency to pee?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 12,
            'topic': 'Difficulty eating',
            'detailed_question': 'How often do you experience difficulty eating?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 13,
            'topic': 'Menstrual irregularities',
            'detailed_question': 'Do you have irregularities in mensturation?',
            'choices': ['Never', 'Rarely', 'Every Now and Then', 'Often', 'Always'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 14,
            'topic': 'Constipation',
            'detailed_question': 'How often do you suffer constipation?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 15,
            'topic': 'Unexplained weight loss',
            'detailed_question': 'How often do you have abnormally frequent urination?',
            'choices': ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 16,
            'topic': 'Fatigue',
            'detailed_question': 'How often do you feel fatigued?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        }]
}

export function getProstateCancerQuestions() {
    return [{
        'id': 0,
        'topic': 'Age',
        'detailed_question': 'What is your age?',
        'choices': [],
        'value': []
    },
        {
            'id': 1,
            'topic': 'Gender',
            'detailed_question': 'What is your gender?',
            'choices': ['Male', 'Female'],
            'value': [1, 0]
        },
        {
            'id': 2,
            'topic': 'Family history',
            'detailed_question': 'How would you rate your hazard from family history?',
            'choices': ['None', 'Low', 'Moderate', 'High', 'Very High'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 3,
            'topic': 'High Fiber Diet',
            'detailed_question': 'How frequently do you have high fiber diet?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 4,
            'topic': 'Red meat consumption',
            'detailed_question': 'How frequently do you consume red meat?',
            'choices': ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 5,
            'topic': 'Smoking',
            'detailed_question': 'How frequently do you smoke?',
            'choices': ['None', 'Rarely (monthly or yearly)', 'Occasionally (social/weekly)', 'Often (daily)', 'Very Often (more than one pack per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 6,
            'topic': 'Alcohol Consumption',
            'detailed_question': 'How frequently do you drink alcohol?',
            'choices': ['None', 'Rarely (monthly or yearly)', 'Occasionally (social/weekly)', 'Often (daily)', 'Very Often (more than one pack per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 7,
            'topic': 'Obesity',
            'detailed_question': 'How would you rate your level of obesity?',
            'choices': ['Not Obese', 'Slightly Obese (BMI 25-26)', 'Moderately Obese (BMI 26-30)', 'Highly Obese (BMI 30-35)', 'Very Highly Obese (BMI 35+)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 8,
            'topic': 'Physical Activity',
            'detailed_question': 'How often do you do physical activity?',
            'choices': ['None', 'Rarely (monthly or yearly)', 'Occasionally (social/weekly)', 'Often (daily)', 'Very Often (more than one pack per day)'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 9,
            'topic': 'PSA levels',
            'detailed_question': 'What is your PSA Level?',
            'choices': ['None', 'Low', 'Moderate', 'High', 'Very High'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 10,
            'topic': 'Urinary symptoms',
            'detailed_question': 'How frequently do you have changes in urinary habits or urinary symptoms?',
            'choices': ['None', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 11,
            'topic': 'Erectile dysfunction',
            'detailed_question': 'How often do you have erectile dysfunction?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 12,
            'topic': 'Blood in urine',
            'detailed_question': 'How often do you experience blood in the urine?',
            'choices': ['Never', 'Rarely', 'Occasionally', 'Often', 'Very Often'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 13,
            'topic': 'Bone pain',
            'detailed_question': 'How severe is your bone pain?',
            'choices': ['Never', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 14,
            'topic': 'Unexplained weight loss',
            'detailed_question': 'How severe is your weight loss?',
            'choices': ['No Weight loss', 'Mild', 'Moderate', 'Severe', 'Very Severe'],
            'value': [0, 2, 5, 7, 10]
        },
        {
            'id': 15,
            'topic': 'Fatigue',
            'detailed_question': 'How would you rate your level of fatigue?',
            'choices': ['None', 'Low', 'Moderate', 'High', 'Very High'],
            'value': [0, 2, 5, 7, 10]
        }]
}
