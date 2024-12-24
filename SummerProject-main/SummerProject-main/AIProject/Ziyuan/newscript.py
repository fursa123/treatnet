import subprocess

# List of scripts to run
scripts = [
    'decision_tree.py',
    'linear_regression.py',
    'logistic_regression.py',
    'naive_bayes.py',
    'svm.py'
]

# Run each script
for script in scripts:
    print(f"Running {script}...")
    subprocess.run(['python3', script], check=True)
    print(f"Finished {script}\n")
