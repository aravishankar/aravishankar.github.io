import numpy as np
import pandas as pd

data = pd.read_csv("data/salaries.csv")
# print(data['salary_in_usd'].median())
# print(data['salary_in_usd'].mean())
dadata1 = data[data['experience_level'] == 'EN']
dadata2 = data[data['experience_level'] == 'MI']
dadata3 = data[data['experience_level'] == 'SE']
dadata4 = data[data['experience_level'] == 'EX']

print(dadata1[dadata1['work_year'] == 2021]['salary_in_usd'].mean())
print(dadata2[dadata2['work_year'] == 2021]['salary_in_usd'].mean())
print(dadata3[dadata3['work_year'] == 2021]['salary_in_usd'].mean())
print(dadata4[dadata4['work_year'] == 2021]['salary_in_usd'].mean())