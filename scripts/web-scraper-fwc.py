import requests
from bs4 import BeautifulSoup
import pdfplumber
import pandas as pd
from io import BytesIO

base_url = "https://myfwc.com"
reports_page = "https://myfwc.com/research/redtide/statewide/"

# Fetch the statewide red tide page
response = requests.get(reports_page)
response.raise_for_status()
soup = BeautifulSoup(response.text, "html.parser")

# Find all report links that end with .pdf
pdf_links = []
for link in soup.find_all("a", href=True):
    href = link["href"]
    if href.lower().endswith(".pdf"):
        if href.startswith("/"):
            href = base_url + href
        pdf_links.append(href)
pdf_links = pdf_links[:3]  # take first 3 PDFs
print("Found PDF links:", pdf_links)

def make_unique(columns):
    """Make duplicate column names unique by appending _1, _2, etc."""
    new_cols = []
    seen = {}
    for col in columns:
        col_str = str(col)
        if col_str in seen:
            seen[col_str] += 1
            new_cols.append(f"{col_str}_{seen[col_str]}")
        else:
            seen[col_str] = 0
            new_cols.append(col_str)
    return new_cols

all_tables = []

for url in pdf_links:
    response = requests.get(url)
    response.raise_for_status()

    source_name = url.split("/")[-1].replace(".pdf", "")
    with pdfplumber.open(BytesIO(response.content)) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            tables = page.extract_tables()
            for table in tables:
                df = pd.DataFrame(table)

                # --- CLEANUP START ---
                df.dropna(how="all", inplace=True)
                if df.empty:
                    continue

                # Make first row the header
                df.columns = df.iloc[0]
                df = df[1:].reset_index(drop=True)

                # Deduplicate column names
                df.columns = make_unique(df.columns)

                # Keep rows that contain numeric data
                df = df[df.apply(lambda row: any(
                    isinstance(cell, str) and any(c.isdigit() for c in cell) or isinstance(cell, (int, float))
                    for cell in row
                ), axis=1)]

                # Remove fully blank columns
                df.dropna(axis=1, how="all", inplace=True)

                if not df.empty:
                    df["Page"] = page_num
                    df["Source"] = source_name
                    all_tables.append(df)
                # --- CLEANUP END ---

# Combine all cleaned tables
if all_tables:
    final_df = pd.concat(all_tables, ignore_index=True)
    print(final_df.head())
    final_df.to_csv("fwc1_reports_cleaned.csv", index=False)
else:
    print("No valid tables found in PDFs.")