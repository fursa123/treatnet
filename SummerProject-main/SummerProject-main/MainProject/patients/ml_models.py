import os
import pickle

# 获取项目的根路径
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 模型路径
MODEL_PATH = os.path.join(BASE_DIR, 'lung_cancer_model.pkl')
MODEL_PATH2 = os.path.join(BASE_DIR, 'bowel_cancer_model.pkl')
MODEL_PATH3 = os.path.join(BASE_DIR, 'breast_cancer_model.pkl')
MODEL_PATH4 = os.path.join(BASE_DIR, 'ovarian_cancer_model.pkl')
MODEL_PATH5 = os.path.join(BASE_DIR, 'prostate_cancer_model.pkl')

# 加载模型
with open(MODEL_PATH, 'rb') as f:
    model, scaler = pickle.load(f)

with open(MODEL_PATH2, 'rb') as f:
    bowel_model, bowel_scaler = pickle.load(f)

with open(MODEL_PATH3, 'rb') as f:
    breast_model, breast_scaler = pickle.load(f)

with open(MODEL_PATH4, 'rb') as f:
    ovarian_model, ovarian_scaler = pickle.load(f)

with open(MODEL_PATH5, 'rb') as f:
    prostate_model, prostate_scaler = pickle.load(f)
