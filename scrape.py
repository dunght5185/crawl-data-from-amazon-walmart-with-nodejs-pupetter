import requests
from lxml import html
import csv

# Function to scrape Walmart product data
def scrape_walmart_product(url):
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Failed to retrieve data from {url}. Status code: {response.status_code}")
            return None

        tree = html.fromstring(response.text)

        title = tree.xpath('//h1[@itemprop="name"]')
        # price = tree.xpath('//*[@id="maincontent"]/section/main/div[2]/div[2]/div/div[2]/div/div[2]/div/div/span[1]/span[2]/span/text()')[0].strip()
        # product_details = tree.xpath('//*[@id="maincontent"]/section/main/div[2]/div[2]/div/div[1]/div/div/section[3]/section/section/div[2]/div/text()')[0].strip()
        # specifications = tree.xpath('//*[@id="maincontent"]/section/main/div[2]/div[2]/div/div[1]/div/div/section[5]/div[2]/div/div/text()')[0].strip()
        # # gtin = tree.xpath('//div[@class="product-specs"]/div[@class="specs-group"][2]/div[@class="specs-value"]/text()')[0].strip()
        # category = tree.xpath('//*[@id="maincontent"]/section/main/div[2]/div[1]/div/div/nav/ol/text()')[0].strip()

        print(response.text)
        return {
            'Title': title,
            # 'Price': price,
            # 'Product Details': product_details,
            # 'Specifications': specifications,
            # # 'GTIN': gtin,
            # 'Category': category
        }
    except Exception as e:
        print(f"Error scraping {url}: {str(e)}")
        return None

# Function to read URLs from a text file and scrape each one
def scrape_urls_from_file(filename):
    results = []
    with open(filename, 'r') as file:
        for line in file:
            url = line.strip()
            data = scrape_walmart_product(url)
            if data:
                results.append(data)
    return results

# Example: Read URLs from 'urls.txt' and scrape data
if __name__ == "__main__":
    filename = 'input-a.txt'  # Replace with the name of your text file containing Walmart product URLs
    scraped_data = scrape_urls_from_file(filename)

    # Write scraped data to a CSV file
    with open('walmart_data.csv', 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['Title', 'Price', 'Product Details', 'Specifications', 'GTIN', 'Category']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for product_data in scraped_data:
            writer.writerow(product_data)

    print("Scraping and data export complete.")
