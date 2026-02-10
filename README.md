# MSTC BSNL PDF Downloader (Apify Actor)

This actor automatically:

- Crawls MSTC auction listing pages  
- Finds links containing BSNL-related keywords  
- Clicks/opens them to detect PDF responses  
- Downloads PDF files  
- Stores them in Apify Key-Value storage  

## Input Fields
- **startUrl** (default MSTC auction page)  
- **keywords** → ["BSNL", "Bharat Sanchar Nigam", "SSA"]  
- **maxDepth** → Recursive depth for crawling  

## How it Works
1. Loads page  
2. Scans all `<a>` tags  
3. Matches text/href/onclick against BSNL keywords  
4. Enqueues target links  
5. If response is PDF → saves it  

## Output
- All PDF files saved inside Apify Storage  
- JSON summary in default key-value store  
