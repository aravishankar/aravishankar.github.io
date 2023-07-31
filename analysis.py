import numpy as np
import pandas as pd

data = pd.read_csv("data/salaries.csv")
print(data['job_title'].value_counts().head(10))